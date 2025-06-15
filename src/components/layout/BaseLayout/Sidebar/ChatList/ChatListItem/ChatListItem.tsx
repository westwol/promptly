import Link from 'next/link';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { Calendar, Star } from 'lucide-react';

import { Doc } from '@t3chat-convex/_generated/dataModel';
import { Spinner } from '@t3chat/components/ui';

const CATEGORY_ICON_MAP: Record<string, ReactNode> = {
  pinned: <Star size={16} />,
  today: <Calendar size={16} />,
};

const ITEM_ANIMATION_PROPS: HTMLMotionProps<'div'> = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.2 },
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  layout: true,
};

interface ChatListItemProps {
  label: string;
  conversations: Doc<'conversations'>[];
}

export const ChatListItem = ({ label, conversations }: ChatListItemProps) => {
  const pathname = usePathname();

  if (conversations.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {CATEGORY_ICON_MAP[label]}
        <span className="text-sm text-gray-400 capitalize">{label}</span>
      </div>
      <AnimatePresence mode="popLayout">
        {conversations.map((conversation) => {
          const isSelected = pathname === `/conversations/${conversation.conversationUuid}`;
          return (
            <motion.div key={conversation.conversationUuid} {...ITEM_ANIMATION_PROPS}>
              <Link
                className={`flex items-center justify-between rounded-sm p-2 text-sm ${
                  isSelected ? 'bg-tertiary' : 'hover:bg-tertiary'
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
    </div>
  );
};
