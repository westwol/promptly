"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { isToday, isYesterday, isThisWeek } from "date-fns";

import { api } from "../../../../../../convex/_generated/api";
import { useMemo } from "react";
import { Doc } from "../../../../../../convex/_generated/dataModel";

export const ChatList = () => {
  const conversations = useQuery(api.conversations.get);
  const pathname = usePathname();

  const groupedConversations = useMemo(() => {
    const currentConversations = conversations || [];
    return currentConversations.reduce(
      (groups: Record<string, Doc<"conversations">[]>, conversation) => {
        const date = new Date(conversation.updatedAt);
        switch (true) {
          case isToday(date):
            groups.today.push(conversation);
            break;
          case isYesterday(date):
            groups.yesterday.push(conversation);
            break;
          case isThisWeek(date):
            groups.last7Days.push(conversation);
            break;
          default:
            groups.older.push(conversation);
        }
        return groups;
      },
      {
        today: [],
        yesterday: [],
        last7Days: [],
        older: [],
      },
    );
  }, [conversations]);

  console.log({ groupedConversations });

  const renderGroup = (label: string, group: Doc<"conversations">[]) =>
    group.length > 0 && (
      <>
        <p className="text-pink-400 mt-4 mb-2">{label}</p>
        {group.map((conversation) => {
          const isSelected =
            pathname === `/conversations/${conversation.conversationUuid}`;
          return (
            <Link
              key={conversation._id}
              className={`p-2 rounded-sm text-sm ${
                isSelected ? "bg-[#2C2632]" : "hover:bg-[#2C2632]"
              }`}
              href={`/conversations/${conversation.conversationUuid}`}
              prefetch={true}
            >
              {conversation.title || "New conversation"}
            </Link>
          );
        })}
      </>
    );

  return (
    <div>
      <div>
        <p className="text-white">Search</p>
      </div>
      <ul className="flex flex-col gap-2 text-white">
        {Object.keys(groupedConversations).map((key) => {
          return renderGroup(key, groupedConversations[key]);
        })}
      </ul>
    </div>
  );
};
