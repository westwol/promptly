import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { LlmModel } from '@t3chat/interfaces/llmModels';
import { AVAILABLE_MODELS } from '@t3chat/fixtures/availableModels';

const MAX_RECENT_CHATS = 20;

const DEFAULT_PREFERENCE_STORE = {
  model: AVAILABLE_MODELS[0],
  recentChats: [] as string[],
};

interface PreferencesStoreFields {
  model: LlmModel;
  recentChats: string[];
}

interface PreferenceStoreMethods {
  setModel: (model: LlmModel) => void;
  setRecentChats: (recentChats: string[]) => void;
  addToRecentChats: (conversationUuid: string) => void;
  removeFromRecentChats: (conversationUuid: string) => void;
  clearRecentChats: () => void;
}

export const usePreferencesStore = create<PreferencesStoreFields & PreferenceStoreMethods>()(
  persist(
    (set, get) => ({
      ...DEFAULT_PREFERENCE_STORE,
      setRecentChats: (recentChats) => set({ recentChats }),
      setModel: (model) => set({ model }),

      addToRecentChats: (conversationUuid) => {
        const currentRecentChats = get().recentChats;
        const filteredChats = currentRecentChats.filter((uuid) => uuid !== conversationUuid);
        const updatedRecentChats = [conversationUuid, ...filteredChats];
        const limitedRecentChats = updatedRecentChats.slice(0, MAX_RECENT_CHATS);
        set({ recentChats: limitedRecentChats });
      },
      removeFromRecentChats: (conversationUuid) => {
        const currentRecentChats = get().recentChats;
        const updatedRecentChats = currentRecentChats.filter((uuid) => uuid !== conversationUuid);
        set({ recentChats: updatedRecentChats });
      },
      clearRecentChats: () => set({ recentChats: [] }),
    }),
    {
      name: 'preferences',
    }
  )
);
