import { Id } from '@t3chat-convex/_generated/dataModel';
import { api } from '@t3chat-convex/_generated/api';

import { client } from '../config/convex';
import { openai } from '../config/llm';

export async function generateConversationTitle(
  conversationId: Id<'conversations'>,
  content: string
) {
  try {
    const titleCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Generate a short, concise title (max 5 words) for based on the following content. Return only the title text, nothing else: ${content}`,
        },
      ],
      max_tokens: 20,
    });

    const title = titleCompletion?.choices[0]?.message?.content?.trim() || 'New conversation';

    await client.mutation(api.conversations.updateConversation, {
      conversationId,
      title,
    });
  } catch {}
}

export async function addMessageToConversation({
  conversationId,
  streamId,
  role,
  content = '',
}: {
  conversationId: Id<'conversations'>;
  role: (typeof api.conversations.addNewMessageToConversation)['_args']['role'];
  streamId?: string;
  content?: string;
}) {
  return await client.mutation(api.conversations.addNewMessageToConversation, {
    conversationId,
    resumableStreamId: streamId,
    role,
    status: 'streaming',
    content,
  });
}

export async function updateConversationProcessingStatus(
  conversationId: Id<'conversations'>,
  processing: boolean
) {
  return await client.mutation(api.conversations.updateConversation, {
    conversationId,
    processing,
  });
}

export async function completeMessage(messageId: Id<'messages'>, content: string) {
  return await client.mutation(api.conversations.completeMessage, {
    messageId,
    content,
  });
}
