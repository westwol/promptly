import { redis } from '../config/redis.js';
import { openai, deepseek, anthropic, gemini } from '../config/llm.js';
import {
  addMessageToConversation,
  completeMessage,
  generateConversationTitle,
} from './conversation.js';
import { mapAttachmentsForOpenAiSDK } from '../utils/attachments.js';

export async function startLLMJob(
  streamId,
  conversationId,
  messages,
  model = 'gpt-3.5-turbo',
  attachments
) {
  let messageId;

  try {
    // Initialize stream
    await redis.lpush(`chat:${streamId}`, JSON.stringify({ type: 'INIT' }));

    messageId = await addMessageToConversation(conversationId, streamId, 'assistant');

    generateConversationTitle(conversationId, messages[0].content).catch((err) =>
      console.error('Title generation failed:', err)
    );

    const attachmentMessage = await mapAttachmentsForOpenAiSDK(attachments);

    let completion;

    const completionParams = {
      model,
      messages: [...messages, ...attachmentMessage],
      stream: true,
    };

    switch (model) {
      case 'gpt-3.5-turbo':
      case 'gpt-4':
      case 'o4-mini':
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

      await Promise.all([
        redis.lpush(`chat:${streamId}`, JSON.stringify(event)),
        redis.publish(`chat:pub:${streamId}`, JSON.stringify(event)),
      ]);
    }

    await Promise.all([
      redis.lpush(`chat:${streamId}`, JSON.stringify({ type: 'DONE' })),
      redis.publish(`chat:pub:${streamId}`, JSON.stringify({ type: 'DONE' })),
    ]);

    await completeMessage(messageId, fullContent);

    // Cleanup
    await redis.expire(`chat:${streamId}`, 3600);
  } catch (error) {
    console.error('Stream processing error:', error);

    await Promise.all([
      redis.lpush(`chat:${streamId}`, JSON.stringify({ type: 'DONE' })),
      redis.publish(`chat:pub:${streamId}`, JSON.stringify({ type: 'DONE' })),
      completeMessage(messageId, 'Error processing this request please retry'),
    ]);
    throw error;
  }
}
