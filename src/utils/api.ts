interface ApiRequestParams {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

const apiRequest = ({ method = 'POST' }: ApiRequestParams) => {
  return fetch('http://localhost:4000/api/chat/start', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: preferencesStore.model.model,
      conversationId: conversationData?.conversation?._id,
      resumableStreamId: generatedResumableStreamId,
      messages: [{ role: 'user', content }],
    }),
  });
};
