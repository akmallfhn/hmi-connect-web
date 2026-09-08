import { ChatThreadPaneSkeleton } from "@/components/chats/ChatPaneSkeleton";

// Covers ChatsLayout's {children} slot only — ChatsPage already renders the real Header/sidebar around it.
export default function ChatsLoading() {
  return <ChatThreadPaneSkeleton />;
}
