import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
export default defineSchema({
    conversations: defineTable({
        userId: v.optional(v.string()), // References to user id
        conversationUuid: v.string(), // Conversation uuid
        title: v.string(), // Optional title for group chats or AI context label
        processing: v.boolean(), // Track when a conversation is generating a message
        pinned: v.boolean(), // Track when a conversation is pinned
        deleted: v.optional(v.boolean()), // logic deletion
        createdAt: v.string(), // When the conversation was started
        updatedAt: v.string(), // Last update time
    }).index('by_user_id', ['userId']),
    messages: defineTable({
        conversationId: v.id('conversations'), // Parent conversation
        role: v.union(v.literal('user'), v.literal('assistant'), v.literal('system')),
        content: v.string(), // Full message text (updated as tokens arrive)
        type: v.union(v.literal('text'), v.literal('image')), // message type to differentiate image gen
        createdAt: v.string(), // Timestamp of first token
        updatedAt: v.string(), // Last token arrival time
        resumableStreamId: v.optional(v.string()),
        status: v.union(v.literal('pending'), v.literal('streaming'), v.literal('complete'), v.literal('error')),
    }).index('by_conversation', ['conversationId']),
});
