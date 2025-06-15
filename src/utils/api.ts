const API_ENDPOINT = 'http://localhost:4000';

interface StartChatParams {
  content: string;
  conversationId: string;
  resumableStreamId: string;
  model: string;
  image?: File;
}

export const startChat = async ({
  content,
  conversationId,
  resumableStreamId,
  model,
  image,
}: StartChatParams) => {
  const formData = new FormData();

  formData.append('messages', JSON.stringify([{ role: 'user', content }]));
  formData.append('conversationId', conversationId);
  formData.append('resumableStreamId', resumableStreamId);
  formData.append('model', model);

  if (image) {
    formData.append('image', image);
  }

  const res = await fetch(`${API_ENDPOINT}/api/chat/start`, {
    method: 'POST',
    body: formData,
  });

  return await res.json();
};
