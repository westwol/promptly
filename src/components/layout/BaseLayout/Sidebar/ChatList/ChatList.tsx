"use client";

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
          <li
            key={conversation._id}
            className="p-2 hover:bg-red-950 rounded-sm text-sm"
          >
            {conversation.title}
          </li>
        ))}
      </ul>
    </div>
  );
};
