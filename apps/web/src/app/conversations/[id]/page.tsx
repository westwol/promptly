import { ChatConversation } from '@t3chat/components/Chat/ChatConversation';

interface ConversationPageParams {
  params: Promise<{ id: string }>;
}

export default async function ConversationPage({ params }: ConversationPageParams) {
  const { id: conversationId } = await params;

  return <ChatConversation conversationId={conversationId} />;
}

export const dynamic = 'force-static';

export const revalidate = false;

export const metadata = {
  title: 'Promptly - Conversation',
};
