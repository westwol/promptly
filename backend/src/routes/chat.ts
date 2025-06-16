import { FastifyRequest, FastifyReply } from 'fastify';

import { startLLMJob } from '../services/stream';
import { Id } from '@t3chat-convex/_generated/dataModel';
import { ChatCompletionCreateParamsBase } from 'openai/resources/chat/completions';

interface ChatRequestBody {
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
