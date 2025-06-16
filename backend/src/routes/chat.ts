import { FastifyRequest, FastifyReply } from 'fastify';

import { Id } from '@t3chat-convex/_generated/dataModel';
import { startLLMJob } from '../services/stream';
import { chatStartRateLimit } from '../../index';
import {
  addMessageToConversation,
  updateConversationProcessingStatus,
} from '../services/conversation';

export interface ChatRequestBody {
  messages: Array<{ role: string; content: string }>;
  conversationId: Id<'conversations'>;
  model?: string;
  attachments?: Array<{ type: string; url: string }>;
  reasoning: boolean;
}

export async function startChatHandler(
  request: FastifyRequest<{ Body: ChatRequestBody }>,
  reply: FastifyReply
) {
  try {
    const {
      messages,
      conversationId,
      model = 'gpt-3.5-turbo',
      attachments = [],
      reasoning,
    } = request.body;

    const limit = await chatStartRateLimit(request);

    if (!limit.isAllowed && limit.isExceeded) {
      addMessageToConversation({
        conversationId,
        content: 'Rate limit excedded, please wait before trying again',
        role: 'assistant',
      });
      updateConversationProcessingStatus(conversationId, false);
      return reply.code(429).send('Limit exceeded');
    }

    startLLMJob({
      conversationId,
      messages,
      model,
      attachments,
      reasoning,
    });
    return reply.send({ ok: true });
  } catch (error) {
    console.error('Error processing request:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
}
