import { ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Calendar, Star } from 'lucide-react';

import { Doc } from '@t3chat-convex/_generated/dataModel';

import { ChatConversationItem } from './ChatConversationItem/ChatConversationItem';

const CATEGORY_ICON_MAP: Record<string, ReactNode> = {
  pinned: <Star size={16} />,
  today: <Calendar size={16} />,
};

interface ChatListGroupProps {
  label: string;
  conversations: Doc<'conversations'>[];
}

export const ChatListGroup = ({ label, conversations }: ChatListGroupProps) => {
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
        {conversations.map((conversation) => (
          <ChatConversationItem key={conversation.conversationUuid} {...conversation} />
        ))}
      </AnimatePresence>
    </div>
  );
};
