import { ChangeEvent, KeyboardEvent } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

import { KEY_MAP } from '@t3chat/constants/keyboard';
import { useChatStore } from '@t3chat/store/chat';

const TEXTAREA_ROWS_COUNT = {
  MIN: 2,
  MAX: 8,
};

interface ChatTextAreaProps {
  onRequestSubmit: () => void;
}

export const ChatTextArea = ({ onRequestSubmit }: ChatTextAreaProps) => {
  const content = useChatStore((state) => state.content);
  const setContent = useChatStore((state) => state.setContent);

  const onChangeContent = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const content = event.target.value;
    setContent(content);
  };

  const onTextareaKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === KEY_MAP.ENTER && !event.shiftKey) {
      event.preventDefault();
      onRequestSubmit();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <TextareaAutosize
        className="placeholder:text-secondary-foreground/60 w-full resize-none bg-transparent leading-6 text-white outline-none disabled:opacity-0"
        placeholder="Type your message here..."
        minRows={TEXTAREA_ROWS_COUNT.MIN}
        maxRows={TEXTAREA_ROWS_COUNT.MAX}
        value={content}
        onChange={onChangeContent}
        onKeyDown={onTextareaKeyDown}
      />
    </div>
  );
};
