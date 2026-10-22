"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { ConversationSummary } from "@/apis/chats";
import { conversationsQueryOptions, uniqueActivityItems } from "@/lib/activity-query";

interface ChatConversationsContextValue {
  conversations: ConversationSummary[];
  loading: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  loadMore: () => void;
  refetch: () => void;
}

const ChatConversationsContext = createContext<ChatConversationsContextValue | null>(null);

export function ChatConversationsProvider({ userId, children }: { userId?: string; children: ReactNode }) {
  const query = useInfiniteQuery(conversationsQueryOptions(userId));
  return (
    <ChatConversationsContext.Provider value={{
      conversations: uniqueActivityItems(query.data),
      loading: Boolean(userId) && query.isPending,
      hasMore: query.hasNextPage,
      loadingMore: query.isFetchingNextPage,
      loadMore: () => { if (query.hasNextPage && !query.isFetching) void query.fetchNextPage(); },
      refetch: () => { void query.refetch(); },
    }}>
      {children}
    </ChatConversationsContext.Provider>
  );
}

export function useChatConversations(): ChatConversationsContextValue {
  const context = useContext(ChatConversationsContext);
  if (!context) throw new Error("useChatConversations must be used within ChatConversationsProvider");
  return context;
}

export function useConversationSummary(conversationId: string | undefined): ConversationSummary | undefined {
  const { conversations } = useChatConversations();
  return conversations.find((conversation) => conversation.id === conversationId);
}
