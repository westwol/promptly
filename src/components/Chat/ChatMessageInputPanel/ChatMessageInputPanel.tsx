import { FormEvent, useRef, KeyboardEvent } from 'react';
import { ArrowUp } from 'lucide-react';

import { ModelSelectionPopover } from './ModelSelectionPopover';
import { KEY_MAP } from '@t3chat/constants/keyboard';

interface ChatMessageInputPanelProps {
  onSendChatRequest: (content: string) => void;
}

export const ChatMessageInputPanel = ({ onSendChatRequest }: ChatMessageInputPanelProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const onSubmitRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formElements = form.elements as typeof form.elements & {
      content: { value: string };
    };
    const content = formElements.content.value;

    onSendChatRequest(content);

    formElements.content.value = '';
    if (buttonRef.current) {
      buttonRef.current.disabled = true;
    }
  };

  const onTextareaKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === KEY_MAP.ENTER && !event.shiftKey) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  const onTextareaInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
    if (buttonRef.current) {
      buttonRef.current.disabled = !event.currentTarget.value;
    }
  };

  return (
    <form
      ref={formRef}
      className="text-secondary-foreground relative mx-auto flex w-full flex-col items-stretch gap-2 rounded-t-xl bg-[#2C2632] px-3 pt-3 max-sm:pb-6 sm:max-w-3xl"
      onSubmit={onSubmitRequest}
    >
      <textarea
        name="content"
        className="placeholder:text-secondary-foreground/60 w-full resize-none bg-transparent leading-6 text-white outline-none disabled:opacity-0"
        placeholder="Type your message here..."
        onKeyDown={onTextareaKeyDown}
        onInput={onTextareaInput}
      />
      <ModelSelectionPopover />
      <button
        ref={buttonRef}
        className="send-button absolute right-5 bottom-5 z-10 flex h-9 w-9 items-center justify-center rounded-md disabled:opacity-70"
        type="submit"
        disabled
      >
        <ArrowUp color="white" size={20} />
      </button>
    </form>
  );
};
