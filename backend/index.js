// index.js
import Fastify from "fastify";
import cors from "@fastify/cors";
import websocketPlugin from "@fastify/websocket";
import OpenAI from "openai";
import Redis from "ioredis";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config();

const fastify = Fastify({ logger: true });
await fastify.register(cors, { origin: true });
await fastify.register(websocketPlugin);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const redis = new Redis({
  // for Lists & Hashes
  host: process.env.REDIS_HOST,
  port: +process.env.REDIS_PORT,
});
const redisSub = new Redis({
  // **subscriber** for Pub/Sub
  host: process.env.REDIS_HOST,
  port: +process.env.REDIS_PORT,
});

const SESSION_TTL = 60 * 60; // seconds

// ──────────────────────────────────────────────────────────────────────────────
// PUB/SUB: fan-out each token (and the final "done") to all subscribed sockets
// ──────────────────────────────────────────────────────────────────────────────
const channelSubscribers = new Map();
// channelSubscribers: Map<string /* chan */, Set<WebSocket>>

redisSub.on("message", (chan, raw) => {
  const subs = channelSubscribers.get(chan);
  if (!subs) return;
  // broadcast to every live socket
  for (const socket of subs) {
    socket.send(raw);
  }
  // if it's a done message, you can optionally tear down the channel
  const msg = JSON.parse(raw);
  if (msg.type === "done") {
    channelSubscribers.delete(chan);
    redisSub.unsubscribe(chan);
  }
});

async function streamAndPublish(sessionId, model, content) {
  const bufKey = `sess:${sessionId}:buf`;
  const metaKey = `sess:${sessionId}:meta`;
  const chan = `sess:${sessionId}:chan`;

  let idx = 0;
  try {
    const stream = await openai.chat.completions.create({
      model,
      messages: [{ role: "user", content }],
      stream: true,
    });

    for await (const part of stream) {
      const token = part.choices?.[0]?.delta?.content;
      if (!token) continue;
      // 1) append to list
      await redis.rpush(bufKey, token);
      // 2) publish to channel
      const payload = JSON.stringify({ type: "token", token, index: idx });
      await redis.publish(chan, payload);
      idx++;
    }

    // mark done
    await redis.hset(metaKey, "isDone", "true");
    await redis.publish(chan, JSON.stringify({ type: "done" }));
  } catch (err) {
    // if something goes wrong, broadcast an error
    const e = JSON.stringify({ type: "error", message: err.message });
    await redis.publish(chan, e);
  }
}

fastify.get("/conversation", { websocket: true }, (socket) => {
  let sessionId = null;

  socket.on("message", async (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return socket.send(
        JSON.stringify({ type: "error", message: "Invalid JSON" }),
      );
    }

    // ── A) START ──
    if (msg.type === "start") {
      const { model, content } = msg;
      if (!model || !content) {
        return socket.send(
          JSON.stringify({
            type: "error",
            message: "Both model and content are required",
          }),
        );
      }

      sessionId = uuidv4();
      const bufKey = `sess:${sessionId}:buf`;
      const metaKey = `sess:${sessionId}:meta`;
      const chan = `sess:${sessionId}:chan`;

      // init Redis
      await Promise.all([
        redis.del(bufKey),
        redis.hset(metaKey, "isDone", "false"),
        redis.expire(bufKey, SESSION_TTL),
        redis.expire(metaKey, SESSION_TTL),
      ]);

      // tell client its session
      socket.send(JSON.stringify({ type: "session", sessionId }));

      // subscribe this socket to live Pub/Sub
      if (!channelSubscribers.has(chan)) {
        channelSubscribers.set(chan, new Set());
        await redisSub.subscribe(chan);
      }
      channelSubscribers.get(chan).add(socket);

      // kick off the OpenAI streaming in the background
      streamAndPublish(sessionId, model, content);
    }

    // ── B) RESUME ──
    else if (msg.type === "resume") {
      sessionId = msg.sessionId;
      const lastIndex = Number(msg.lastIndex ?? -1);
      const bufKey = `sess:${sessionId}:buf`;
      const metaKey = `sess:${sessionId}:meta`;
      const chan = `sess:${sessionId}:chan`;

      // replay backlog
      const tokens = await redis.lrange(bufKey, lastIndex + 1, -1);
      tokens.forEach((tk, i) => {
        socket.send(
          JSON.stringify({
            type: "token",
            token: tk,
            index: lastIndex + 1 + i,
          }),
        );
      });

      // subscribe for live updates
      if (!channelSubscribers.has(chan)) {
        channelSubscribers.set(chan, new Set());
        await redisSub.subscribe(chan);
      }
      channelSubscribers.get(chan).add(socket);

      // if already done, notify immediately
      const done = await redis.hget(metaKey, "isDone");
      if (done === "true") {
        socket.send(JSON.stringify({ type: "done" }));
      }
    }

    // ── UNKNOWN ──
    else {
      socket.send(
        JSON.stringify({ type: "error", message: "Unknown message type" }),
      );
    }
  });

  socket.on("close", () => {
    if (sessionId) {
      const chan = `sess:${sessionId}:chan`;
      const subs = channelSubscribers.get(chan);
      if (subs) {
        subs.delete(socket);
        if (subs.size === 0) {
          channelSubscribers.delete(chan);
          redisSub.unsubscribe(chan);
        }
      }
    }
    fastify.log.info(`Socket closed for session ${sessionId}`);
  });

  socket.on("error", (err) => {
    fastify.log.error(`Socket error [${sessionId}]: ${err.message}`);
  });
});

await fastify.listen({ port: 4000 });
