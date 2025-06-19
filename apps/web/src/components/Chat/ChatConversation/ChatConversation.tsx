'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { isEmpty, last } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { useLiveQuery } from 'dexie-react-hooks';
import { useSearchParams } from 'next/navigation';

import { CustomApiKeys, usePreferencesStore } from '@t3chat/store/preferences';
import { startChat } from '@t3chat/utils/api';
import { api } from '@t3chat-convex/_generated/api';
import { Doc } from '@t3chat-convex/_generated/dataModel';
import { CompletedChatAttachment } from '@t3chat/interfaces/chat';
import { useChatStore } from '@t3chat/store/chat';
import { db, MessageWithConversationUuid } from '@t3chat/lib/db';

import { ChatMessage } from './ChatMessage';
import { ThinkingIndicator } from './ThinkingIndicator';
import { ChatMessageInputPanel } from '../ChatMessageInputPanel';
import { ScrollToBottomPanel } from './ScrollToBottomPanel';

interface ChatConversationProps {
  conversationId: string;
}

export const ChatConversation = ({ conversationId }: ChatConversationProps) => {
  const searchParams = useSearchParams();
  const isNewConversation = searchParams.get('new');

  const conversationData = useQuery(api.conversations.getById, {
    conversationUuid: conversationId,
  });

  const addMessageToConversation = useMutation(
    api.conversations.addNewMessageToConversation
  ).withOptimisticUpdate((localStore, { messageUuid, content }) => {
    const queryParams = {
      conversationUuid: conversationId,
    };
    const conversation = localStore.getQuery(api.conversations.getById, queryParams);
    if (!conversation) {
      return;
    }
    const currentDate = new Date().toISOString();
    db.messages.add({
      _id: uuidv4(),
      messageUuid,
      conversationId,
      role: 'user',
      type: 'text',
      status: 'complete',
      createdAt: currentDate,
      content,
    } as MessageWithConversationUuid);
    localStore.setQuery(api.conversations.getById, queryParams, {
      messages: conversation.messages,
      conversation: {
        ...conversation.conversation,
        processing: true,
      } as Doc<'conversations'>,
    });
  });

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const currentScrollPosition = useRef<number>(0);

  const messages = useLiveQuery(
    async () => {
      const messages = await db.messages
        .where('conversationUuid')
        .equals(conversationId)
        .sortBy('createdAt');
      setTimeout(() => scrollToBottom(true), 0);
      return messages;
    },
    [conversationId],
    []
  );

  const [shouldShowThinkingIndicator, setShouldShowThinkingIndicator] = useState<boolean>(
    isNewConversation === 'true'
  );
  const [shouldDisplayScrollToBottom, setShouldDisplayScrollToBottom] = useState<boolean>(false);

  const scrollToBottom = useCallback((force?: boolean) => {
    const messagesContainer = messagesContainerRef.current;
    if (!messagesContainer) {
      return;
    }

    const isAtBottom =
      messagesContainer.scrollHeight -
        messagesContainer.scrollTop -
        messagesContainer.clientHeight <
      150;

    if (isAtBottom || force) {
      messagesContainer.scrollTo({ top: messagesContainer.scrollHeight, behavior: 'instant' });
    }
  }, []);

  const onDismissThinkingIndicator = useCallback(() => {
    setShouldShowThinkingIndicator(false);
  }, []);

  const onSendRequest = async () => {
    const chatStore = useChatStore.getState();
    const preferencesStore = usePreferencesStore.getState();
    const generatedMessageId = uuidv4();

    if (!conversationData?.conversation) {
      return;
    }

    const lastMessage = last(messages);
    if (conversationData.conversation.processing || lastMessage?.role === 'user') {
      return;
    }

    addMessageToConversation({
      conversationId: conversationData.conversation._id,
      messageUuid: generatedMessageId,
      content: chatStore.content,
      type: 'text',
      role: 'user',
      status: 'complete',
    });

    setShouldShowThinkingIndicator(true);

    const model = preferencesStore.model;
    const normalizedModel = preferencesStore.model.type as keyof CustomApiKeys;
    const isCustomApiKeyEnabled = preferencesStore.isApiKeyEnabled(normalizedModel);
    const currentApiKeyValue = preferencesStore.getApiKey(normalizedModel);
    const customApiKey =
      isCustomApiKeyEnabled && !isEmpty(currentApiKeyValue)
        ? preferencesStore.getApiKey(normalizedModel)
        : undefined;

    startChat({
      content: chatStore.content,
      conversationId: conversationData.conversation._id,
      attachments: chatStore.attachments as CompletedChatAttachment[],
      reasoning: chatStore.reasoningEnabled,
      model,
      customApiKey,
    }).catch(() => {
      setShouldShowThinkingIndicator(false);
    });

    chatStore.resetState();
  };

  const onScrollHander = useCallback(() => {
    const messagesContainer = messagesContainerRef.current;
    if (!messagesContainer) {
      return;
    }

    currentScrollPosition.current = messagesContainer.scrollTop;

    setShouldDisplayScrollToBottom(
      messagesContainer.scrollHeight -
        messagesContainer.scrollTop -
        messagesContainer.clientHeight >
        100
    );
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return (
    <div className="relative grid h-screen grid-rows-[1fr_auto] pt-10">
      <div
        ref={messagesContainerRef}
        className="overflow-auto scroll-auto"
        onScroll={onScrollHander}
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 space-y-12 px-4 pt-4 pb-10 break-words whitespace-pre-wrap text-white duration-300">
          {messages?.map((message, index) => (
            <ChatMessage
              key={message.messageUuid}
              {...message}
              shouldAnimate={index === 0 && messages.length === 1}
              onScrollToBottom={scrollToBottom}
              onDismissThinkingIndicator={onDismissThinkingIndicator}
            />
          ))}
          {shouldShowThinkingIndicator && messages.length > 0 && <ThinkingIndicator />}
        </div>
      </div>
      <ScrollToBottomPanel
        shouldDisplayScrollToBottom={shouldDisplayScrollToBottom}
        onScrollToBottom={() => scrollToBottom(true)}
      />
      <ChatMessageInputPanel
        isProcessing={conversationData?.conversation?.processing || false}
        onSendChatRequest={onSendRequest}
      />
    </div>
  );
};
