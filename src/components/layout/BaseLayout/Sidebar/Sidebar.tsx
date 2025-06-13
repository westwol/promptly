"use client";

import { ChatList } from "./ChatList";
import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Preloaded } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

interface SidebarProps {
  preloadedConversations: Preloaded<typeof api.conversations.get>;
}

export const Sidebar = ({ preloadedConversations }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={`relative bg-primary flex flex-col gap-2 h-screen transition-all duration-200 ${
        isCollapsed ? "w-[60px]" : "w-full"
      }`}
    >
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && <h1 className="text-white">T3 Chat</h1>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-white hover:bg-[#2C2632] p-1 rounded"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {!isCollapsed && (
        <>
          <div className="px-4">
            <Link
              className="bg-red-700 w-full p-2 text-xs rounded-sm text-white shadow-xs cursor-pointer block"
              href="/"
            >
              New Chat
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto px-4">
            <ChatList preloadedConversations={preloadedConversations} />
          </div>
        </>
      )}
    </div>
  );
};
