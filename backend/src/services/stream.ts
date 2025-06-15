import { v4 as uuidv4 } from 'uuid';

import { ChatCompletionCreateParamsStreaming } from 'openai/resources/index.js';

import { Id } from '@t3chat-convex/_generated/dataModel.js';

import { redis } from '../config/redis.ts';
import { openai, deepseek, anthropic, gemini } from '../config/llm.ts';
import {
  generateConversationTitle,
  addMessageToConversation,
  completeMessage,
  updateConversationProcessingStatus,
} from './conversation.ts';
import { mapAttachmentsForOpenAiSDK } from '../utils/attachments.ts';

interface Message {
  role: string;
  content: string;
}

interface Attachment {
  type: string;
  url: string;
}

interface ChatEvent {
  id?: number;
  type?: 'INIT' | 'DONE' | 'MESSAGE';
  text?: string;
}

interface StartLlmJobParams {
  conversationId: Id<'conversations'>;
  messages: Message[];
  model: string;
  attachments?: Attachment[];
}

export async function startLLMJob({
  conversationId,
  messages,
  model,
  attachments,
}: StartLlmJobParams) {
  const streamId = uuidv4();

  let messageId: Id<'messages'> | undefined;

  try {
    // Initialize stream
    await redis.lpush(`chat:${streamId}`, JSON.stringify({ type: 'INIT' }));

    messageId = await addMessageToConversation(conversationId, streamId, 'assistant');

    // Update conversation to processing
    updateConversationProcessingStatus(conversationId, true);

    // Generate conversation title
    /* @ts-ignore */
    generateConversationTitle(conversationId, messages[0].content[0].text);

    const attachmentMessage = await mapAttachmentsForOpenAiSDK(attachments || []);

    let completion;

    const completionParams = {
      model,
      messages: [...messages, ...attachmentMessage],
      stream: true,
    } as ChatCompletionCreateParamsStreaming;

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
      const text = chunk.choices?.[0]?.delta?.content;
      if (!text) continue;

      fullContent += text;
      const event: ChatEvent = { id: idx++, text };

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
    const errorPromises: Promise<unknown>[] = [
      redis.lpush(`chat:${streamId}`, JSON.stringify({ type: 'DONE' })),
      redis.publish(`chat:pub:${streamId}`, JSON.stringify({ type: 'DONE' })),
    ];

    if (messageId) {
      errorPromises.push(completeMessage(messageId, 'Error processing this request please retry'));
    }

    console.error('Stream processing error:', error);
    await Promise.all(errorPromises);
    throw error;
  } finally {
    // Finished processing the conversation
    updateConversationProcessingStatus(conversationId, false);
  }
}
