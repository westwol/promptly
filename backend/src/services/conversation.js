import { client } from '../config/convex.js';
import { openai } from '../config/llm.js';

export async function generateConversationTitle(conversationId, content) {
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

  const title = titleCompletion.choices[0].message.content.trim() || 'New conversation';

  await client.mutation('conversations:updateConversation', {
    conversationId,
    title,
  });
}

export async function addMessageToConversation(conversationId, streamId, role, content = '') {
  return await client.mutation('conversations:addNewMessageToConversation', {
    conversationId,
    resumableStreamId: streamId,
    role,
    status: 'streaming',
    content,
  });
}

export async function completeMessage(messageId, content) {
  return await client.mutation('conversations:completeMessage', {
    messageId,
    content,
  });
}
