"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ChatConversationsProvider } from "../chats/ChatConversationsContext";
import ConversationList from "../chats/ConversationList";
import PageMargin from "../common/PageMargin";
import BottomNav from "../navigations/BottomNav";
import Header from "../navigations/Header";

interface ChatsPageViewer {
  fullName?: string;
  avatar?: string;
  email?: string;
  userId?: string;
  username?: string;
  isVerified?: boolean;
}

interface ChatsPageProps {
  viewer: ChatsPageViewer;
  children: ReactNode;
}

// Instagram-web-style DM shell: a persistent conversation list + a thread pane that swaps
// via nested routing (children), rather than each page remounting its own list — so
// switching conversations never re-fetches or re-scrolls the sidebar. Fixed to the
// viewport (h-dvh, no page scroll) since a chat surface behaves like an app, not a
// document — only the list and the message thread scroll internally.
export default function ChatsPage({ viewer, children }: ChatsPageProps) {
  const pathname = usePathname();
  const isThreadRoute = pathname !== "/chats";
  const activeConversationId = isThreadRoute ? pathname.split("/")[2] : undefined;

  return (
    <ChatConversationsProvider userId={viewer.userId}>
      <div className="flex h-dvh flex-col overflow-hidden bg-white">
        <div className={isThreadRoute ? "hidden lg:block lg:shrink-0" : "shrink-0"}>
          <Header
            fullName={viewer.fullName}
            avatar={viewer.avatar}
            email={viewer.email}
            userId={viewer.userId}
            username={viewer.username}
            isVerified={viewer.isVerified}
          />
        </div>

        <PageMargin noMobilePadding className="flex min-h-0 min-w-0 flex-1">
          <div className="flex min-h-0 min-w-0 flex-1 lg:border-x lg:border-[#e6e9ef]">
            <aside
              className={[
                isThreadRoute ? "hidden lg:flex" : "flex",
                "min-w-0 w-full flex-col lg:w-[360px] lg:shrink-0 lg:border-r lg:border-[#e6e9ef] xl:w-[400px]",
              ].join(" ")}
            >
              <ConversationList viewerId={viewer.userId} activeConversationId={activeConversationId} />
            </aside>

            <main
              className={[
                isThreadRoute ? "flex" : "hidden lg:flex",
                "min-w-0 flex-1 flex-col",
              ].join(" ")}
            >
              {children}
            </main>
          </div>
        </PageMargin>

        <div className={isThreadRoute ? "hidden" : "shrink-0 lg:hidden"}>
          <BottomNav userId={viewer.userId} username={viewer.username} />
        </div>
      </div>
    </ChatConversationsProvider>
  );
}
