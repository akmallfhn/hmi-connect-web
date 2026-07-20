import { getSession } from "@/apis/session";
import ChatThreadPage from "@/components/pages/ChatThreadPage";

interface ChatConversationPageProps {
  params: Promise<{ conversation_id: string }>;
}

export default async function ChatConversationPage({
  params,
}: ChatConversationPageProps) {
  const { conversation_id } = await params;
  const { user } = await getSession();
  return <ChatThreadPage conversationId={conversation_id} viewerId={user?.id} />;
}
