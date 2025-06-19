import { Chat } from '@t3chat/components/Chat/Chat';

export const dynamic = 'force-static';
export const revalidate = false;
export const metadata = {
  title: 'Promptly',
};

export default async function NewConversationPage() {
  return <Chat />;
}
