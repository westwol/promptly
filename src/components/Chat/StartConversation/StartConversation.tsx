'use client';

import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';

import { useSessionStore } from '@t3chat/store/session';
import { startChat } from '@t3chat/utils/api';
import { usePreferencesStore } from '@t3chat/store/preferences';
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

    router.push(`/conversations/${generatedConversationId}`);

    const conversationId = await createInitialConversation({
      conversationId: generatedConversationId,
      content,
      sessionId,
    });

    startChat({
      content,
      conversationId,
      attachments,
      model: preferencesStore.model,
      reasoning: chatStore.reasoningEnabled,
    });
  };

  return (
    <div className="grid h-screen grid-rows-[1fr_auto]">
      <ChatRecommendations />
      <ChatMessageInputPanel onSendChatRequest={onSendRequest} />
    </div>
  );
};
