import { Dispatch, SetStateAction, useCallback, useEffect, useRef } from 'react';
import { useConvex } from 'convex/react';

import { Doc } from '@t3chat-convex/_generated/dataModel';
import { API_ENDPOINT } from '@t3chat/utils/api';
import { api } from '@t3chat-convex/_generated/api';

interface UseStreamingResponseProps {
  conversationUuid: string;
  messages: Doc<'messages'>[];
  setMessages: Dispatch<SetStateAction<Doc<'messages'>[]>>;
  setForcedThinkingIndicator: (value: boolean) => void;
}

export const useChatStreamingResponse = ({
  conversationUuid,
  messages,
  setMessages,
  setForcedThinkingIndicator,
}: UseStreamingResponseProps) => {
  const client = useConvex();
  const eventSourceRef = useRef<EventSource | null>(null);
  const lastStreamReceived = useRef<string>('');
  const isStreamingResponse = useRef<boolean>(false);

  const onStartResumableStream = useCallback((streamId: string) => {
    // Clean up previous event source
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(`${API_ENDPOINT}/chat/stream?streamId=${streamId}`);

    eventSourceRef.current = eventSource;
    lastStreamReceived.current = streamId;

    eventSource.onopen = () => {
      isStreamingResponse.current = true;
    };

    eventSource.onmessage = (event) => {
      setForcedThinkingIndicator(false);
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
      setMessages((messages) =>
        messages.map((message, idx) =>
          idx === messages.length - 1 ? { ...message, status: 'complete' } : message
        )
      );
    });

    eventSource.addEventListener('image', (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages((messages) => {
          const lastMessage = messages[messages.length - 1];
          if (lastMessage?.resumableStreamId) {
            const updatedMessage = {
              ...lastMessage,
              content: `![Generated Image](${data.imageUrl})`,
            };
            return [...messages.slice(0, -1), updatedMessage];
          }
          return messages;
        });
      } catch (error) {
        console.error('Error processing image event:', error);
      }
    });

    eventSource.onerror = (err) => {
      console.error('SSE error', err);
    };
    // eslint-disable-next-line
  }, []);

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
  }, [messages, onStartResumableStream]);

  useEffect(() => {
    const watch = client.watchQuery(api.conversations.getById, {
      conversationUuid,
    });

    const unsubscribe = watch.onUpdate(() => {
      try {
        const result = watch.localQueryResult();
        const messages = result?.messages || [];
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.resumableStreamId === lastStreamReceived.current) {
          return;
        }
        setMessages(result?.messages || []);
      } catch {}
    });

    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line
  }, [client, conversationUuid]);

  return {};
};
