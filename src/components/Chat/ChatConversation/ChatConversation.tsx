'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useConvex, useMutation, useQuery } from 'convex/react';
import clsx from 'clsx';

import { usePreferencesStore } from '@t3chat/store/preferences';
import { startChat } from '@t3chat/utils/api';
import { api } from '@t3chat-convex/_generated/api';

import { ChatMessage } from './ChatMessage';
import { ThinkingIndicator } from './ThinkingIndicator/ThinkingIndicator';
import { ChatMessageInputPanel } from '../ChatMessageInputPanel';
import { Doc } from '@t3chat-convex/_generated/dataModel';
import { CompletedChatAttachment } from '@t3chat/interfaces/chat';

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

  const shouldShowThinkingIndicator = shouldDisplayThinkingIndicator(messages);

  const scrollToBottom = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'instant' });
  }, []);

  const onSendRequest = async (content: string, attachments: CompletedChatAttachment[]) => {
    const preferencesStore = usePreferencesStore.getState();

    if (!conversationData?.conversation) {
      return;
    }

    addMessageToConversation({
      conversationId: conversationData.conversation._id,
      content,
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
        content,
        createdAt: currentDate,
        updatedAt: currentDate,
      } as Doc<'messages'>,
    ]);

    startChat({
      content,
      conversationId: conversationData.conversation._id,
      model: preferencesStore.model.model,
      attachments,
    });
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

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    if (!lastMessage?.resumableStreamId) {
      return;
    }

    if (lastMessage.resumableStreamId === lastStreamReceived.current) {
      return;
    }

    if (lastMessage?.status !== 'streaming') {
      return;
    }

    if (isStreamingResponse.current) {
      return;
    }

    console.log('trigger from useEffect');
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
      if (lastMessage.resumableStreamId === lastStreamReceived.current) {
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
    <div className="grid h-screen grid-rows-[1fr_auto]">
      <div className="overflow-auto" ref={messagesContainerRef} style={{ scrollBehavior: 'auto' }}>
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 space-y-12 px-4 pt-4 pb-10 break-words whitespace-pre-wrap text-white">
          {messages.map((message, i) =>
            message.content.length > 0 ? (
              <div
                key={i}
                className={clsx(
                  'my-1',
                  message.role === 'user' && 'ml-auto rounded-md bg-[#2C2632] p-3'
                )}
              >
                <ChatMessage content={message.content} />
              </div>
            ) : null
          )}
          {shouldShowThinkingIndicator && <ThinkingIndicator />}
        </div>
      </div>
      <ChatMessageInputPanel onSendChatRequest={onSendRequest} />
    </div>
  );
};
