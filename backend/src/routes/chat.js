import { v4 as uuidv4 } from 'uuid';
import { startLLMJob, processImage } from '../services/stream.js';

export async function startChatHandler(request, reply) {
  try {
    const parts = request.parts();
    const fields = {};

    for await (const part of parts) {
      if (part.type === 'file') {
        fields[part.fieldname] = await part.toBuffer();
      } else {
        fields[part.fieldname] = part.value;
      }
    }

    const resumableStreamId = uuidv4();

    const messages = JSON.parse(fields.messages);
    const conversationId = fields.conversationId;
    const model = fields.model || 'gpt-3.5-turbo';

    let imageData;
    if (fields.image) {
      imageData = await processImage(fields.image);
    }

    startLLMJob(resumableStreamId, conversationId, messages, model, imageData);

    return reply.send({ ok: true });
  } catch (error) {
    console.error('Error processing request:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
}
