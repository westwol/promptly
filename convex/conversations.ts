import { v } from "convex/values";
import { query } from "./_generated/server";

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
    return conversation;
  },
});
