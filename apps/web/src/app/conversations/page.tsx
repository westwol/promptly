import { ChatConversation } from '@t3chat/components/Chat/ChatConversation';

export default function ConversationsPage() {
  return <ChatConversation />;
}

export const dynamic = 'force-static';

export const revalidate = false;

export const metadata = {
  title: 'Promptly - Conversation',
};
