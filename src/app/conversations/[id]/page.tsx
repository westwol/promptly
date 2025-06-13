import { unstable_cache } from "next/cache";
import { preloadQuery } from "convex/nextjs";

import { ChatConversation } from "@t3chat/components/ChatConversation";

import { api } from "../../../../convex/_generated/api";
import { ConversationData } from "./types";
import { BaseLayout } from "@t3chat/components/layout/BaseLayout";

interface ConversationPageParams {
  params: Promise<{ id: string }>;
}

const getCachedConversation = unstable_cache(
  async (conversationId: string) => {
    const [conversation, conversations] = await Promise.all([
      preloadQuery(api.conversations.getById, {
        conversationUuid: conversationId,
      }),
      preloadQuery(api.conversations.get),
    ]);
    return { conversation, conversations };
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

  const data = await getCachedConversation(conversationId);

  if (!data.conversation) {
    return <p>Couldnt find this conversation</p>;
  }

  const initialConversationData = data.conversation
    ._valueJSON as unknown as ConversationData;

  return (
    <BaseLayout preloadedConversations={data.conversations}>
      <ChatConversation initialConversationData={initialConversationData} />;
    </BaseLayout>
  );
}
