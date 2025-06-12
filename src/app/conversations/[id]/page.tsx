import { ChatConversation } from "@t3chat/components/ChatConversation";
import { preloadQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import { ConversationData } from "./types";

interface ConversationPageParams {
  params: Promise<{ id: string }>;
}

export default async function ConversationPage({
  params,
}: ConversationPageParams) {
  const { id: conversationId } = await params;

  const conversation = await preloadQuery(api.conversations.getById, {
    conversationId,
  });

  if (!conversation) {
    return <p>Couldnt find this conversation</p>;
  }

  const initialConversationData =
    conversation._valueJSON as unknown as ConversationData;

  return <ChatConversation initialConversationData={initialConversationData} />;
}
