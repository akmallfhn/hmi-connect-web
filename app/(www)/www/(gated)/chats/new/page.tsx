import { getSession } from "@/apis/session";
import ChatNewThreadPage from "@/components/pages/ChatNewThreadPage";

export default async function ChatsNewPage() {
  const { user } = await getSession();
  return <ChatNewThreadPage viewerId={user?.id} />;
}
