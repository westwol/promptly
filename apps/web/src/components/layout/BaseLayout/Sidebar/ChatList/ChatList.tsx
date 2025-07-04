'use client';

import { useMemo, useState, useTransition } from 'react';
import { LucideSearch } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';

import { db } from '@t3chat/lib/db';

import { groupConversationsByCategory } from './utils';
import { ChatListGroup } from './ChatListGroup';

export const ChatList = () => {
  const conversations = useLiveQuery(async () => {
    const allConversations = await db.conversations.toArray();
    return allConversations.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });

  const [isPending, startTransition] = useTransition();
  const [conversationSearchQuery, setConversationSearchQuery] = useState<string>('');

  console.log({ isPending });

  const groupedConversations = useMemo(() => {
    const query = conversationSearchQuery.trim().toLocaleLowerCase();
    const initialConversations = conversations || [];

    const filteredConversations =
      query.length === 0
        ? initialConversations
        : initialConversations.filter(
            (conversation) =>
              conversation.title.toLowerCase().includes(query) ||
              conversation._id.toLowerCase().includes(query)
          );

    return groupConversationsByCategory(filteredConversations);
  }, [conversationSearchQuery, conversations]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    startTransition(() => {
      setConversationSearchQuery(value);
    });
  };

  return (
    <div className="scrollbar-hide flex h-full flex-col overflow-y-auto px-6">
      <div className="border-chat-border mt-2 mb-2 flex items-center border-b px-3">
        <LucideSearch className="mr-3 ml-px size-4 text-white" />
        <input
          role="searchbox"
          placeholder="Search conversation"
          className="placeholder-muted-foreground/50 w-full bg-transparent py-2 text-sm text-white placeholder:select-none focus:outline-none"
          value={conversationSearchQuery}
          onChange={handleSearchChange}
        />
      </div>
      <ul className="mt-2 flex flex-1 flex-col gap-4 text-white">
        {Object.keys(groupedConversations).map((key) => (
          <ChatListGroup
            key={`chat-list-group-${key}`}
            label={key}
            conversations={groupedConversations[key]}
          />
        ))}
      </ul>
    </div>
  );
};
