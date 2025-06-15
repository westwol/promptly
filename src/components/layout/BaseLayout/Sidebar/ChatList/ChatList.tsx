'use client';

import { useMemo } from 'react';
import { LucideSearch } from 'lucide-react';
import { Preloaded, usePreloadedQuery } from 'convex/react';

import { api } from '@t3chat-convex/_generated/api';

import { ChatListItem } from './ChatListItem';
import { groupConversationsByCategory } from './utils';

interface ChatListProps {
  preloadedConversations: Preloaded<typeof api.conversations.get>;
}

export const ChatList = ({ preloadedConversations }: ChatListProps) => {
  const conversations = usePreloadedQuery(preloadedConversations);

  const groupedConversations = useMemo(() => {
    return groupConversationsByCategory(conversations || []);
  }, [conversations]);

  return (
    <div className="flex flex-col overflow-y-auto px-6">
      <div className="border-chat-border mb-2 flex items-center border-b px-3">
        <LucideSearch className="mr-3 ml-px size-4 text-white" />
        <input
          role="searchbox"
          placeholder="Search conversation..."
          className="placeholder-muted-foreground/50 w-full bg-transparent py-2 text-sm text-white placeholder:select-none focus:outline-none"
        />
      </div>
      <ul className="mt-4 flex flex-1 flex-col gap-4 text-white">
        {Object.keys(groupedConversations).map((key) => (
          <ChatListItem
            key={`chat-list-group-${key}`}
            label={key}
            conversations={groupedConversations[key]}
          />
        ))}
      </ul>
    </div>
  );
};
