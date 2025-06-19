'use client';

import { usePathname } from 'next/navigation';
import { useConvex } from 'convex/react';

import { api } from '@t3chat-convex/_generated/api';
import { reconcileMessagesByUuid } from '@t3chat/utils/reconciliation';

import { StartConversation } from './StartConversation';
import { ChatConversation } from './ChatConversation';
import { useEffect, useRef } from 'react';

const extractConversationId = (pathname: string) => {
  const segments = pathname.split('/');
  const uuid = segments[segments.length - 1];
  return uuid || undefined;
};

export const Chat = () => {
  const client = useConvex();
  const pathname = usePathname();
  const conversationId = extractConversationId(pathname);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    const watch = client.watchQuery(api.conversations.getById, {
      conversationUuid: conversationId,
    });

    const unsubscribe = watch.onUpdate(async () => {
      try {
        const result = watch.localQueryResult();
        const conversation = result?.conversation;
        const messages = result?.messages || [];

        if (conversation && messages.length > 0) {
          if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
          }

          // Debounce the reconciliation call
          debounceTimeoutRef.current = setTimeout(async () => {
            await reconcileMessagesByUuid(conversationId, messages);
          }, 100); // 100ms debounce
        }
      } catch (error) {
        console.error('Error syncing conversations to local database:', error);
      }
    });

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      unsubscribe();
    };
  }, [conversationId, client]);

  if (!conversationId) {
    return <StartConversation />;
  }

  return <ChatConversation conversationId={conversationId} />;
};
