"use strict";

import Fastify from "fastify";
import FastifyWebSocket from "@fastify/websocket";

const fastify = Fastify({
  logger: true,
});

fastify.route({
  method: "GET",
  url: "/",
  schema: {
    querystring: {
      type: "object",
      properties: {
        name: { type: "string" },
      },
      required: ["name"],
    },
    response: {
      200: {
        type: "object",
        properties: {
          hello: { type: "string" },
        },
      },
    },
  },
  // this function is executed for every request before the handler is executed
  preHandler: async (request, reply) => {
    // E.g. check authentication
  },
  handler: async (request, reply) => {
    return { hello: "world" };
  },
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
