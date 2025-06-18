import { Doc } from '@t3chat-convex/_generated/dataModel';

export interface ConversationData {
  conversation: Doc<'conversations'>;
  messages: Doc<'messages'>[];
}
