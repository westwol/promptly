"use strict";

import Fastify from "fastify";
import cors from "@fastify/cors";
import FastifyWebSocket from "@fastify/websocket";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const fastify = Fastify({
  logger: true,
});

await fastify.register(cors, { origin: true });

fastify.post("/chat", async (request, reply) => {
  const { body: userMessage, model } = request.body;

  if (!userMessage || !model) {
    return reply
      .status(400)
      .send({ error: "Both body and model are required" });
  }

  try {
    // note the new method chain
    const completion = await openai.chat.completions.create({
      model: "",
      messages: [{ role: "user", content: userMessage }],
    });

    const assistantMessage = completion.choices?.[0]?.message?.content;
    return reply.send({ reply: assistantMessage });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ error: "OpenAI API error" });
  }
});

try {
  fastify.register(FastifyWebSocket);
  fastify.register(async function (fastify) {
    fastify.get("/conversation", { websocket: true }, (socket, req) => {
      socket.on("message", (message) => {
        socket.send("hi from server");
      });
    });
  });
  await fastify.listen({ port: 4000 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
