import { v } from 'convex/values';

import { mutation, query } from './_generated/server';

export const get = query({
  args: {
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, { sessionId }) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject ?? sessionId;

    if (userId) {
      return await ctx.db
        .query('conversations')
        .withIndex('by_user_created_at', (q) => q.eq('userId', userId))
        .filter((q) => q.neq(q.field('deleted'), true))
        .order('desc')
        .collect();
    }

    return [];
  },
});

export const getById = query({
  args: { conversationUuid: v.string() },
  handler: async (ctx, { conversationUuid }) => {
    const conversation = await ctx.db
      .query('conversations')
      .filter((q) => q.eq(q.field('conversationUuid'), conversationUuid))
      .first();

    if (!conversation) {
      return { conversation: undefined, messages: [] };
    }

    const messages = await ctx.db
      .query('messages')
      .filter((q) => q.eq(q.field('conversationId'), conversation._id))
      .collect();

    return { conversation, messages };
  },
});

export const createInitialConversation = mutation({
  args: {
    conversationId: v.string(),
    messageUuid: v.string(),
    content: v.string(),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, { conversationId, messageUuid, content, sessionId }) => {
    const currentDate = new Date().toISOString();
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || sessionId;

    const newConversationId = await ctx.db.insert('conversations', {
      title: '',
      userId,
      conversationUuid: conversationId,
      pinned: false,
      processing: true,
      updatedAt: currentDate,
      createdAt: currentDate,
    });

    await ctx.db.insert('messages', {
      conversationId: newConversationId,
      content,
      messageUuid,
      status: 'complete',
      type: 'text',
      role: 'user',
      createdAt: currentDate,
      updatedAt: currentDate,
    });

    return newConversationId;
  },
});

export const updateConversation = mutation({
  args: {
    conversationId: v.id('conversations'),
    title: v.optional(v.string()),
    processing: v.optional(v.boolean()),
    pinned: v.optional(v.boolean()),
    deleted: v.optional(v.boolean()),
  },
  handler: async (ctx, { conversationId, ...conversationParams }) => {
    const currentDate = new Date().toISOString();
    await ctx.db.patch(conversationId, {
      ...conversationParams,
      updatedAt: currentDate,
    });
  },
});

export const addNewMessageToConversation = mutation({
  args: {
    conversationId: v.id('conversations'),
    messageUuid: v.string(),
    resumableStreamId: v.optional(v.string()),
    role: v.union(v.literal('user'), v.literal('assistant'), v.literal('system')),
    type: v.union(v.literal('text'), v.literal('image')),
    status: v.union(
      v.literal('pending'),
      v.literal('streaming'),
      v.literal('complete'),
      v.literal('error')
    ),
    content: v.string(),
  },
  handler: async (ctx, messageParams) => {
    const currentDate = new Date().toISOString();
    const messageId = await ctx.db.insert('messages', {
      ...messageParams,
      updatedAt: currentDate,
      createdAt: currentDate,
    });
    return messageId;
  },
});

export const updateMessage = mutation({
  args: {
    messageId: v.id('messages'),
    content: v.optional(v.string()),
    role: v.optional(v.union(v.literal('user'), v.literal('assistant'), v.literal('system'))),
    status: v.optional(
      v.union(
        v.literal('pending'),
        v.literal('streaming'),
        v.literal('complete'),
        v.literal('error')
      )
    ),
  },
  handler: async (ctx, { messageId, ...conversationParams }) => {
    const currentDate = new Date().toISOString();
    await ctx.db.patch(messageId, {
      ...conversationParams,
      updatedAt: currentDate,
    });
  },
});

export const completeMessage = mutation({
  args: {
    messageId: v.id('messages'),
    content: v.string(),
  },
  handler: async (ctx, { messageId, content }) => {
    const currentDate = new Date().toISOString();
    await ctx.db.patch(messageId, {
      content,
      status: 'complete',
      updatedAt: currentDate,
    });
  },
});
