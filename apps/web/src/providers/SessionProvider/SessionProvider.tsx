'use client';

import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { useSessionStore } from '@t3chat/store/session';
import { useAuth } from '@clerk/nextjs';

interface SessionProviderProps {
  children: React.ReactNode;
}

export const SessionProvider = ({ children }: SessionProviderProps) => {
  const { userId } = useAuth();
  const setSessionId = useSessionStore((state) => state.setSessionId);

  useEffect(() => {
    const localStoredSession = localStorage.getItem('local_session') || uuidv4();
    const loggedSession = userId || localStoredSession;
    setSessionId(loggedSession);
  }, [userId, setSessionId]);

  return <>{children}</>;
};
