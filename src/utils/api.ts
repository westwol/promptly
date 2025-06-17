import { CompletedChatAttachment } from '@t3chat/interfaces/chat';
import { LlmModel } from '@t3chat/interfaces/llmModels';

export const API_ENDPOINT = 'http://localhost:4000/api';

interface StartChatParams {
  content: string;
  conversationId: string;
  model: LlmModel;
  attachments: CompletedChatAttachment[];
  reasoning: boolean;
}

export const startChat = async ({
  content,
  conversationId,
  model,
  attachments,
  reasoning,
}: StartChatParams) => {
  const messages = [
    {
      role: 'user',
      content,
    },
  ];

  const canModelReason = model.capabilities.includes('reasoning');
  const shouldIncludeAttachments = model.capabilities.includes('vision');

  const res = await fetch(`${API_ENDPOINT}/chat/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      conversationId,
      model: model.model,
      ...(canModelReason ? { reasoning } : {}),
      ...(shouldIncludeAttachments ? { attachments } : { attachments: [] }),
    }),
  });

  const data = await res.json();

  if (!data.ok) {
    throw new Error('Error starting chat');
  }

  return data;
};
