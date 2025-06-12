import { Doc } from "../../../../convex/_generated/dataModel";

export interface ConversationData {
  conversation: Doc<"conversations">;
  messages: Doc<"messages">[];
}
