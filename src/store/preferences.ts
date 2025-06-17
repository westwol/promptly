import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { LlmModel } from '@t3chat/interfaces/llmModels';
import { AVAILABLE_MODELS } from '@t3chat/fixtures/availableModels';

interface PreferencesState {
  model: LlmModel;
  setModel: (model: LlmModel) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      model: AVAILABLE_MODELS[0],
      setModel: (model) => set({ model }),
    }),
    {
      name: 'preferences',
    }
  )
);
