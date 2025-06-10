import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("conversations").collect();
  },
});

export const getById = query({
  args: { conversationId: v.string() },
  handler: async (ctx, { conversationId }) => {
    const conversation = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("_id"), conversationId))
      .first();

    if (!conversation) {
      throw new Error(`Conversation with id ${conversationId} not found`);
    }

    const messages = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("conversationId"), conversationId))
      .collect();

    return { conversation, messages };
  },
});

export const addNewMessageToConversation = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
  },
  handler: async (ctx, { conversationId, content }) => {
    const currentDate = new Date().toISOString();
    const messageId = await ctx.db.insert("messages", {
      conversationId,
      content,
      status: "complete",
      role: "user",
      createdAt: currentDate,
      updatedAt: currentDate,
    });
    return messageId;
  },
});

export const updateMessageFromConversation = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
  },
  handler: async (ctx, { messageId, content }) => {
    const currentDate = new Date().toISOString();
    await ctx.db.patch(messageId, {
      content,
      status: "streaming",
      role: "assistant",
      updatedAt: currentDate,
    });
  },
});

export const updateStreamingMessage = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
    token: v.string(),
    tokenIndex: v.number(),
  },
  handler: async (ctx, { messageId, content, token, tokenIndex }) => {
    const currentDate = new Date().toISOString();
    
    // Update the main message content
    await ctx.db.patch(messageId, {
      content,
      status: "streaming",
      updatedAt: currentDate,
    });

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
