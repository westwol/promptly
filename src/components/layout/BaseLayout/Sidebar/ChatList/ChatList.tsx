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

            const shouldShowLoadingIndicator = conversation.title.length === 0;

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
                  className={`flex justify-between rounded-sm p-2 text-sm ${
                    isSelected ? 'bg-[#2C2632]' : 'hover:bg-[#2C2632]'
                  }`}
                  href={`/conversations/${conversation.conversationUuid}`}
                  prefetch={true}
                >
                  {conversation.title || 'New conversation'}
                  {shouldShowLoadingIndicator && (
                    <motion.svg
                      aria-hidden="true"
                      className="h-4 w-4 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentFill"
                      />
                    </motion.svg>
                  )}
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
