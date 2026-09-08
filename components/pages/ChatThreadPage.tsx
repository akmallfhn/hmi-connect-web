"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { ChatMessage } from "@/apis/chats";
import {
  listMessages,
  loadMoreMessages,
  markMessagesAsRead,
  sendChatMessage,
} from "@/lib/actions";
import { CHAT_PENDING_MESSAGE_KEY } from "@/lib/constants";
import { useRealtimeTopic } from "@/hooks/useRealtimeTopic";
import Button from "../buttons/Button";
import EmptyStateIllustration from "../illustrations/EmptyStateIllustration";
import {
  useChatConversations,
  useConversationSummary,
} from "../chats/ChatConversationsContext";
import ChatThreadHeader from "../chats/ChatThreadHeader";
import ImageLightbox from "../chats/ImageLightbox";
import MessageComposer from "../chats/MessageComposer";
import MessageList from "../chats/MessageList";

interface ChatThreadPageProps {
  conversationId: string;
  viewerId?: string;
}

// Handed over by /chats/new so its just-sent bubble isn't replaced by this route's loading skeleton.
function takePendingMessage(conversationId: string): ChatMessage[] {
  const raw = sessionStorage.getItem(CHAT_PENDING_MESSAGE_KEY);
  if (!raw) return [];
  sessionStorage.removeItem(CHAT_PENDING_MESSAGE_KEY);
  try {
    const message = JSON.parse(raw) as ChatMessage;
    return message.conversation_id === conversationId ? [message] : [];
  } catch {
    return [];
  }
}

function mergeMessages(
  current: ChatMessage[],
  incoming: ChatMessage[]
): ChatMessage[] {
  const byId = new Map(current.map((message) => [message.id, message]));
  for (const message of incoming) byId.set(message.id, message);
  return Array.from(byId.values()).sort((a, b) =>
    a.created_at.localeCompare(b.created_at)
  );
}

export default function ChatThreadPage({
  conversationId,
  viewerId,
}: ChatThreadPageProps) {
  const router = useRouter();
  const conversation = useConversationSummary(conversationId);
  const { loading: conversationsLoading } = useChatConversations();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const pageRef = useRef(1);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timeoutId = setTimeout(() => {
      if (cancelled) return;
      const pending = takePendingMessage(conversationId);
      setLoading(true);
      setMessages(pending);
      setNotFound(false);
      pageRef.current = 1;

      listMessages(conversationId, 1).then((result) => {
        if (cancelled) return;
        if (
          result.list.length === 0 &&
          !result.hasMore &&
          pending.length === 0
        ) {
          setNotFound(true);
        }
        setMessages((prev) => mergeMessages(prev, result.list));
        setHasMore(result.hasMore);
        setLoading(false);
      });
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [conversationId]);

  const refetchLatest = useCallback(() => {
    listMessages(conversationId, 1).then((result) => {
      setMessages((prev) => mergeMessages(prev, result.list));
    });
  }, [conversationId]);

  useRealtimeTopic(`messages:${conversationId}`, refetchLatest);

  useEffect(() => {
    if (loading) return;
    markMessagesAsRead(conversationId);
  }, [conversationId, loading, messages.length]);

  function loadOlderMessages() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = pageRef.current + 1;
    loadMoreMessages(conversationId, nextPage).then((result) => {
      setMessages((prev) => mergeMessages(prev, result.list));
      setHasMore(result.hasMore);
      pageRef.current = nextPage;
      setLoadingMore(false);
    });
  }

  async function handleSend(content: string, attachmentUrl?: string) {
    const { message, envelope } = await sendChatMessage({
      conversationId,
      content,
      attachmentUrl,
    });
    if (!message) {
      toast.error(envelope.message ?? "Gagal mengirim pesan.");
      return;
    }
    setMessages((prev) => mergeMessages(prev, [message]));
    setNotFound(false);
  }

  if (!loading && notFound && !conversation) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <EmptyStateIllustration className="h-auto w-52" aria-hidden="true" />
        <p className="text-lg font-semibold">Percakapan tidak ditemukan.</p>
        <Button variant="primary" onClick={() => router.push("/chats")}>
          Kembali ke Pesan
        </Button>
      </div>
    );
  }

  const headerLoading = !conversation && (conversationsLoading || loading);
  const personName = conversation?.other_full_name ?? "";
  const personAvatar = conversation?.other_avatar;

  return (
    <div className="flex h-full flex-col">
      <ChatThreadHeader
        fullName={personName}
        username={conversation?.other_username}
        avatar={personAvatar}
        loading={headerLoading}
      />
      <MessageList
        messages={messages}
        viewerId={viewerId}
        personName={personName}
        personAvatar={personAvatar}
        loading={loading}
        hasMore={hasMore}
        loadingMore={loadingMore}
        onLoadMore={loadOlderMessages}
        onOpenImage={setLightboxUrl}
      />
      <MessageComposer userId={viewerId} onSend={handleSend} />

      {lightboxUrl && (
        <ImageLightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
      )}
    </div>
  );
}
