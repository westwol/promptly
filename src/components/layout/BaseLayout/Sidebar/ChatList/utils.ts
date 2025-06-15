import { isThisWeek, isToday, isYesterday } from 'date-fns';

import { Doc } from '@t3chat-convex/_generated/dataModel';

export const groupConversationsByCategory = (conversations: Doc<'conversations'>[]) => {
  return conversations.reduce(
    (groups: Record<string, Doc<'conversations'>[]>, conversation) => {
      const date = new Date(conversation.updatedAt);
      switch (true) {
        case conversation.pinned:
          groups.pinned.push(conversation);
          break;
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
      pinned: [],
      today: [],
      yesterday: [],
      last7Days: [],
      older: [],
    }
  );
};
