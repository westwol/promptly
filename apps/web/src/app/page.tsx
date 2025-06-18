import { StartConversation } from '@t3chat/components/Chat/StartConversation';

export default async function NewConversationPage() {
  return <StartConversation />;
}

export const dynamic = 'force-static';

export const revalidate = false;

export const metadata = {
  title: 'Promptly - New Conversation',
  description: 'Start a new conversation with AI',
};
