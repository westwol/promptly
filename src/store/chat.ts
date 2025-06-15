import { create } from 'zustand';

import { ChatAttachment } from '@t3chat/interfaces/chat';

const DEFAULT_CHAT_STORE: ChatStoreFields = {
  content: '',
  webSearchEnabled: false,
  attachments: [],
};

interface ChatStoreFields {
  content: string;
  webSearchEnabled: boolean;
  attachments: ChatAttachment[];
}

interface ChatStoreMethods {
  setContent: (content: string) => void;
  setWebSearch: (webSearchEnabled: boolean) => void;
  setAttachments: (attachments: ChatAttachment[]) => void;
  resetState: () => void;
}

export const useChatStore = create<ChatStoreFields & ChatStoreMethods>()((set) => ({
  ...DEFAULT_CHAT_STORE,
  setContent: (content) => set({ content }),
  setWebSearch: (webSearchEnabled) => set({ webSearchEnabled }),
  setAttachments: (attachments) => set({ attachments }),
  resetState: () => set(DEFAULT_CHAT_STORE),
}));
