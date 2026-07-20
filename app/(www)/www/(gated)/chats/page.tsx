import { getSession } from "@/apis/session";
import ChatEmptyState from "@/components/chats/ChatEmptyState";

export default async function ChatsIndexPage() {
  const { user } = await getSession();
  return <ChatEmptyState viewerId={user?.id} />;
}
