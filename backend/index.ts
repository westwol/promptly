import dotenv from 'dotenv';
import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';

import { startChatHandler } from './src/routes/chat.ts';
import { streamChatHandler } from './src/routes/stream-chat.ts';

dotenv.config();

const fastify: FastifyInstance = Fastify({ logger: true });

await fastify.register(cors, { origin: true });

fastify.post('/api/chat/start', startChatHandler);
fastify.get('/api/chat/stream', streamChatHandler);

try {
  await fastify.listen({ port: 4000 });
  console.log('Server is running on port 4000');
} catch (err) {
  console.error('Error starting server:', err);
  process.exit(1);
}
