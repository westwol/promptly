import Fastify from "fastify";
import cors from "@fastify/cors";
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
  try {
    // Initialize stream
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
      generateConversationTitle(conversationId, messages[0].content).catch(
        (err) => console.error("Title generation failed:", err),
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      stream: true,
    });

    let idx = 0;
    let fullContent = "";

    for await (const chunk of completion) {
      const text = chunk.choices?.[0]?.delta?.content;
      if (!text) continue;

      fullContent += text;
      const event = { id: idx++, text };

      // Send events immediately without batching
      await Promise.all([
        redis.lpush(`chat:${streamId}`, JSON.stringify(event)),
        redis.publish(`chat:pub:${streamId}`, JSON.stringify(event)),
      ]);
    }

    // Mark completion
    await Promise.all([
      redis.lpush(`chat:${streamId}`, JSON.stringify({ type: "DONE" })),
      redis.publish(`chat:pub:${streamId}`, JSON.stringify({ type: "DONE" })),
    ]);

    // Update message in Convex
    await client.mutation("conversations:completeMessage", {
      messageId,
      content: fullContent,
    });

    // Set TTL for cleanup
    await redis.expire(`chat:${streamId}`, 3600);
  } catch (error) {
    console.error("Stream processing error:", error);
    // Ensure we mark the stream as done even on error
    await Promise.all([
      redis.lpush(`chat:${streamId}`, JSON.stringify({ type: "DONE" })),
      redis.publish(`chat:pub:${streamId}`, JSON.stringify({ type: "DONE" })),
    ]);
    throw error;
  }
}

fastify.post("/api/chat/start", async (request, reply) => {
  const { messages, conversationId, resumableStreamId } = request.body;
  startOpenAIJob(resumableStreamId, conversationId, messages).catch((err) =>
    console.error(err),
  );
  return reply.send({ ok: true });
});

fastify.get("/api/chat/stream", async (request, reply) => {
  const streamId = request.query.streamId;
  if (!streamId) {
    return reply.status(400).send("Missing streamId");
  }

  const res = reply.raw;
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });
  res.flushHeaders();

  let isClientConnected = true;

  try {
    // Get existing events
    const rawList = await redis.lrange(`chat:${streamId}`, 0, -1);
    const events = rawList.map(JSON.parse).reverse();

    // Send existing events
    for (const evt of events) {
      if (!isClientConnected) break;

      if (evt.type === "INIT") continue;
      if (evt.type === "DONE") {
        res.write(`event: done\ndata: \n\n`);
        continue;
      }
      res.write(
        `id: ${evt.id}\nevent: message\ndata: ${evt.text.replace(/\n/g, "\\n")}\n\n`,
      );
    }

    // Subscribe for new events
    const sub = new Redis({
      host: process.env.REDIS_HOST,
      port: +process.env.REDIS_PORT,
    });

    await sub.subscribe(`chat:pub:${streamId}`);

    sub.on("message", (_chan, message) => {
      if (!isClientConnected) return;

      try {
        const evt = JSON.parse(message);
        if (evt.type === "DONE") {
          res.write(`event: done\ndata: \n\n`);
        } else {
          res.write(
            `id: ${evt.id}\nevent: message\ndata: ${evt.text.replace(/\n/g, "\\n")}\n\n`,
          );
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    });

    // Cleanup on client disconnect
    request.raw.on("close", () => {
      isClientConnected = false;
      sub.disconnect();
      res.end();
    });
  } catch (error) {
    console.error("Stream setup error:", error);
    if (isClientConnected) {
      res.write(
        `event: error\ndata: ${JSON.stringify({ message: "Internal server error" })}\n\n`,
      );
      res.end();
    }
  }
});

await fastify.listen({ port: 4000 });
