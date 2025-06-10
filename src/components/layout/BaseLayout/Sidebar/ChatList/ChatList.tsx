"use client";

import Link from "next/link";
import { useQuery } from "convex/react";

import { api } from "../../../../../../convex/_generated/api";

export const ChatList = () => {
  const conversations = useQuery(api.conversations.get);

  return (
    <div>
      <div>
        <p className="text-white">Search</p>
      </div>
      <ul className="flex flex-col gap-2 text-white">
        {conversations?.map((conversation) => (
          <Link
            key={conversation._id}
            className="p-2 hover:bg-red-950 rounded-sm text-sm"
            href={`/conversations/${conversation._id}`}
          >
            {conversation.title}
          </Link>
        ))}
      </ul>
    </div>
  );
};
