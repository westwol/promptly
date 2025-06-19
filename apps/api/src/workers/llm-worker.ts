import { v4 as uuidv4 } from 'uuid';

import { Id } from '@convex/_generated/dataModel';

import { redis } from '../config/redis';
import { openai, deepseek, anthropic, gemini, createCustomLlmClient } from '../config/llm';
import {
  generateConversationTitle,
  addMessageToConversation,
  updateConversationProcessingStatus,
  updateMessage,
} from '../services/conversation';
import { mapAttachmentsForOpenAiSDK } from '../utils/attachments';
import { uploadBase64Image } from '../utils/uploadthing';
import { LLM_PROMPT_CONTEXT } from '../llm/context';

interface Message {
  role: string;
  content: string;
}

export interface Attachment {
  mimeType: string;
  name: string;
  url: string;
}

interface ChatEvent {
  id?: number;
  type?: 'INIT' | 'DONE' | 'MESSAGE' | 'REASONING' | 'IMAGE';
  text?: string;
  imageUrl?: string;
}

interface LLMWorkerData {
  conversationId: Id<'conversations'>;
  messages: Message[];
  model: string;
  attachments?: Attachment[];
  reasoning: boolean;
  customApiKey?: string;
}

const IMAGE_GENERATION_MODELS = ['gpt-image-1'];

// This is the main function that Piscina will call
export default async function processLLMJob(data: LLMWorkerData) {
  const { conversationId, messages, model, attachments, reasoning, customApiKey } = data;

  const streamId = uuidv4();
  let messageId: Id<'messages'> | undefined;
  const lastMessage = messages[messages.length - 1];

  try {
    // Initialize stream
    await redis.lpush(`chat:${streamId}`, JSON.stringify({ type: 'INIT' }));

    const isImageGeneration = IMAGE_GENERATION_MODELS.includes(model);

    messageId = await addMessageToConversation({
      conversationId,
      messageUuid: uuidv4(),
      content: '',
      type: isImageGeneration ? 'image' : 'text',
      streamId,
      role: 'assistant',
      status: 'streaming',
    });

    // Update conversation to processing
    updateConversationProcessingStatus(conversationId, true);

    // Generate conversation title
    generateConversationTitle(conversationId, lastMessage.content);

    const attachmentMessage = await mapAttachmentsForOpenAiSDK(attachments || []);

    let completion: any;

    const completionParams = {
      model,
      stream: true,
      messages: [...LLM_PROMPT_CONTEXT, ...messages, ...attachmentMessage],
      ...(reasoning && { reasoning_effort: 'medium' }),
    } as any;

    const llmClient = customApiKey ? createCustomLlmClient(customApiKey, model) : openai;

    switch (model) {
      case 'gpt-3.5-turbo':
      case 'gpt-4':
      case 'o4-mini':
        completion = await llmClient.chat.completions.create(completionParams);
        break;
      case 'gpt-image-1':
        const imageResponse = await llmClient.images.generate({
          model: 'gpt-image-1',
          prompt: lastMessage.content,
          n: 1,
          size: '1024x1024',
        });

        const base64Image = imageResponse.data?.[0]?.b64_json;

        if (!base64Image) {
          throw new Error('Failed generating image');
        }

        const imageUrl = await uploadBase64Image(base64Image);

        const imageEvent: ChatEvent = {
          id: 0,
          type: 'IMAGE',
          imageUrl,
        };

        await Promise.all([
          redis.lpush(`chat:${streamId}`, JSON.stringify(imageEvent)),
          redis.publish(`chat:pub:${streamId}`, JSON.stringify(imageEvent)),
          updateMessage(messageId, { content: `![Generated Image](${imageUrl})` }),
        ]);

        // Send DONE event and skip the text streaming loop
        await Promise.all([
          redis.lpush(`chat:${streamId}`, JSON.stringify({ type: 'DONE' })),
          redis.publish(`chat:pub:${streamId}`, JSON.stringify({ type: 'DONE' })),
        ]);

        completion = null;
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

    if (!completion) {
      if (isImageGeneration) {
        await redis.expire(`chat:${streamId}`, 3600);
        return { success: true, streamId };
      } else {
        throw new Error('failed to generate');
      }
    }

    let idx = 0;
    let fullContent = '';

    for await (const chunk of completion) {
      const text = chunk.choices?.[0]?.delta?.content;
      const reasoning = (chunk.choices?.[0]?.delta as any)?.reasoning;

      if (!text && !reasoning) continue;

      if (text) {
        fullContent += text;
        const event: ChatEvent = { id: idx++, text };

        await Promise.all([
          redis.lpush(`chat:${streamId}`, JSON.stringify(event)),
          redis.publish(`chat:pub:${streamId}`, JSON.stringify(event)),
        ]);
      }

      if (reasoning) {
        const event: ChatEvent = { id: idx++, text: reasoning, type: 'REASONING' };

        await Promise.all([
          redis.lpush(`chat:${streamId}`, JSON.stringify(event)),
          redis.publish(`chat:pub:${streamId}`, JSON.stringify(event)),
        ]);
      }
    }

    await Promise.all([
      redis.lpush(`chat:${streamId}`, JSON.stringify({ type: 'DONE' })),
      redis.publish(`chat:pub:${streamId}`, JSON.stringify({ type: 'DONE' })),
      // Expire redis key
      redis.expire(`chat:${streamId}`, 3600),
      // Complete message
      updateMessage(messageId, { content: fullContent, status: 'complete' }),
    ]);

    return { success: true, streamId };
  } catch (error) {
    console.error('Stream processing error:', error);

    const errorPromises: Promise<unknown>[] = [
      redis.lpush(`chat:${streamId}`, JSON.stringify({ type: 'DONE' })),
      redis.publish(`chat:pub:${streamId}`, JSON.stringify({ type: 'DONE' })),
    ];

    if (messageId) {
      errorPromises.push(
        updateMessage(messageId, {
          content: 'Error processing this request please retry',
          status: 'error',
        })
      );
    }
    await Promise.all(errorPromises);

    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  } finally {
    // Finished processing the conversation
    await updateConversationProcessingStatus(conversationId, false);
  }
}
