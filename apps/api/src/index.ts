import dotenv from 'dotenv';
import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';

import { startChatHandler } from './routes/chat';
import { streamChatHandler } from './routes/stream-chat';
import { redis } from './config/redis';

const START_CHAT_MAX_REQUESTS = 10;

dotenv.config();

const fastify: FastifyInstance = Fastify({ logger: true });

export const chatStartRateLimit = async (request: any) => {
  const ip = request.ip || request.connection.remoteAddress;
  const key = `rate_limit:chat_start:${ip}`;

  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, 60); // 1 minute window
  }

  const isAllowed = current <= START_CHAT_MAX_REQUESTS;
  const isExceeded = current > START_CHAT_MAX_REQUESTS;

  return { isAllowed, isExceeded, current };
};

const runApp = async () => {
  await fastify.register(cors, { origin: true });

  fastify.post('/api/chat/start', startChatHandler);
  fastify.get('/api/chat/stream', streamChatHandler);

  try {
    await fastify.listen({ port: +(process.env.PORT || 4000) });
    console.log(`Server running on ${process.env.PORT}`);
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
};

runApp();
