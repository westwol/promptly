import { create } from 'zustand';

interface SessionState {
  sessionId: string;
  setSessionId: (sessionId: string) => void;
}

export const useSessionStore = create<SessionState>()((set) => ({
  sessionId: '',
  setSessionId: (sessionId) => set({ sessionId }),
}));
