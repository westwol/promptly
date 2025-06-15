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

    console.log({ fields });

    const messages = JSON.parse(fields.messages);
    const conversationId = fields.conversationId;
    const resumableStreamId = fields.resumableStreamId;
    const model = fields.model || 'gpt-3.5-turbo';

    let imageData;
    if (fields.image) {
      imageData = await processImage(fields.image);
    }

    startLLMJob(resumableStreamId, conversationId, messages, model, imageData).catch((err) =>
      console.error(err)
    );
    return reply.send({ ok: true });
  } catch (error) {
    console.error('Error processing request:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
}
