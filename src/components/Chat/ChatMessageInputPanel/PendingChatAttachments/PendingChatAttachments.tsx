import { useMemo } from 'react';
import { X, FileText, FileImage, File } from 'lucide-react';

import { Spinner, Tooltip } from '@t3chat/components/ui';
import { useChatStore } from '@t3chat/store/chat';

import { groupAttachments } from './utils';

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) {
    return <FileImage size={16} />;
  }
  if (mimeType.includes('pdf') || mimeType.includes('text/') || mimeType.includes('document')) {
    return <FileText size={16} />;
  }
  return <File size={16} />;
};

export const PendingChatAttachments = () => {
  const currentAttachments = useChatStore((state) => state.attachments);
  const setAttachments = useChatStore((state) => state.setAttachments);

  const onRemoveAttachment = (name: string) => {
    setAttachments(currentAttachments.filter((attachment) => attachment.name !== name));
  };

  const groupedAttachments = useMemo(() => {
    return groupAttachments(currentAttachments);
  }, [currentAttachments]);

  if (currentAttachments.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1">
      <ul className="flex gap-1">
        {groupedAttachments.completed.map((attachment) => (
          <Tooltip.Root key={attachment.name}>
            <Tooltip.Trigger asChild>
              <li
                className="bg-primary relative flex items-center gap-2 rounded-md text-sm text-white transition-opacity hover:opacity-70"
                key={attachment.name}
              >
                {attachment.mimeType.startsWith('image/') ? (
                  <img src={attachment.url} className="h-16 w-16 rounded-md object-cover" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-md bg-gray-700">
                    {getFileIcon(attachment.mimeType)}
                  </div>
                )}
                <button
                  className="absolute top-1 right-1 cursor-pointer rounded-sm bg-black/50 p-1"
                  onClick={() => onRemoveAttachment(attachment.name)}
                >
                  <X size={12} color="white" />
                </button>
              </li>
            </Tooltip.Trigger>
            <Tooltip.Content sideOffset={5}>{attachment.name}</Tooltip.Content>
          </Tooltip.Root>
        ))}
      </ul>
      {groupedAttachments.uploading.length > 0 && (
        <ul className="flex flex-col gap-1">
          {groupedAttachments.uploading.map((attachment) => (
            <li
              className="bg-primary flex animate-pulse items-center gap-2 rounded-md p-2 text-sm text-white"
              key={attachment.name}
            >
              <Spinner />
              <span>{attachment.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
