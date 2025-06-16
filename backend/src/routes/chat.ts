import { FastifyRequest, FastifyReply } from 'fastify';

import { startLLMJob } from '../services/stream';
import { Id } from '@t3chat-convex/_generated/dataModel';

interface ChatRequestBody {
  messages: Array<{ role: string; content: string }>;
  conversationId: string;
  model?: string;
  attachments?: Array<{ type: string; url: string }>;
}

export async function startChatHandler(
  request: FastifyRequest<{ Body: ChatRequestBody }>,
  reply: FastifyReply
) {
  try {
    const { messages, conversationId, model = 'gpt-3.5-turbo', attachments = [] } = request.body;

    startLLMJob({
      messages,
      conversationId: conversationId as Id<'conversations'>,
      model,
      attachments,
    });
    return reply.send({ ok: true });
  } catch (error) {
    console.error('Error processing request:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
}
