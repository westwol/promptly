import { StartConversation } from "@t3chat/components/StartConversation";

// Enable static page generation
export const dynamic = "force-static";
export const revalidate = 3600; // 1 hour

export default async function NewConversationPage() {
  return <StartConversation />;
}
