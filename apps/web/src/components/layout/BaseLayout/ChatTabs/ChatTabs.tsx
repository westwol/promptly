'use client';

import { Preloaded, usePreloadedQuery } from 'convex/react';
import { X, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import { api } from '@t3chat-convex/_generated/api';
import { Doc } from '@t3chat-convex/_generated/dataModel';
import { usePreferencesStore } from '@t3chat/store/preferences';
import { cn } from '@t3chat/lib/utils';

interface ChatTabsProps {
  isCollapsed: boolean;
  preloadedConversations: Preloaded<typeof api.conversations.get>;
}

export const ChatTabs = ({ isCollapsed, preloadedConversations }: ChatTabsProps) => {
  const conversations = usePreloadedQuery(preloadedConversations);
  const recentChats = usePreferencesStore((state) => state.recentChats);
  const removeFromRecentChats = usePreferencesStore((state) => state.removeFromRecentChats);
  const pathname = usePathname();
  const router = useRouter();

  const foundChats = recentChats.reduce((chats: Doc<'conversations'>[], conversationUuid) => {
    const foundConversation = conversations.find(
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

    const isClosingActiveTab = pathname === `/conversations/${conversationUuid}`;

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
      router.replace(nextTab ? `/conversations/${nextTab.conversationUuid}` : '/');
    }

    removeFromRecentChats(conversationUuid);
  };

  return (
    <div className={cn('bg-secondary absolute left-0 z-[20]', isCollapsed && 'left-[100px]')}>
      <div className="scroll-x-auto scrollbar-hide flex items-end gap-0.5 overflow-auto px-2 py-1">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Link
            href="/"
            className={`group relative flex max-w-[120px] min-w-0 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-t-lg px-3 py-2.5 text-sm transition-all duration-200 ${
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
            const isActive = pathname === `/conversations/${conv.conversationUuid}`;

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
                  href={`/conversations/${conv.conversationUuid}`}
                  className={`group relative flex max-w-[200px] min-w-0 shrink-0 cursor-pointer items-center gap-2 rounded-t-lg px-3 py-2.5 text-sm text-white transition-all duration-200 ${
                    isActive ? 'bg-secondary text-white shadow-sm' : 'bg-primary hover:bg-tertiary'
                  }`}
                >
                  <span className="truncate text-xs font-medium">
                    {conv.title || 'New conversation'}
                  </span>
                  <motion.button
                    onClick={(e) => onCloseTab(e, conv.conversationUuid)}
                    className="rounded-sm p-0.5 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-gray-600"
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
