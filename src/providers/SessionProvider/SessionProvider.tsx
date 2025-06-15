'use client';

import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { useSessionStore } from '@t3chat/store/session';
import { setSessionCookie } from '@t3chat/utils/sessions';

interface SessionProviderProps {
  sessionId: string;
  children: React.ReactNode;
}

export const SessionProvider = ({ sessionId, children }: SessionProviderProps) => {
  const setSessionId = useSessionStore((state) => state.setSessionId);

  useEffect(() => {
    const _sessionId = sessionId || uuidv4();
    if (!sessionId) {
      setSessionCookie(_sessionId);
    }
    setSessionId(_sessionId);
  }, [sessionId, setSessionId]);

  return <>{children}</>;
};
