import { v4 as uuidv4 } from 'uuid';
import { useMutation } from 'convex/react';

import { api } from '@t3chat-convex/_generated/api';
import { Doc } from '@t3chat-convex/_generated/dataModel';
import { db } from '@t3chat/lib/db';

export const useCreateConversation = (sessionId: string) => {
  const createInitialConversation = useMutation(
    api.conversations.createInitialConversation
  ).withOptimisticUpdate((localStore, args) => {
    const { conversationId, messageUuid, content } = args;
    const conversations = localStore.getQuery(api.conversations.get, { sessionId });
    if (!conversations) {
      return;
    }
    const currentDate = new Date().toISOString();
    const temporalConversation = {
      _id: uuidv4(),
      title: '',
      userId: sessionId,
      processing: true,
      conversationUuid: conversationId,
      updatedAt: currentDate,
      createdAt: currentDate,
    } as Doc<'conversations'>;
    localStore.setQuery(api.conversations.get, { sessionId }, [
      temporalConversation,
      ...conversations,
    ]);
    db.messages.add({
      /* @ts-expect-error invalid uuid */
      _id: uuidv4(),
      messageUuid,
      conversationId: temporalConversation._id,
      role: 'user',
      type: 'text',
      status: 'complete',
      content,
      createdAt: currentDate,
    });
  });

  return createInitialConversation;
};
