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
        .filter((q) => q.eq(q.field('userId'), userId))
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
    content: v.string(),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, { conversationId, content, sessionId }) => {
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
      status: 'complete',
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
    title: v.string(),
  },
  handler: async (ctx, { conversationId, title }) => {
    const currentDate = new Date().toISOString();
    await ctx.db.patch(conversationId, {
      title,
      updatedAt: currentDate,
    });
  },
});

export const addNewMessageToConversation = mutation({
  args: {
    conversationId: v.id('conversations'),
    resumableStreamId: v.optional(v.string()),
    role: v.union(v.literal('user'), v.literal('assistant'), v.literal('system')),
    status: v.union(v.literal('pending'), v.literal('streaming'), v.literal('complete')),
    content: v.string(),
  },
  handler: async (ctx, { conversationId, status, resumableStreamId, role, content }) => {
    const currentDate = new Date().toISOString();
    const messageId = await ctx.db.insert('messages', {
      conversationId,
      content,
      status,
      resumableStreamId,
      role,
      createdAt: currentDate,
      updatedAt: currentDate,
    });
    return messageId;
  },
});

export const updateProcessingStatus = mutation({
  args: {
    conversationId: v.id('conversations'),
    processing: v.boolean(),
  },
  handler: async (ctx, { conversationId, processing }) => {
    const currentDate = new Date().toISOString();
    await ctx.db.patch(conversationId, {
      processing,
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
