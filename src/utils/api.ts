import { CompletedChatAttachment } from '@t3chat/interfaces/chat';

const API_ENDPOINT = 'http://localhost:4000';

interface StartChatParams {
  content: string;
  conversationId: string;
  model: string;
  attachments: CompletedChatAttachment[];
}

export const startChat = async ({
  content,
  conversationId,
  model,
  attachments,
}: StartChatParams) => {
  const messages = [
    {
      role: 'user',
      content: [{ type: 'text', text: content }],
    },
  ];

  console.log({ messages });

  const res = await fetch(`${API_ENDPOINT}/api/chat/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      conversationId,
      model,
      attachments,
    }),
  });

  return await res.json();
};
