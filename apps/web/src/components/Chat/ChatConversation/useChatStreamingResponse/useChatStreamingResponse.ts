import { useCallback, useEffect, useRef } from 'react';
import { useConvex } from 'convex/react';

import { Doc } from '@t3chat-convex/_generated/dataModel';
import { API_ENDPOINT } from '@t3chat/utils/api';
import { db } from '@t3chat/lib/db';

interface UseStreamingResponseProps {
  messages: Doc<'messages'>[];
  setForcedThinkingIndicator: (value: boolean) => void;
  conversationUuid: string;
}

export const useChatStreamingResponse = ({
  messages,
  setForcedThinkingIndicator,
  conversationUuid,
}: UseStreamingResponseProps) => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const lastStreamReceived = useRef<string>('');
  const isStreamingResponse = useRef<boolean>(false);

  const onStartResumableStream = useCallback(
    (messageId: string, streamId: string) => {
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

      eventSource.onmessage = async (event) => {
        setForcedThinkingIndicator(false);

        // Update the last message in the local database
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.resumableStreamId) {
          await db.messages
            .where('messageUuid')
            .equals(lastMessage.messageUuid)
            .modify((message) => {
              message.content += event.data.replace(/\\n/g, '\n');
              message.updatedAt = new Date().toISOString();
            });
        }
      };

      eventSource.addEventListener('done', async () => {
        console.log('Stream completed, closing connection');
        eventSource.close();
        isStreamingResponse.current = false;
        setForcedThinkingIndicator(false);

        // Update the last message status to complete in the local database
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.resumableStreamId) {
          await db.messages
            .where('messageUuid')
            .equals(lastMessage.messageUuid)
            .modify((message) => {
              message.status = 'complete';
              message.updatedAt = new Date().toISOString();
            });
        }
      });

      eventSource.addEventListener('image', async (event) => {
        try {
          const data = JSON.parse(event.data);
          // Update the last message with image content in the local database
          const lastMessage = messages[messages.length - 1];
          if (lastMessage?.resumableStreamId) {
            await db.messages
              .where('messageUuid')
              .equals(lastMessage.messageUuid)
              .modify((message) => {
                message.content = `![Generated Image](${data.imageUrl})`;
                message.updatedAt = new Date().toISOString();
              });
          }
        } catch (error) {
          console.error('Error processing image event:', error);
        }
      });

      eventSource.onerror = (err) => {
        console.error('SSE error', err);
      };
    },
    [messages, setForcedThinkingIndicator]
  );

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
    onStartResumableStream(lastMessage.messageUuid, lastMessage.resumableStreamId);
  }, [messages, onStartResumableStream]);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        isStreamingResponse.current = false;
        eventSourceRef.current.close();
      }
    };
  }, [conversationUuid]);

  return {};
};
