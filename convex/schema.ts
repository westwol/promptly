import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(), // Display name
    email: v.string(), // Unique email (or other identifier)
    createdAt: v.string(), // Account creation time
  }).index("by_email", ["email"]),

  conversations: defineTable({
    userId: v.id("users"), // References to user id
    title: v.string(), // Optional title for group chats or AI context label
    createdAt: v.string(), // When the conversation was started
    updatedAt: v.string(), // Last update time
  }),

  messages: defineTable({
    conversationId: v.id("conversations"), // Parent conversation
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system"),
    ),
    content: v.string(), // Full message text (updated as tokens arrive)
    createdAt: v.string(), // Timestamp of first token
    updatedAt: v.string(), // Last token arrival time
    status: v.union(
      v.literal("pending"),
      v.literal("streaming"),
      v.literal("complete"),
    ),
  }).index("by_conversation", ["conversationId"]),

  messageTokens: defineTable({
    messageId: v.id("messages"), // Parent message
    index: v.number(), // Token order index
    text: v.string(), // Token text
    createdAt: v.string(), // When this token was received
  }).index("by_message", ["messageId", "index"]),
});
