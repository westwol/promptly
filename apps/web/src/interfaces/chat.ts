type ChatAttachmentStatus = 'uploading' | 'completed' | 'error';

interface ChatAttachmentBase {
  name: string;
  status: ChatAttachmentStatus;
  mimeType: string;
}

export interface UploadingChatAttachment extends ChatAttachmentBase {
  status: 'uploading';
}

export interface CompletedChatAttachment extends ChatAttachmentBase {
  status: 'completed';
  url: string;
}

export interface ErrorChatAttachment extends ChatAttachmentBase {
  status: 'error';
}

export type ChatAttachment =
  | UploadingChatAttachment
  | CompletedChatAttachment
  | ErrorChatAttachment;
