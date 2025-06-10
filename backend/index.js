import Fastify from "fastify";
import cors from "@fastify/cors";
import { v4 as uuid } from "uuid";
import OpenAI from "openai";
import Redis from "ioredis";
import dotenv from "dotenv";
import { ConvexHttpClient } from "convex/browser";
dotenv.config();

const fastify = Fastify({ logger: true });
await fastify.register(cors, { origin: true });

const client = new ConvexHttpClient(process.env.CONVEX_URL);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const redis = new Redis({
  // for Lists & Hashes
  host: process.env.REDIS_HOST,
  port: +process.env.REDIS_PORT,
});

async function startOpenAIJob(streamId, conversationId, messages) {
  // 1) mark init
  await redis.lpush(`chat:${streamId}`, JSON.stringify({ type: "INIT" }));

  // Create initial message in Convex without waiting
  const messagePromise = client.mutation(
    "conversations:addNewMessageToConversation",
    {
      conversationId: messages[0].conversationId,
      content: "",
    }
  );

  // 2) kick off the V4 streaming call
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages,
    stream: true,
  });

  let idx = 0;
  let fullContent = "";
  // 3) loop over each chunk as it arrives
  for await (const chunk of completion) {
    const text = chunk.choices?.[0]?.delta?.content;
    if (!text) continue;

    fullContent += text;
    // persist + publish
    const event = { id: idx++, text };
    await redis.lpush(`chat:${streamId}`, JSON.stringify(event));
    await redis.publish(`chat:pub:${streamId}`, JSON.stringify(event));

    // Update message in Convex without waiting
    messagePromise
      .then(async (messageId) => {
        await client.mutation("conversations:updateStreamingMessage", {
          messageId,
          content: fullContent,
          token: text,
          tokenIndex: idx - 1,
        });
      })
      .catch(console.error);
  }

  // 4) mark done in Redis
  await redis.lpush(`chat:${streamId}`, JSON.stringify({ type: "DONE" }));

  // Mark message as complete in Convex
  messagePromise
    .then(async (messageId) => {
      await client.mutation("conversations:completeMessage", {
        messageId,
        content: fullContent,
      });
    })
    .catch(console.error);
}

fastify.post("/api/chat/start", async (request, reply) => {
  const { messages, conversationId } = request.body;
  const streamId = uuid();
  startOpenAIJob(streamId, conversationId, messages).catch((err) =>
    console.error(err)
  );
  return reply.send({ streamId });
});

fastify.get("/api/chat/stream", async (request, reply) => {
  const streamId = request.query.streamId;
  if (!streamId) {
    return reply.status(400).send("Missing streamId");
  }

  // Prepare raw HTTP response for SSE
  const res = reply.raw;
  // 1) SSE + CORS + chunked:
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Transfer-Encoding": "chunked",
  });
  res.flushHeaders();

  // Replay any missed events
  const lastEventIdHeader = request.headers["last-event-id"] || "-1";
  const lastEventId = parseInt(lastEventIdHeader, 10);
  const rawList = await redis.lrange(`chat:${streamId}`, 0, -1);
  const events = rawList
    .map(JSON.parse)
    .reverse()
    .filter((evt) => typeof evt.id === "number" && evt.id > lastEventId);

  for (const evt of events) {
    res.write(`id: ${evt.id}\nevent: message\ndata: ${evt.text}\n\n`);
  }

  // Subscribe for new events
  const sub = new Redis();
  await sub.subscribe(`chat:pub:${streamId}`);
  sub.on("message", (_chan, message) => {
    const evt = JSON.parse(message);
    res.write(`id: ${evt.id}\nevent: message\ndata: ${evt.text}\n\n`);
  });

  // Cleanup on client disconnect
  request.raw.on("close", () => {
    console.log("closing event stream");
    sub.disconnect();
    res.end();
  });
});

await fastify.listen({ port: 4000 });
