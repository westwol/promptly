'use client';

import { Preloaded } from 'convex/react';
import Image from 'next/image';

import { api } from '@t3chat-convex/_generated/api';

import { ChatList } from './ChatList';
import { NewChatButton } from './NewChatButton';
import { SidebarFooter } from './SidebarFooter';

export const Sidebar = () => {
  return (
    <div className="bg-primary relative flex h-screen flex-col transition-all duration-200">
      <div className="flex items-center justify-between pt-4 pb-6">
        <div className="flex w-full items-center justify-center gap-1 text-white">
          <Image width={45} height={45} src="/logo.png" alt="logo" />
          <span className="text-lg font-bold">Promptly</span>
        </div>
      </div>
      <NewChatButton />
      <ChatList />
      <SidebarFooter />
    </div>
  );
};
