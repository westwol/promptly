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

async function generateConversationTitle(conversationId, content) {
  const titleCompletion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `Generate a short, concise title (max 5 words) for based on the following content. Return only the title text, nothing else: ${content}`,
      },
    ],
    max_tokens: 20,
  });

  const title =
    titleCompletion.choices[0].message.content.trim() || "New conversation";

  await client.mutation("conversations:updateConversation", {
    conversationId,
    title,
  });
}

async function startOpenAIJob(streamId, conversationId, messages) {
  await redis.lpush(`chat:${streamId}`, JSON.stringify({ type: "INIT" }));

  const messageId = await client.mutation(
    "conversations:addNewMessageToConversation",
    {
      conversationId,
      resumableStreamId: streamId,
      role: "assistant",
      status: "streaming",
      content: "",
    },
  );

  const shouldGenerateTitle = messages.length === 1;
  if (shouldGenerateTitle) {
    generateConversationTitle(conversationId, messages[0].content);
  }

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
  }

  // 4) mark done in Redis
  await redis.lpush(`chat:${streamId}`, JSON.stringify({ type: "DONE" }));
  await redis.publish(`chat:pub:${streamId}`, JSON.stringify({ type: "DONE" }));

  // Mark message as complete in Convex
  await client.mutation("conversations:completeMessage", {
    messageId,
    content: fullContent,
  });
}

fastify.post("/api/chat/start", async (request, reply) => {
  const { messages, conversationId } = request.body;
  const streamId = uuid();
  startOpenAIJob(streamId, conversationId, messages).catch((err) =>
    console.error(err),
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
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Transfer-Encoding": "chunked",
  });
  res.flushHeaders();

  // Get all events from Redis and send them to the client
  const rawList = await redis.lrange(`chat:${streamId}`, 0, -1);
  const events = rawList.map(JSON.parse).reverse();

  // Send all events to the client
  for (const evt of events) {
    if (evt.type === "INIT") continue; // Skip INIT event
    if (evt.type === "DONE") {
      res.write(`event: done\ndata: ${JSON.stringify(evt)}\n\n`);
      continue;
    }
    res.write(
      `id: ${evt.id}\nevent: message\ndata: ${JSON.stringify(evt)}\n\n`,
    );
  }

  // Subscribe for new events
  const sub = new Redis();
  await sub.subscribe(`chat:pub:${streamId}`);
  sub.on("message", (_chan, message) => {
    const evt = JSON.parse(message);
    if (evt.type === "DONE") {
      res.write(`event: done\ndata: ${JSON.stringify(evt)}\n\n`);
    } else {
      res.write(
        `id: ${evt.id}\nevent: message\ndata: ${JSON.stringify(evt)}\n\n`,
      );
    }
  });

  // Cleanup on client disconnect
  request.raw.on("close", () => {
    console.log("closing event stream");
    sub.disconnect();
    res.end();
  });
});

await fastify.listen({ port: 4000 });
