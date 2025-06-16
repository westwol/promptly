'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useConvex, useMutation, useQuery } from 'convex/react';
import { AnimatePresence, motion } from 'framer-motion';

import { usePreferencesStore } from '@t3chat/store/preferences';
import { startChat } from '@t3chat/utils/api';
import { api } from '@t3chat-convex/_generated/api';
import { Doc } from '@t3chat-convex/_generated/dataModel';
import { CompletedChatAttachment } from '@t3chat/interfaces/chat';

import { ChatMessage } from './ChatMessage';
import { ThinkingIndicator } from './ThinkingIndicator/ThinkingIndicator';
import { ChatMessageInputPanel } from '../ChatMessageInputPanel';
import { cn } from '@t3chat/lib/utils';
import { useChatStore } from '@t3chat/store/chat';
import { ChevronDown } from 'lucide-react';

const shouldDisplayThinkingIndicator = (messages: Doc<'messages'>[]) => {
  if (messages.length === 0) {
    return false;
  }
  const lastMessage = messages[messages.length - 1];
  return (
    (lastMessage.status === 'streaming' && lastMessage.content.length === 0) ||
    lastMessage.role === 'user'
  );
};

interface ChatConversationProps {
  conversationId: string;
}

export const ChatConversation = ({ conversationId }: ChatConversationProps) => {
  const client = useConvex();

  const conversationData = useQuery(api.conversations.getById, {
    conversationUuid: conversationId,
  });

  const addMessageToConversation = useMutation(api.conversations.addNewMessageToConversation);

  const [messages, setMessages] = useState<Doc<'messages'>[]>(conversationData?.messages || []);

  const isStreamingResponse = useRef<boolean>(false);
  const lastStreamReceived = useRef<string>('');
  const eventSourceRef = useRef<EventSource | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const currentScrollPosition = useRef<number>(0);
  const [shouldDisplayScrollToBottom, setShouldDisplayScrollToBottom] = useState<boolean>(false);

  const shouldShowThinkingIndicator = shouldDisplayThinkingIndicator(messages);

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

    addMessageToConversation({
      conversationId: conversationData.conversation._id,
      content: chatStore.content,
      role: 'user',
      status: 'complete',
    });

    const currentDate = new Date().toISOString();

    setMessages((messages) => [
      ...messages,
      {
        _id: 'temporal-id',
        status: 'complete',
        role: 'user',
        content: chatStore.content,
        createdAt: currentDate,
        updatedAt: currentDate,
      } as Doc<'messages'>,
    ]);

    startChat({
      content: chatStore.content,
      conversationId: conversationData.conversation._id,
      model: preferencesStore.model,
      attachments: chatStore.attachments as CompletedChatAttachment[],
      reasoning: chatStore.reasoningEnabled,
    });

    chatStore.resetState();
  };

  const onStartResumableStream = (streamId: string) => {
    // Clean up previous event source
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(
      `http://localhost:4000/api/chat/stream?streamId=${streamId}`
    );

    eventSourceRef.current = eventSource;
    lastStreamReceived.current = streamId;

    eventSource.onopen = () => {
      isStreamingResponse.current = true;
    };

    eventSource.onmessage = (event) => {
      setMessages((messages) => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.resumableStreamId) {
          const updatedMessage = {
            ...lastMessage,
            content: lastMessage.content + event.data.replace(/\\n/g, '\n'),
          };
          return [...messages.slice(0, -1), updatedMessage];
        }
        return messages;
      });
    };

    eventSource.addEventListener('done', () => {
      console.log('Stream completed, closing connection');
      eventSource.close();
      isStreamingResponse.current = false;
    });

    eventSource.onerror = (err) => {
      console.error('SSE error', err);
    };
  };

  const onScrollHander = () => {
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
  };

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    if (!lastMessage?.resumableStreamId) {
      return;
    }

    if (lastMessage?.resumableStreamId === lastStreamReceived.current) {
      return;
    }

    if (lastMessage?.status !== 'streaming') {
      return;
    }

    if (isStreamingResponse.current) {
      return;
    }

    lastStreamReceived.current = lastMessage.resumableStreamId;
    onStartResumableStream(lastMessage.resumableStreamId);
  }, [messages]);

  useEffect(() => {
    const watch = client.watchQuery(api.conversations.getById, {
      conversationUuid: conversationId,
    });

    const unsubscribe = watch.onUpdate(() => {
      const result = watch.localQueryResult();
      const messages = result?.messages || [];
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.resumableStreamId === lastStreamReceived.current) {
        return;
      }
      setMessages(result?.messages || []);
    });

    return () => {
      unsubscribe();
    };
  }, [client, conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return (
    <div className="relative grid h-screen grid-rows-[1fr_auto]">
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
      <AnimatePresence>
        {shouldDisplayScrollToBottom && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-primary/80 absolute bottom-30 left-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center gap-2 rounded-xl p-2 text-xs text-white"
            onClick={() => scrollToBottom(true)}
          >
            <span className="font-bold">Scroll to the bottom</span>
            <ChevronDown size={12} />
          </motion.button>
        )}
      </AnimatePresence>
      <ChatMessageInputPanel onSendChatRequest={onSendRequest} />
    </div>
  );
};
