import { FormEvent, useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';

import { ChatAttachment } from '@t3chat/interfaces/chat';

import { ModelSelectionPopover } from './ModelSelectionPopover';
import { PendingChatAttachments } from './PendingChatAttachments';
import { ChatTextArea } from './ChatTextArea';
import { UploadChatAttachments } from './UploadChatAttachments';
import { WebSearchToggle } from './WebSearchToogle';

interface ChatMessageInputPanelProps {
  onSendChatRequest: (content: string, images?: File[]) => void;
}

export const ChatMessageInputPanel = ({ onSendChatRequest }: ChatMessageInputPanelProps) => {
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [webSearchEnabled, setWebSearchEnabled] = useState<boolean>(false);

  const formRef = useRef<HTMLFormElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const onSubmitRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formElements = form.elements as typeof form.elements & {
      content: { value: string };
    };
    const content = formElements.content.value;

    onSendChatRequest(content, attachments);
    setAttachments([]);
    formElements.content.value = '';
  };

  const onRequestSubmit = () => {
    formRef.current?.requestSubmit();
  };

  return (
    <form
      ref={formRef}
      className="text-secondary-foreground relative mx-auto flex w-full flex-col items-stretch gap-2 rounded-t-xl bg-[#2C2632] px-3 pt-3 max-sm:pb-6 sm:max-w-3xl"
      onSubmit={onSubmitRequest}
    >
      <PendingChatAttachments attachments={attachments} onSetAttachments={setAttachments} />
      <ChatTextArea onRequestSubmit={onRequestSubmit} />
      <div className="flex items-center gap-2">
        <ModelSelectionPopover />
        <UploadChatAttachments onSetAttachments={setAttachments} />
        <WebSearchToggle
          webSearchEnabled={webSearchEnabled}
          onChangeWebSearch={setWebSearchEnabled}
        />
      </div>
      <button
        ref={buttonRef}
        className="send-button absolute right-5 bottom-5 z-10 flex h-9 w-9 items-center justify-center rounded-md disabled:opacity-70"
        type="submit"
      >
        <ArrowUp color="white" size={20} />
      </button>
    </form>
  );
};
