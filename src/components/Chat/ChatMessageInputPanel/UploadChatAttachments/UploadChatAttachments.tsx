import { ChangeEvent, Dispatch, SetStateAction, useRef } from 'react';
import { toast } from 'sonner';
import { Paperclip } from 'lucide-react';

import { Tooltip } from '@t3chat/components/ui';
import { useUploadThing } from '@t3chat/utils/uploadthing';
import { ChatAttachment } from '@t3chat/interfaces/chat';

interface UploadChatAttachmentsProps {
  onSetAttachments: Dispatch<SetStateAction<ChatAttachment[]>>;
}

export const UploadChatAttachments = ({ onSetAttachments }: UploadChatAttachmentsProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing('attachments', {
    onClientUploadComplete: (attachments) => {
      toast.success('Attachments uploaded!');
      onSetAttachments((currentAttachments) =>
        currentAttachments.map((currentAttachment) => {
          const uploadedAttachment = attachments.find(
            (attachment) => attachment.name === currentAttachment.name
          );
          if (uploadedAttachment) {
            return {
              ...currentAttachment,
              status: 'completed',
              url: uploadedAttachment.ufsUrl,
            };
          }
          return currentAttachment;
        })
      );
    },
    onUploadError: () => {
      toast.error('Error uploading attachments');
      onSetAttachments((currentAttachments) =>
        currentAttachments.map((currentAttachment) => {
          return currentAttachment.status === 'uploading'
            ? { ...currentAttachment, status: 'error' }
            : currentAttachment;
        })
      );
    },
  });

  const onSelectAttachments = (event: ChangeEvent<HTMLInputElement>) => {
    const files: File[] = event.target.files ? Array.from(event.target.files) : [];

    if (files.length === 0) {
      return;
    }

    startUpload(files);
    onSetAttachments((currentAttachments) => [
      ...currentAttachments,
      ...files.map((file) => ({ name: file.name, status: 'uploading' }) as ChatAttachment),
    ]);
  };

  const onStartSelectingAttachments = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onSelectAttachments}
      />
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-600 p-1.5 text-xs text-white"
            onClick={onStartSelectingAttachments}
            disabled={isUploading}
          >
            <Paperclip size={12} />
            Attach
          </button>
        </Tooltip.Trigger>
        <Tooltip.Content sideOffset={10}>Add an attachment: png, jpg, pdf</Tooltip.Content>
      </Tooltip.Root>
    </>
  );
};
