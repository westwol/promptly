import Dexie, { type EntityTable } from 'dexie';
import { Doc } from '@t3chat-convex/_generated/dataModel';

export interface MessageWithConversationUuid extends Doc<'messages'> {
  conversationUuid: string;
}

export const db = new Dexie('conversations') as Dexie & {
  conversations: EntityTable<Doc<'conversations'>, '_id'>;
  messages: EntityTable<MessageWithConversationUuid, '_id'>;
};

db.version(2).stores({
  conversations:
    '++_id, userId, conversationUuid, title, processing, pinned, deleted, createdAt, updatedAt',
  messages:
    '++_id, conversationId, conversationUuid, messageUuid, role, content, type, createdAt, updatedAt, resumableStreamId, status',
});
