import { ArrowUp } from 'lucide-react';

import { useChatStore } from '@t3chat/store/chat';

interface ChatSubmitButtonProps {
  onSendChatRequest: () => void;
  isProcessing: boolean;
}

export const ChatSubmitButton = ({ onSendChatRequest, isProcessing }: ChatSubmitButtonProps) => {
  const content = useChatStore((state) => state.content);

  return (
    <button
      className="send-button absolute right-5 bottom-5 z-10 flex h-9 w-9 items-center justify-center rounded-md disabled:opacity-70"
      disabled={content.length === 0 || isProcessing}
      onClick={onSendChatRequest}
    >
      <ArrowUp color="white" size={20} />
    </button>
  );
};
