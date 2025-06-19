import React, { useState } from 'react';
import { toast } from 'sonner';
import { Copy } from 'lucide-react';

import { Doc } from '@t3chat-convex/_generated/dataModel';
import { cn } from '@t3chat/lib/utils';

import { HighlightedChatMessageContent } from './HighlightedChatMessageContent';
import { useStreamMessage } from './useStreamMessage';

interface ChatMessageProps extends Doc<'messages'> {
  onScrollToBottom: () => void;
  onDismissThinkingIndicator: () => void;
  shouldAnimate: boolean;
}

export const ChatMessage = React.memo(
  ({
    messageUuid,
    content,
    role,
    resumableStreamId,
    onScrollToBottom,
    status,
    onDismissThinkingIndicator,
    shouldAnimate,
  }: ChatMessageProps) => {
    const { currentContent } = useStreamMessage({
      resumableStreamId,
      messageUuid,
      onDismissThinkingIndicator,
      onScrollToBottom,
      initialContent: content,
    });

    const onCopyMessage = () => {
      navigator.clipboard.writeText(content);
      toast('Copied to the clipboard');
    };

    if (currentContent.length === 0) {
      return null;
    }

    return (
      <div
        className={cn(
          'group my-1',
          role === 'user' && 'bg-primary ml-auto rounded-md p-3',
          shouldAnimate && 'animate-in fade-in slide-in-from-bottom-4 duration-500'
        )}
      >
        <HighlightedChatMessageContent content={currentContent} />
        {role === 'assistant' && status === 'complete' && (
          <>
            <button
              className="hover:bg-primary/80 invisible mt-4 cursor-pointer items-center justify-center rounded-md p-1.5 group-hover:visible"
              onClick={onCopyMessage}
            >
              <Copy size={18} />
            </button>
            <div className="h-[40px] w-full" />
          </>
        )}
      </div>
    );
  }
);

ChatMessage.displayName = 'ChatMessage';
