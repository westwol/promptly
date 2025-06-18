'use client';

import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { useSessionStore } from '@t3chat/store/session';
import { useAuth } from '@clerk/nextjs';

export const ANONYMOUS_LOCAL_STORAGE_IDENTIFIER = 'anon_local_session';

interface SessionProviderProps {
  children: React.ReactNode;
}

export const SessionProvider = ({ children }: SessionProviderProps) => {
  const { userId } = useAuth();
  const setSessionId = useSessionStore((state) => state.setSessionId);

  useEffect(() => {
    let storedAnonymousId = localStorage.getItem(ANONYMOUS_LOCAL_STORAGE_IDENTIFIER);
    if (!storedAnonymousId) {
      const newId = `${uuidv4()}-anon`;
      localStorage.setItem(ANONYMOUS_LOCAL_STORAGE_IDENTIFIER, newId);
      storedAnonymousId = newId;
    }
    const loggedSession = userId ?? storedAnonymousId;
    setSessionId(loggedSession);
  }, [userId, setSessionId]);

  return <>{children}</>;
};
