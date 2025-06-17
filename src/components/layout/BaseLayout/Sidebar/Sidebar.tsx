'use client';

import { Preloaded } from 'convex/react';
import Image from 'next/image';

import { api } from '@t3chat-convex/_generated/api';

import { ChatList } from './ChatList';
import { NewChatButton } from './NewChatButton';
import { SidebarFooter } from './SidebarFooter';

interface SidebarProps {
  preloadedConversations: Preloaded<typeof api.conversations.get>;
}

export const Sidebar = ({ preloadedConversations }: SidebarProps) => {
  return (
    <div className="bg-primary relative flex h-screen flex-col transition-all duration-200">
      <div className="flex items-center justify-between pt-4 pb-6">
        <div className="flex w-full items-center justify-center gap-1 text-white">
          <Image
            width={45}
            height={45}
            src="https://4ae7cyrl9i.ufs.sh/f/IDBheo8vVSXLis60Lau8myPbBM7tOixHRCuIKc4Q2UwWJXf6"
            alt="logo"
          />
          <span className="text-lg font-bold">Promptly</span>
        </div>
      </div>
      <NewChatButton />
      <ChatList preloadedConversations={preloadedConversations} />
      <SidebarFooter />
    </div>
  );
};
