import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("conversations").order("desc").collect();
  },
});

export const getById = query({
  args: { conversationUuid: v.string() },
  handler: async (ctx, { conversationUuid }) => {
    const conversation = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("conversationUuid"), conversationUuid))
      .first();

    if (!conversation) {
      throw new Error(`Conversation with id ${conversationUuid} not found`);
    }

    const messages = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("conversationId"), conversation._id))
      .collect();

    return { conversation, messages };
  },
});

export const createInitialConversation = mutation({
  args: {
    conversationId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, { conversationId, content }) => {
    const currentDate = new Date().toISOString();
    const newConversationId = await ctx.db.insert("conversations", {
      userId: "jh7abgx9czyf0es24jgnbyxgmd7hjwsr" as any,
      title: "New conversation",
      conversationUuid: conversationId,
      updatedAt: currentDate,
      createdAt: currentDate,
    });
    await ctx.db.insert("messages", {
      conversationId: newConversationId,
      content,
      status: "complete",
      role: "user",
      createdAt: currentDate,
      updatedAt: currentDate,
    });
    return newConversationId;
  },
});

export const addNewMessageToConversation = mutation({
  args: {
    conversationId: v.id("conversations"),
    resumableStreamId: v.optional(v.string()),
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system"),
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("streaming"),
      v.literal("complete"),
    ),
    content: v.string(),
  },
  handler: async (
    ctx,
    { conversationId, status, resumableStreamId, role, content },
  ) => {
    const currentDate = new Date().toISOString();
    const messageId = await ctx.db.insert("messages", {
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

export const completeMessage = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
  },
  handler: async (ctx, { messageId, content }) => {
    const currentDate = new Date().toISOString();
    await ctx.db.patch(messageId, {
      content,
      status: "complete",
      updatedAt: currentDate,
    });
  },
});
