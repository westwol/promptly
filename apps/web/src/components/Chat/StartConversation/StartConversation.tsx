'use client';

import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';
import { isEmpty } from 'lodash';

import { useSessionStore } from '@t3chat/store/session';
import { startChat } from '@t3chat/utils/api';
import { CustomApiKeys, usePreferencesStore } from '@t3chat/store/preferences';
import { CompletedChatAttachment } from '@t3chat/interfaces/chat';
import { useChatStore } from '@t3chat/store/chat';

import { useCreateConversation } from './useCreateConversation';
import { ChatRecommendations } from './ChatRecommendations';
import { ChatMessageInputPanel } from '../ChatMessageInputPanel';

export const StartConversation = () => {
  const sessionId = useSessionStore((state) => state.sessionId);
  const createInitialConversation = useCreateConversation(sessionId);

  const router = useRouter();

  const onSendRequest = async () => {
    const chatStore = useChatStore.getState();
    const preferencesStore = usePreferencesStore.getState();

    const generatedConversationId = uuidv4();
    const content = chatStore.content;
    const attachments = chatStore.attachments as CompletedChatAttachment[];

    chatStore.resetState();

    // Add the new conversation to recent chats
    preferencesStore.addToRecentChats(generatedConversationId);

    router.push(`/conversations/${generatedConversationId}?new=true`);

    const conversationId = await createInitialConversation({
      conversationId: generatedConversationId,
      content,
      sessionId,
    });

    const model = preferencesStore.model;
    const normalizedModel = preferencesStore.model.type as keyof CustomApiKeys;
    const isCustomApiKeyEnabled = preferencesStore.isApiKeyEnabled(normalizedModel);
    const currentApiKeyValue = preferencesStore.getApiKey(normalizedModel);
    const customApiKey =
      isCustomApiKeyEnabled && !isEmpty(currentApiKeyValue)
        ? preferencesStore.getApiKey(normalizedModel)
        : undefined;

    startChat({
      content,
      conversationId,
      attachments,
      model,
      customApiKey: customApiKey,
      reasoning: chatStore.reasoningEnabled,
    });
  };

  return (
    <div className="grid h-screen grid-rows-[1fr_auto]">
      <ChatRecommendations />
      <ChatMessageInputPanel isProcessing={false} onSendChatRequest={onSendRequest} />
    </div>
  );
};
