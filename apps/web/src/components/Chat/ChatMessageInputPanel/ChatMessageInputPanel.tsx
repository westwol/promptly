import { usePreferencesStore } from '@t3chat/store/preferences';

import { ModelSelectionPopover } from './ModelSelectionPopover';
import { PendingChatAttachments } from './PendingChatAttachments';
import { ChatTextArea } from './ChatTextArea';
import { UploadChatAttachments } from './UploadChatAttachments';
import { WebSearchToggle } from './WebSearchToogle';
import { ChatSubmitButton } from './ChatSubmitButton/ChatSubmitButton';
import { ReasoningToggle } from './ReasoningToggle';

interface ChatMessageInputPanelProps {
  isProcessing: boolean;
  onSendChatRequest: () => void;
}

export const ChatMessageInputPanel = ({
  isProcessing,
  onSendChatRequest,
}: ChatMessageInputPanelProps) => {
  const currentModel = usePreferencesStore((state) => state.model);

  return (
    <div className="bg-input relative mx-auto flex w-full flex-col items-stretch gap-2 rounded-t-xl px-3 pt-3 shadow-sm max-sm:pb-6 sm:max-w-3xl">
      <PendingChatAttachments />
      <ChatTextArea onRequestSubmit={onSendChatRequest} />
      <div className="mb-2 flex items-center gap-2">
        <ModelSelectionPopover />
        {currentModel.capabilities.includes('vision') && <UploadChatAttachments />}
        {currentModel.capabilities.includes('web') && <WebSearchToggle />}
        {currentModel.capabilities.includes('reasoning') && <ReasoningToggle />}
      </div>
      <ChatSubmitButton onSendChatRequest={onSendChatRequest} isProcessing={isProcessing} />
    </div>
  );
};
