'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Preloaded, usePreloadedQuery } from 'convex/react';
import { isToday, isYesterday, isThisWeek } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

import { api } from '@t3chat-convex/_generated/api';
import { Doc } from '@t3chat-convex/_generated/dataModel';
import { useMemo } from 'react';
import { LucideSearch } from 'lucide-react';
import { Spinner } from '@t3chat/components/ui';

interface ChatListProps {
  preloadedConversations: Preloaded<typeof api.conversations.get>;
}

export const ChatList = ({ preloadedConversations }: ChatListProps) => {
  const conversations = usePreloadedQuery(preloadedConversations);
  const pathname = usePathname();

  const groupedConversations = useMemo(() => {
    const currentConversations = conversations || [];
    return currentConversations.reduce(
      (groups: Record<string, Doc<'conversations'>[]>, conversation) => {
        const date = new Date(conversation.updatedAt);
        switch (true) {
          case isToday(date):
            groups.today.push(conversation);
            break;
          case isYesterday(date):
            groups.yesterday.push(conversation);
            break;
          case isThisWeek(date):
            groups.last7Days.push(conversation);
            break;
          default:
            groups.older.push(conversation);
        }
        return groups;
      },
      {
        today: [],
        yesterday: [],
        last7Days: [],
        older: [],
      }
    );
  }, [conversations]);

  const renderGroup = (label: string, group: Doc<'conversations'>[]) =>
    group.length > 0 && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        <p className="mt-4 mb-2 text-pink-400">{label}</p>
        <AnimatePresence mode="popLayout">
          {group.map((conversation) => {
            const isSelected = pathname === `/conversations/${conversation.conversationUuid}`;

            return (
              <motion.div
                key={conversation.conversationUuid}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  className={`flex items-center justify-between rounded-sm p-2 text-sm ${
                    isSelected ? 'bg-[#2C2632]' : 'hover:bg-[#2C2632]'
                  }`}
                  href={`/conversations/${conversation.conversationUuid}`}
                  prefetch={true}
                >
                  {conversation.title || 'New conversation'}
                  {conversation.processing && <Spinner />}
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="border-chat-border mb-2 flex items-center border-b px-3">
        <LucideSearch className="mr-3 ml-px size-4 text-white" />
        <input
          role="searchbox"
          placeholder="Search conversation..."
          className="placeholder-muted-foreground/50 w-full bg-transparent py-2 text-sm text-white placeholder:select-none focus:outline-none"
        />
      </div>
      <motion.ul className="flex flex-col gap-2 text-white" layout>
        <AnimatePresence mode="popLayout">
          {Object.keys(groupedConversations).map((key) => {
            return renderGroup(key, groupedConversations[key]);
          })}
        </AnimatePresence>
      </motion.ul>
    </motion.div>
  );
};
