"use client";

import { ChatList } from "./ChatList";
import Link from "next/link";
import { useState } from "react";
import { Activity, Brain, ChevronLeft, ChevronRight } from "lucide-react";
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
        <div className="flex items-center gap-2 text-white">
          <Brain />
          <span className="font-bold">T3.chat</span>
        </div>

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
              className="bg-secondary/20 w-full p-2.5 text-sm text-center rounded-md text-white shadow-sm cursor-pointer block font-bold"
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
