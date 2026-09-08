import { NewThreadPaneSkeleton } from "@/components/chats/ChatPaneSkeleton";

// Overrides the parent chats fallback: this route opens an empty thread, so it never shows bubbles.
export default function ChatsNewLoading() {
  return <NewThreadPaneSkeleton />;
}
