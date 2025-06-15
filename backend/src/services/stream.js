import { redis } from '../config/redis.js';
import { openai, deepseek, anthropic, gemini } from '../config/llm.js';
import {
  addMessageToConversation,
  completeMessage,
  generateConversationTitle,
} from './conversation.js';

export async function processImage(file) {
  if (Buffer.isBuffer(file)) {
    return file.toString('base64');
  }

  const chunks = [];
  for await (const chunk of file) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);
  return buffer.toString('base64');
}

export async function startLLMJob(
  streamId,
  conversationId,
  messages,
  model = 'gpt-3.5-turbo',
  imageData = null
) {
  let messageId;

  try {
    // Initialize stream
    await redis.lpush(`chat:${streamId}`, JSON.stringify({ type: 'INIT' }));

    messageId = await addMessageToConversation(conversationId, streamId, 'assistant');

    const shouldGenerateTitle = messages.length === 1;
    if (shouldGenerateTitle) {
      generateConversationTitle(conversationId, messages[0].content).catch((err) =>
        console.error('Title generation failed:', err)
      );
    }

    let completion;

    const completionParams = {
      model,
      messages: imageData
        ? [
            {
              role: 'user',
              content: [
                { type: 'text', text: messages[messages.length - 1].content },
                { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageData}` } },
              ],
            },
            ...messages,
          ]
        : messages,
      stream: true,
    };

    switch (model) {
      case 'gpt-3.5-turbo':
      case 'gpt-4':
      case 'o4-mini':
      case 'gpt-4-vision-preview':
        completion = await openai.chat.completions.create(completionParams);
        break;
      case 'gemini-2.0-flash':
      case 'gemini-1.5-pro':
        completion = await gemini.chat.completions.create(completionParams);
        break;
      case 'claude-sonnet-4-20250514':
      case 'claude-3-opus-20240229':
      case 'claude-3-sonnet-20240229':
        completion = await anthropic.chat.completions.create(completionParams);
        break;
      case 'deepseek-chat':
      case 'deepseek-coder':
        completion = await deepseek.chat.completions.create(completionParams);
        break;
      default:
        throw new Error(`Unsupported model: ${model}`);
    }

    let idx = 0;
    let fullContent = '';

    for await (const chunk of completion) {
      let text = chunk.choices?.[0]?.delta?.content;
      if (!text) continue;

      fullContent += text;
      const event = { id: idx++, text };

      // Send events immediately without batching
      await Promise.all([
        redis.lpush(`chat:${streamId}`, JSON.stringify(event)),
        redis.publish(`chat:pub:${streamId}`, JSON.stringify(event)),
      ]);
    }

    // Mark completion
    await Promise.all([
      redis.lpush(`chat:${streamId}`, JSON.stringify({ type: 'DONE' })),
      redis.publish(`chat:pub:${streamId}`, JSON.stringify({ type: 'DONE' })),
    ]);

    // Update message in Convex
    await completeMessage(messageId, fullContent);

    // Set TTL for cleanup
    await redis.expire(`chat:${streamId}`, 3600);
  } catch (error) {
    console.error('Stream processing error:', error);
    // Ensure we mark the stream as done even on error
    await Promise.all([
      redis.lpush(`chat:${streamId}`, JSON.stringify({ type: 'DONE' })),
      redis.publish(`chat:pub:${streamId}`, JSON.stringify({ type: 'DONE' })),
      completeMessage(messageId, 'Error processing this request please retry'),
    ]);
    throw error;
  }
}
