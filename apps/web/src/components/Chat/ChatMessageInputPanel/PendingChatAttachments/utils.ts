import {
  ChatAttachment,
  CompletedChatAttachment,
  ErrorChatAttachment,
  UploadingChatAttachment,
} from '@t3chat/interfaces/chat';

export const groupAttachments = (attachments: ChatAttachment[]) => {
  return attachments.reduce(
    (
      groupedAttachments: {
        uploading: UploadingChatAttachment[];
        completed: CompletedChatAttachment[];
        error: ErrorChatAttachment[];
      },
      attachment
    ) => {
      switch (attachment.status) {
        case 'completed':
          groupedAttachments.completed.push(attachment);
          break;
        case 'uploading':
          groupedAttachments.uploading.push(attachment);
          break;
        case 'error':
          groupedAttachments.error.push(attachment);
          break;
        default:
          break;
      }
      return groupedAttachments;
    },
    { uploading: [], completed: [], error: [] }
  );
};
