'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { last } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import { usePreferencesStore } from '@t3chat/store/preferences';
import { startChat } from '@t3chat/utils/api';
import { api } from '@t3chat-convex/_generated/api';
import { Doc } from '@t3chat-convex/_generated/dataModel';
import { CompletedChatAttachment } from '@t3chat/interfaces/chat';
import { cn } from '@t3chat/lib/utils';
import { useChatStore } from '@t3chat/store/chat';

import { ChatMessage } from './ChatMessage';
import { ThinkingIndicator } from './ThinkingIndicator';
import { ChatMessageInputPanel } from '../ChatMessageInputPanel';
import { useChatStreamingResponse } from './useChatStreamingResponse';
import { shouldDisplayThinkingIndicator } from './utils';
import { ScrollToBottomPanel } from './ScrollToBottomPanel';

interface ChatConversationProps {
  conversationId: string;
}

export const ChatConversation = ({ conversationId }: ChatConversationProps) => {
  const conversationData = useQuery(api.conversations.getById, {
    conversationUuid: conversationId,
  });

  const addMessageToConversation = useMutation(
    api.conversations.addNewMessageToConversation
  ).withOptimisticUpdate((localStore) => {
    const queryParams = {
      conversationUuid: conversationId,
    };
    const conversation = localStore.getQuery(api.conversations.getById, queryParams);
    if (!conversation) {
      return;
    }
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

  const [messages, setMessages] = useState<Doc<'messages'>[]>(conversationData?.messages || []);
  const [forcedThinkingIndicator, setForcedThinkingIndicator] = useState<boolean>(false);
  const [shouldDisplayScrollToBottom, setShouldDisplayScrollToBottom] = useState<boolean>(false);

  const shouldShowThinkingIndicator =
    forcedThinkingIndicator || shouldDisplayThinkingIndicator(messages);

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

  const onSendRequest = async () => {
    const chatStore = useChatStore.getState();
    const preferencesStore = usePreferencesStore.getState();

    if (!conversationData?.conversation) {
      return;
    }

    const lastMessage = last(messages);
    if (conversationData.conversation.processing || lastMessage?.role === 'user') {
      return;
    }

    addMessageToConversation({
      conversationId: conversationData.conversation._id,
      content: chatStore.content,
      type: 'text',
      role: 'user',
      status: 'complete',
    });

    const currentDate = new Date().toISOString();

    setMessages((messages) => [
      ...messages,
      {
        _id: uuidv4(),
        status: 'complete',
        role: 'user',
        content: chatStore.content,
        createdAt: currentDate,
        updatedAt: currentDate,
      } as Doc<'messages'>,
    ]);

    setForcedThinkingIndicator(true);

    startChat({
      content: chatStore.content,
      conversationId: conversationData.conversation._id,
      model: preferencesStore.model,
      attachments: chatStore.attachments as CompletedChatAttachment[],
      reasoning: chatStore.reasoningEnabled,
    });

    chatStore.resetState();
  };

  const onScrollHander = useCallback(() => {
    const messagesContainer = messagesContainerRef.current;
    if (!messagesContainer) {
      return;
    }

    const scrollPosition = messagesContainer.scrollTop;
    currentScrollPosition.current = scrollPosition;

    setShouldDisplayScrollToBottom(
      messagesContainer.scrollHeight -
        messagesContainer.scrollTop -
        messagesContainer.clientHeight >
        100
    );
  }, []);

  useChatStreamingResponse({
    messages,
    setMessages,
    setForcedThinkingIndicator,
    conversationUuid: conversationId,
  });

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
        <div
          className={cn(
            'mx-auto flex w-full max-w-3xl flex-col gap-2 space-y-12 px-4 pt-4 pb-10 break-words whitespace-pre-wrap text-white duration-300',
            messages.length > 0 && 'animate-in fade-in-50 zoom-in-95'
          )}
        >
          {messages.map((message) =>
            message.content.length > 0 ? <ChatMessage key={message._id} {...message} /> : null
          )}
          {shouldShowThinkingIndicator && <ThinkingIndicator />}
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
