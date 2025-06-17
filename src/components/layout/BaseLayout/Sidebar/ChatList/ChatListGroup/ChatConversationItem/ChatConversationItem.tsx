import Link from 'next/link';
import { useMutation } from 'convex/react';
import { Pin, Trash2 } from 'lucide-react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { usePathname } from 'next/navigation';

import { api } from '@t3chat-convex/_generated/api';
import { Doc } from '@t3chat-convex/_generated/dataModel';
import { Spinner } from '@t3chat/components/ui';
import { useSessionStore } from '@t3chat/store/session';

const CONTAINER_ANIMATION_PROPS: HTMLMotionProps<'div'> = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.2 },
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  layout: true,
};

const BUTTON_ANIMATION_PROPS: HTMLMotionProps<'div'> = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.15 },
};

export const ChatConversationItem = (conversation: Doc<'conversations'>) => {
  const pathname = usePathname();
  const sessionId = useSessionStore((state) => state.sessionId);
  const isSelected = pathname === `/conversations/${conversation.conversationUuid}`;

  const updateConversation = useMutation(api.conversations.updateConversation).withOptimisticUpdate(
    (localStore, { conversationId, ...updateParams }) => {
      const queryParams = { sessionId };
      const conversations = localStore.getQuery(api.conversations.get, queryParams);
      if (!conversations) {
        return;
      }
      let updatedConversations = conversations.map((conversation) =>
        conversation._id === conversationId ? { ...conversation, ...updateParams } : conversation
      );
      if (updateParams.deleted) {
        updatedConversations = updatedConversations.filter(
          (conversation) => conversation._id !== conversationId
        );
      }
      localStore.setQuery(api.conversations.get, queryParams, updatedConversations);
    }
  );

  return (
    <motion.div key={conversation.conversationUuid} {...CONTAINER_ANIMATION_PROPS}>
      <div className="group relative">
        <Link
          className={`flex items-center justify-between rounded-sm p-2 text-sm ${
            isSelected ? 'bg-tertiary' : 'hover:bg-tertiary'
          } relative overflow-hidden`}
          href={`/conversations/${conversation.conversationUuid}`}
          prefetch={true}
        >
          <span className="truncate">{conversation.title || 'New conversation'}</span>
          {conversation.processing && <Spinner />}
          <div className="to-tertiary absolute inset-0 bg-gradient-to-r from-transparent via-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </Link>
        <div className="bg-tertiary/80 absolute top-1/2 right-2 z-20 flex h-full -translate-y-1/2 items-center gap-1 rounded-md pl-2 opacity-0 transition-opacity group-hover:opacity-100">
          <motion.div {...BUTTON_ANIMATION_PROPS}>
            <button
              className="rounded-sm p-1 hover:opacity-70"
              onClick={(e) => {
                e.preventDefault();
                updateConversation({ conversationId: conversation._id, pinned: true });
              }}
            >
              <Pin size={14} className="text-gray-400" />
            </button>
          </motion.div>
          <motion.div {...BUTTON_ANIMATION_PROPS}>
            <button
              className="rounded-sm p-1 hover:opacity-70"
              onClick={(e) => {
                e.preventDefault();
                updateConversation({ conversationId: conversation._id, deleted: true });
              }}
            >
              <Trash2 size={14} className="text-gray-400" />
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
