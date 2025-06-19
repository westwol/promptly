import { useCallback, useEffect, useRef, useState } from 'react';

import { API_ENDPOINT } from '@t3chat/utils/api';
import { db } from '@t3chat/lib/db';

interface UseStreamMessageProps {
  initialContent: string;
  messageUuid: string;
  resumableStreamId?: string;
  onScrollToBottom: () => void;
  onDismissThinkingIndicator: () => void;
}

export const useStreamMessage = ({
  initialContent,
  messageUuid,
  onScrollToBottom,
  resumableStreamId,
  onDismissThinkingIndicator,
}: UseStreamMessageProps) => {
  const [currentContent, setCurrentContent] = useState(initialContent);

  const eventSourceRef = useRef<EventSource | null>(null);
  const lastStreamReceived = useRef<string>('');
  const isStreamingResponse = useRef<boolean>(false);

  const onStartResumableStream = useCallback(
    (resumableStreamId: string, messageUuid: string) => {
      // Clean up previous event source
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const eventSource = new EventSource(
        `${API_ENDPOINT}/chat/stream?streamId=${resumableStreamId}`
      );

      eventSourceRef.current = eventSource;
      lastStreamReceived.current = resumableStreamId;

      eventSource.onopen = () => {
        isStreamingResponse.current = true;
      };

      eventSource.onmessage = async (event) => {
        onDismissThinkingIndicator();
        setCurrentContent((currentContent) => currentContent + event.data.replace(/\\n/g, '\n'));
        onScrollToBottom();
      };

      eventSource.addEventListener('image', async (event) => {
        try {
          const data = JSON.parse(event.data);
          setCurrentContent(`![Generated Image](${data.imageUrl})`);
        } catch (error) {
          console.error('Error processing image event:', error);
        }
      });

      eventSource.addEventListener('done', async () => {
        eventSource.close();
        isStreamingResponse.current = false;
        onDismissThinkingIndicator();
        console.log('Stream completed, closing connection');
        // Set this message as completed
        await db.messages
          .where('messageUuid')
          .equals(messageUuid)
          .modify((message) => {
            message.status = 'complete';
            message.updatedAt = new Date().toISOString();
          });
      });

      eventSource.onerror = (err) => {
        isStreamingResponse.current = false;
        console.error('SSE error', err);
      };
    },
    [onDismissThinkingIndicator, onScrollToBottom]
  );

  useEffect(() => {
    if (!resumableStreamId || isStreamingResponse.current) {
      return;
    }

    onStartResumableStream(resumableStreamId, messageUuid);
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [resumableStreamId, messageUuid, onStartResumableStream]);

  return { currentContent };
};
