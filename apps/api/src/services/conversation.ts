import { Doc, Id } from '@convex/_generated/dataModel';

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

    /* @ts-expect-error allowing string */
    await client.mutation('conversations:updateConversation', {
      conversationId,
      title,
    });
  } catch {}
}

export async function addMessageToConversation({
  conversationId,
  messageUuid,
  streamId,
  type,
  status,
  role,
  content = '',
}: {
  conversationId: Id<'conversations'>;
  messageUuid: string;
  role: string;
  status: string;
  type: string;
  streamId?: string;
  content?: string;
}) {
  /* @ts-expect-error allowing string */
  return await client.mutation('conversations:addNewMessageToConversation', {
    conversationId,
    messageUuid,
    resumableStreamId: streamId,
    role,
    type,
    status,
    content,
  });
}

export async function updateConversationProcessingStatus(
  conversationId: Id<'conversations'>,
  processing: boolean
) {
  /* @ts-expect-error allowing string */
  return await client.mutation('conversations:updateConversation', {
    conversationId,
    processing,
  });
}

export async function updateMessage(
  messageId: Id<'messages'>,
  params: Partial<Omit<Doc<'messages'>, '_id'>>
) {
  /* @ts-expect-error allowing string */
  return await client.mutation('conversations:updateMessage', {
    messageId,
    ...params,
  });
}
