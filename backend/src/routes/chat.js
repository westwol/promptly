import { v4 as uuidv4 } from 'uuid';

import { startLLMJob } from '../services/stream.js';

export async function startChatHandler(request, reply) {
  try {
    const { messages, conversationId, model = 'gpt-3.5-turbo', attachments } = request.body;
    console.log({ body: request.body });

    const resumableStreamId = uuidv4();

    startLLMJob(resumableStreamId, conversationId, messages, model, attachments);
    return reply.send({ ok: true });
  } catch (error) {
    console.error('Error processing request:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
}
