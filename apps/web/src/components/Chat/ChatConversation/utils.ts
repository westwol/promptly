import { Doc } from '@t3chat-convex/_generated/dataModel';

export const shouldDisplayThinkingIndicator = (messages: Doc<'messages'>[]) => {
  if (messages.length === 0) {
    return false;
  }

  return messages.some((message) => message.status === 'streaming' && message.content.length === 0);
};
