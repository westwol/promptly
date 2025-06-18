'use client';

import { PropsWithChildren, useEffect } from 'react';

import { useConvex } from 'convex/react';
import { db } from '@t3chat/lib/db';
import { useSessionStore } from '@t3chat/store/session';
import { api } from '@t3chat-convex/_generated/api';

export const LocalDatabaseSyncProvider = ({ children }: PropsWithChildren) => {
  const client = useConvex();
  const sessionId = useSessionStore((state) => state.sessionId);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    const watch = client.watchQuery(api.conversations.get, { sessionId });
    const unsubscribe = watch.onUpdate(() => {
      try {
        const result = watch.localQueryResult();
        const conversations = result ?? [];

        // Clear existing conversations and add new ones
        db.conversations.clear();
        if (conversations.length > 0) {
          db.conversations.bulkAdd(conversations);
        }
      } catch (error) {
        console.error('Error syncing conversations to local database:', error);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [sessionId, client]);

  return <>{children}</>;
};
