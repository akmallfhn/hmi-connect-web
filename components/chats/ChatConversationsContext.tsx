"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { ConversationSummary } from "@/apis/chats";
import { listConversations, loadMoreConversations } from "@/lib/actions";
import { useRealtimeTopic } from "@/hooks/useRealtimeTopic";

interface ChatConversationsContextValue {
  conversations: ConversationSummary[];
  loading: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  loadMore: () => void;
  refetch: () => void;
}

const ChatConversationsContext = createContext<ChatConversationsContextValue | null>(null);

interface ChatConversationsProviderProps {
  userId?: string;
  children: ReactNode;
}

// Owns the conversation list once at the /chats shell level so the sidebar and the open
// thread's header both read from one fetch — there's no `conversations/detail` endpoint on
// the backend, so a thread's header info (name/avatar/affiliation) comes from whichever
// summary is already sitting here rather than a second round-trip.
export function ChatConversationsProvider({ userId, children }: ChatConversationsProviderProps) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);

  const refetch = useCallback(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    listConversations(1).then((result) => {
      setConversations(result.list);
      setHasMore(result.hasMore);
      setPage(1);
      setLoading(false);
    });
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    const timeoutId = setTimeout(() => {
      if (cancelled) return;
      if (!userId) {
        setLoading(false);
        return;
      }
      listConversations(1).then((result) => {
        if (cancelled) return;
        setConversations(result.list);
        setHasMore(result.hasMore);
        setPage(1);
        setLoading(false);
      });
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [userId]);

  useRealtimeTopic(userId ? `conversations:${userId}` : undefined, refetch);

  function loadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    loadMoreConversations(nextPage).then((result) => {
      setConversations((prev) => [...prev, ...result.list]);
      setHasMore(result.hasMore);
      setPage(nextPage);
      setLoadingMore(false);
    });
  }

  return (
    <ChatConversationsContext.Provider
      value={{ conversations, loading, hasMore, loadingMore, loadMore, refetch }}
    >
      {children}
    </ChatConversationsContext.Provider>
  );
}

export function useChatConversations(): ChatConversationsContextValue {
  const ctx = useContext(ChatConversationsContext);
  if (!ctx) {
    throw new Error("useChatConversations must be used within ChatConversationsProvider");
  }
  return ctx;
}

export function useConversationSummary(
  conversationId: string | undefined
): ConversationSummary | undefined {
  const { conversations } = useChatConversations();
  return conversationId
    ? conversations.find((conversation) => conversation.id === conversationId)
    : undefined;
}
