'use client';

import { X, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import { useLiveQuery } from 'dexie-react-hooks';

import { Doc } from '@t3chat-convex/_generated/dataModel';
import { usePreferencesStore } from '@t3chat/store/preferences';
import { cn } from '@t3chat/lib/utils';
import { db } from '@t3chat/lib/db';

interface ChatTabsProps {
  isCollapsed: boolean;
}

export const ChatTabs = ({ isCollapsed }: ChatTabsProps) => {
  const conversations = useLiveQuery(() => db.conversations.toArray());

  const recentChats = usePreferencesStore((state) => state.recentChats);
  const removeFromRecentChats = usePreferencesStore((state) => state.removeFromRecentChats);
  const pathname = usePathname();
  const router = useRouter();

  const foundChats = recentChats.reduce((chats: Doc<'conversations'>[], conversationUuid) => {
    const foundConversation = conversations?.find(
      (conversation) => conversation.conversationUuid === conversationUuid
    );
    if (foundConversation) {
      chats.push(foundConversation);
    }
    return chats;
  }, []);

  const onCloseTab = (event: React.MouseEvent, conversationUuid: string) => {
    event.preventDefault();
    event.stopPropagation();

    const isClosingActiveTab = pathname === `/chat/${conversationUuid}`;

    if (isClosingActiveTab) {
      const currentTabIndex = foundChats.findIndex(
        (conv) => conv.conversationUuid === conversationUuid
      );
      let nextTab = null;
      if (currentTabIndex < foundChats.length - 1) {
        nextTab = foundChats[currentTabIndex + 1];
      } else if (currentTabIndex > 0) {
        nextTab = foundChats[currentTabIndex - 1];
      }
      router.replace(nextTab ? `/chat/${nextTab.conversationUuid}` : '/');
    }

    removeFromRecentChats(conversationUuid);
  };

  return (
    <div
      className={cn(
        'bg-secondary absolute left-0 z-[20] w-full',
        isCollapsed && 'left-[40px] xl:left-[100px]'
      )}
    >
      <div className="scrollbar-hide flex w-full items-end gap-0.5 overflow-x-auto overflow-y-hidden px-2 py-1">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Link
            href="/"
            className={`group relative flex h-9 max-w-[120px] min-w-0 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-t-lg px-3 text-sm transition-all duration-200 ${
              pathname === '/'
                ? 'bg-secondary text-white shadow-sm'
                : 'bg-primary hover:bg-tertiary text-gray-400 hover:text-white'
            }`}
          >
            <Plus size={14} />
            <span className="truncate text-xs font-medium">New Chat</span>
            {pathname === '/' && (
              <div className="absolute right-0 bottom-0 left-0 h-0.5 rounded-t-sm bg-blue-500" />
            )}
          </Link>
        </motion.div>

        <AnimatePresence mode="popLayout">
          {foundChats.map((conv, index) => {
            const isActive = pathname === `/chat/${conv.conversationUuid}`;

            return (
              <motion.div
                key={`recent-chat-${conv.conversationUuid}`}
                initial={{ opacity: 0, x: -20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.9 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                  ease: 'easeOut',
                }}
                layout
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={`/chat/${conv.conversationUuid}`}
                  className={`group relative flex h-9 max-w-[200px] min-w-0 shrink-0 cursor-pointer items-center justify-between gap-2 rounded-t-lg px-3 text-sm text-white transition-all duration-200 ${
                    isActive ? 'bg-secondary text-white shadow-sm' : 'bg-primary hover:bg-tertiary'
                  }`}
                >
                  <span className="flex-1 truncate text-xs font-medium">
                    {conv.title || 'New conversation'}
                  </span>
                  <button
                    onClick={(e) => onCloseTab(e, conv.conversationUuid)}
                    className="flex-shrink-0 rounded-sm p-0.5 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-gray-600 sm:hidden"
                  >
                    <X size={12} className="text-gray-400 hover:text-white" />
                  </button>
                  <motion.button
                    onClick={(e) => onCloseTab(e, conv.conversationUuid)}
                    className="hidden h-4 w-4 flex-shrink-0 rounded-sm p-0.5 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-gray-600 sm:block"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={12} className="text-gray-400 hover:text-white" />
                  </motion.button>
                  {isActive && (
                    <motion.div
                      className="absolute right-0 bottom-0 left-0 h-0.5 rounded-t-sm bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700"
                      layoutId="activeTab"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
