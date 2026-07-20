"use client";

import { MessageCircleOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { ChatMessage } from "@/apis/chats";
import { listMessages, loadMoreMessages, markMessagesAsRead, sendChatMessage } from "@/lib/actions";
import { useRealtimeTopic } from "@/hooks/useRealtimeTopic";
import Button from "../buttons/Button";
import { useConversationSummary } from "../chats/ChatConversationsContext";
import ChatThreadHeader from "../chats/ChatThreadHeader";
import MessageComposer from "../chats/MessageComposer";
import MessageList from "../chats/MessageList";

interface ChatThreadPageProps {
  conversationId: string;
  viewerId?: string;
}

function affiliationLabel(
  chapterName?: string,
  branchName?: string,
  coordinatingBodyName?: string
): string | undefined {
  if (branchName) return `Cabang ${branchName}`;
  if (coordinatingBodyName) return coordinatingBodyName;
  return chapterName;
}

function mergeMessages(current: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  const byId = new Map(current.map((message) => [message.id, message]));
  for (const message of incoming) byId.set(message.id, message);
  return Array.from(byId.values()).sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export default function ChatThreadPage({ conversationId, viewerId }: ChatThreadPageProps) {
  const router = useRouter();
  const conversation = useConversationSummary(conversationId);

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
      setLoading(true);
      setMessages([]);
      setNotFound(false);
      pageRef.current = 1;

      listMessages(conversationId, 1).then((result) => {
        if (cancelled) return;
        if (result.list.length === 0 && !result.hasMore) {
          setNotFound(true);
        }
        setMessages(mergeMessages([], result.list));
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
    const { message, envelope } = await sendChatMessage({ conversationId, content, attachmentUrl });
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
        <MessageCircleOff className="size-10 text-[#9aa1ad]" />
        <p className="text-sm text-[#7b8190]">Percakapan tidak ditemukan.</p>
        <Button variant="light" size="sm" onClick={() => router.push("/chats")}>
          Kembali ke Pesan
        </Button>
      </div>
    );
  }

  const personName = conversation?.other_full_name ?? "Kader";
  const personAvatar = conversation?.other_avatar;

  return (
    <div className="flex h-full flex-col">
      <ChatThreadHeader
        fullName={personName}
        username={conversation?.other_username}
        avatar={personAvatar}
        affiliation={affiliationLabel(
          conversation?.other_chapter_name,
          conversation?.other_branch_name,
          conversation?.other_coordinating_body_name
        )}
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
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxUrl(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- remote attachment served by Supabase Storage */}
          <img
            src={lightboxUrl}
            alt="Lampiran"
            className="max-h-[85vh] max-w-full rounded-lg object-contain"
          />
        </div>
      )}
    </div>
  );
}
