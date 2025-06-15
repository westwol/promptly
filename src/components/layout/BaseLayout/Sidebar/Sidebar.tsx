'use client';

import Link from 'next/link';
import { Preloaded } from 'convex/react';
import { Brain } from 'lucide-react';

import { api } from '@t3chat-convex/_generated/api';

import { ChatList } from './ChatList';
import { AuthModal } from './AuthModal';

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

      <div className="px-4">
        <Link
          className="bg-secondary/20 block w-full cursor-pointer rounded-md p-2.5 text-center text-sm font-bold text-white shadow-sm"
          href="/"
        >
          New Chat
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto px-4">
        <ChatList preloadedConversations={preloadedConversations} />
      </div>
      <div className="h-[50px] px-4 text-white">
        <AuthModal />
      </div>
    </div>
  );
};
