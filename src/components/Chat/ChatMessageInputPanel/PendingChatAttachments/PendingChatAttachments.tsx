import { Dispatch, SetStateAction, useMemo } from 'react';
import { X } from 'lucide-react';

import { Spinner } from '@t3chat/components/ui';
import { ChatAttachment } from '@t3chat/interfaces/chat';

import { groupAttachments } from './utils';

interface PendingChatAttachmentsProps {
  attachments: ChatAttachment[];
  onSetAttachments: Dispatch<SetStateAction<ChatAttachment[]>>;
}

export const PendingChatAttachments = ({
  attachments,
  onSetAttachments,
}: PendingChatAttachmentsProps) => {
  const onRemoveAttachment = (name: string) => {
    onSetAttachments((currentAttachments) =>
      currentAttachments.filter((attachment) => attachment.name !== name)
    );
  };

  const groupedAttachments = useMemo(() => {
    return groupAttachments(attachments);
  }, [attachments]);

  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1">
      <ul className="flex gap-1">
        {groupedAttachments.completed.map((attachment) => (
          <li
            className="bg-primary relative flex items-center gap-2 rounded-md text-sm text-white transition-opacity hover:opacity-70"
            key={attachment.name}
          >
            <img src={attachment.url} className="h-16 w-16 rounded-md object-cover" />
            <button
              className="absolute top-1 right-1 cursor-pointer"
              onClick={() => onRemoveAttachment(attachment.name)}
            >
              <X size={16} />
            </button>
          </li>
        ))}
      </ul>
      <ul className="flex flex-col gap-1">
        {groupedAttachments.uploading.map((attachment) => (
          <li
            className="bg-primary flex items-center gap-2 rounded-md p-2 text-sm text-white"
            key={attachment.name}
          >
            <Spinner />
            <span>{attachment.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
