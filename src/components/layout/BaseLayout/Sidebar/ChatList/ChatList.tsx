"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";

import { api } from "../../../../../../convex/_generated/api";

export const ChatList = () => {
  const conversations = useQuery(api.conversations.get);
  const pathname = usePathname();

  return (
    <div>
      <div>
        <p className="text-white">Search</p>
      </div>
      <ul className="flex flex-col gap-2 text-white">
        {conversations?.map((conversation) => {
          const isSelected = pathname === `/conversations/${conversation.conversationUuid}`;
          return (
            <Link
              key={conversation._id}
              className={`p-2 rounded-sm text-sm ${
                isSelected ? "bg-red-950" : "hover:bg-red-950"
              }`}
              href={`/conversations/${conversation.conversationUuid}`}
              prefetch={true}
            >
              {conversation.title}
            </Link>
          );
        })}
      </ul>
    </div>
  );
};
