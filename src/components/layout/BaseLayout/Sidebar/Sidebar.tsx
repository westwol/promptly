'use client';

import { Preloaded } from 'convex/react';
import { Brain } from 'lucide-react';

import { api } from '@t3chat-convex/_generated/api';

import { ChatList } from './ChatList';
import { AuthModal } from './AuthModal';
import { NewChatButton } from './NewChatButton';

interface SidebarProps {
  preloadedConversations: Preloaded<typeof api.conversations.get>;
}

export const Sidebar = ({ preloadedConversations }: SidebarProps) => {
  return (
    <div className="bg-primary relative flex h-screen flex-col gap-2 transition-all duration-200">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2 text-white">
          <Brain />
          <span className="font-bold">T3.chat</span>
        </div>
      </div>
      <NewChatButton />
      <ChatList preloadedConversations={preloadedConversations} />
      <div className="h-[50px] px-4 text-white">
        <AuthModal />
      </div>
    </div>
  );
};
