import { ChatConversation } from "@t3chat/components/ChatConversation";

interface ConversationPageParams {
  params: Promise<{ id: string }>;
}

// Enable static page generation
export const dynamic = "force-static";
export const revalidate = 3600; // 1 hour

export default async function ConversationPage({
  params,
}: ConversationPageParams) {
  const { id: conversationId } = await params;

  return <ChatConversation conversationId={conversationId} />;
}
