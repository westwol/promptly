import * as dotenv from 'dotenv';
import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';

import { startChatHandler } from './routes/chat';
import { streamChatHandler } from './routes/stream-chat';
import { redis } from './config/redis';
import { workerPool } from './services/worker-pool';

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
  await fastify.register(cors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // Health check endpoint
  fastify.get('/health', async (request, reply) => {
    const workerStats = workerPool.getStats();
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      workerPool: workerStats,
    };
  });

  fastify.post('/api/chat/start', startChatHandler);
  fastify.get('/api/chat/stream', streamChatHandler);

  try {
    const port = +(process.env.PORT || 4000);
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Server running on port ${port}`);

    // Log worker pool stats
    const stats = workerPool.getStats();
    console.log(`Worker pool initialized with ${stats.threadCount} threads`);
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);

  try {
    // Close the Fastify server
    await fastify.close();

    // Shutdown the worker pool
    await workerPool.shutdown();

    // Close Redis connection
    await redis.quit();

    console.log('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

runApp();
