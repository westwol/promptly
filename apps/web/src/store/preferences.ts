import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { LlmModel } from '@t3chat/interfaces/llmModels';
import { AVAILABLE_MODELS } from '@t3chat/fixtures/availableModels';

const MAX_RECENT_CHATS = 20;

interface ApiKeyConfig {
  key: string;
  enabled: boolean;
}

export interface CustomApiKeys {
  openai: ApiKeyConfig;
  anthropic: ApiKeyConfig;
  gemini: ApiKeyConfig;
  deepseek: ApiKeyConfig;
}

const DEFAULT_CUSTOM_API_KEYS_STATE = {
  openai: { key: '', enabled: false },
  anthropic: { key: '', enabled: false },
  gemini: { key: '', enabled: false },
  deepseek: { key: '', enabled: false },
};

const DEFAULT_PREFERENCE_STORE = {
  model: AVAILABLE_MODELS[0],
  recentChats: [] as string[],
  apiKeys: DEFAULT_CUSTOM_API_KEYS_STATE,
};

interface PreferencesStoreFields {
  model: LlmModel;
  recentChats: string[];
  apiKeys: CustomApiKeys;
}

interface PreferenceStoreMethods {
  setModel: (model: LlmModel) => void;
  setRecentChats: (recentChats: string[]) => void;
  addToRecentChats: (conversationUuid: string) => void;
  removeFromRecentChats: (conversationUuid: string) => void;
  clearRecentChats: () => void;
  setApiKey: (provider: keyof CustomApiKeys, key: string) => void;
  setApiKeyEnabled: (provider: keyof CustomApiKeys, enabled: boolean) => void;
  getApiKey: (provider: keyof CustomApiKeys) => string;
  isApiKeyEnabled: (provider: keyof CustomApiKeys) => boolean;
  clearApiKey: (provider: keyof CustomApiKeys) => void;
  clearAllApiKeys: () => void;
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
      setApiKey: (provider, key) => {
        const currentApiKeys = get().apiKeys;
        set({
          apiKeys: {
            ...currentApiKeys,
            [provider]: {
              ...currentApiKeys[provider],
              key,
            },
          },
        });
      },
      setApiKeyEnabled: (provider, enabled) => {
        const currentApiKeys = get().apiKeys;
        set({
          apiKeys: {
            ...currentApiKeys,
            [provider]: {
              ...currentApiKeys[provider],
              enabled,
            },
          },
        });
      },
      getApiKey: (provider) => {
        return get().apiKeys[provider].key;
      },
      isApiKeyEnabled: (provider) => {
        return get().apiKeys[provider].enabled;
      },
      clearApiKey: (provider) => {
        const currentApiKeys = get().apiKeys;
        set({
          apiKeys: {
            ...currentApiKeys,
            [provider]: {
              key: '',
              enabled: false,
            },
          },
        });
      },
      clearAllApiKeys: () => {
        set({
          apiKeys: DEFAULT_CUSTOM_API_KEYS_STATE,
        });
      },
    }),
    {
      name: 'preferences',
    }
  )
);
