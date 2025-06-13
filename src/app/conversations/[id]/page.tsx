import { unstable_cache } from "next/cache";
import { preloadQuery } from "convex/nextjs";

import { ChatConversation } from "@t3chat/components/ChatConversation";

import { api } from "../../../../convex/_generated/api";
import { ConversationData } from "./types";

interface ConversationPageParams {
  params: Promise<{ id: string }>;
}

const getCachedConversation = unstable_cache(
  async (conversationId: string) => {
    const conversation = await preloadQuery(api.conversations.getById, {
      conversationUuid: conversationId,
    });
    return conversation;
  },
  ["conversation"],
  { revalidate: 3600 }, // 1 hour
);

// Enable static page generation
export const dynamic = "force-static";
export const revalidate = 3600; // 1 hour

export default async function ConversationPage({
  params,
}: ConversationPageParams) {
  const { id: conversationId } = await params;

  const conversation = await getCachedConversation(conversationId);

  if (!conversation) {
    return <p>Couldnt find this conversation</p>;
  }

  const initialConversationData =
    conversation._valueJSON as unknown as ConversationData;

  return <ChatConversation initialConversationData={initialConversationData} />;
}
