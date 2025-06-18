import Dexie, { type EntityTable } from 'dexie';
import { Doc } from '@t3chat-convex/_generated/dataModel';

export const db = new Dexie('conversations') as Dexie & {
  conversations: EntityTable<Doc<'conversations'>, '_id'>;
  messages: EntityTable<Doc<'messages'>, '_id'>;
};

db.version(1).stores({
  conversations:
    '++_id, userId, conversationUuid, title, processing, pinned, deleted, createdAt, updatedAt',
  messages:
    '++_id, conversationId, role, content, type, createdAt, updatedAt, resumableStreamId, status',
});
