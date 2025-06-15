import { KeyboardEvent } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

import { KEY_MAP } from '@t3chat/constants/keyboard';

const TEXTAREA_ROWS_COUNT = {
  MIN: 2,
  MAX: 8,
};

interface ChatTextAreaProps {
  onRequestSubmit: () => void;
}

export const ChatTextArea = ({ onRequestSubmit }: ChatTextAreaProps) => {
  const onTextareaKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === KEY_MAP.ENTER && !event.shiftKey) {
      event.preventDefault();
      onRequestSubmit();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <TextareaAutosize
        name="content"
        className="placeholder:text-secondary-foreground/60 w-full resize-none bg-transparent leading-6 text-white outline-none disabled:opacity-0"
        placeholder="Type your message here..."
        minRows={TEXTAREA_ROWS_COUNT.MIN}
        maxRows={TEXTAREA_ROWS_COUNT.MAX}
        onKeyDown={onTextareaKeyDown}
      />
    </div>
  );
};
