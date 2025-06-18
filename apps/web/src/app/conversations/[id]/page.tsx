import { ChatConversation } from '@t3chat/components/Chat/ChatConversation';

interface ConversationPageParams {
  params: Promise<{ id: string }>;
}

export default async function ConversationPage({ params }: ConversationPageParams) {
  const { id: conversationId } = await params;

  return <ChatConversation conversationId={conversationId} />;
}
