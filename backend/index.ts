import dotenv from 'dotenv';
import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';

import { startChatHandler } from './src/routes/chat.ts';
import { streamChatHandler } from './src/routes/stream-chat.ts';
import { redis } from './src/config/redis';

const DEFAULT_MAX_REQUESTS = 20;
const START_CHAT_MAX_REQUESTS = 10;

dotenv.config();

const fastify: FastifyInstance = Fastify({ logger: true });

await fastify.register(cors, { origin: true });

await fastify.register(rateLimit, {
  global: true,
  max: DEFAULT_MAX_REQUESTS,
  timeWindow: '1 minute',
  hook: 'preHandler',
  redis,
});

export const chatStartRateLimit = fastify.createRateLimit({ max: START_CHAT_MAX_REQUESTS });

fastify.post('/api/chat/start', startChatHandler);
fastify.get('/api/chat/stream', streamChatHandler);

try {
  await fastify.listen({ port: +(process.env.PORT || 4000) });
  console.log(`Server running on ${process.env.PORT}`);
} catch (err) {
  console.error('Error starting server:', err);
  process.exit(1);
}
