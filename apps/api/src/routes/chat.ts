import { FastifyRequest, FastifyReply } from 'fastify';

import { Id } from '@convex/_generated/dataModel';
import { Attachment, startLLMJob } from '../services/stream';
import { chatStartRateLimit } from '../index';
import {
  addMessageToConversation,
  updateConversationProcessingStatus,
} from '../services/conversation';

export interface ChatRequestBody {
  messages: Array<{ role: string; content: string }>;
  conversationId: Id<'conversations'>;
  model?: string;
  attachments?: Attachment[];
  reasoning: boolean;
  customApiKey?: string;
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
      customApiKey,
    } = request.body;

    const limit = await chatStartRateLimit(request);

    if (!limit.isAllowed && limit.isExceeded) {
      addMessageToConversation({
        conversationId,
        content: 'Rate limit excedded, please wait before trying again',
        type: 'text',
        role: 'assistant',
        status: 'error',
      });
      updateConversationProcessingStatus(conversationId, false);
      return reply.code(429).send('Limit exceeded');
    }

    console.log('starting job...');

    const result = await startLLMJob({
      conversationId,
      messages,
      model,
      attachments,
      reasoning,
      customApiKey,
    });

    if (!result.success) {
      return reply.status(500).send({
        error: 'Failed to start LLM job',
        details: result.error,
      });
    }

    return reply.send({
      ok: true,
      streamId: result.streamId,
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
}
