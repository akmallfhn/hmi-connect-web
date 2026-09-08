"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { ChatMessage } from "@/apis/chats";
import type { SearchPersonResult } from "@/apis/search";
import { sendChatMessage } from "@/lib/actions";
import {
  CHAT_NEW_RECIPIENT_KEY,
  CHAT_PENDING_MESSAGE_KEY,
} from "@/lib/constants";
import Button from "../buttons/Button";
import EmptyStateIllustration from "../illustrations/EmptyStateIllustration";
import { NewThreadPaneSkeleton } from "../chats/ChatPaneSkeleton";
import { useChatConversations } from "../chats/ChatConversationsContext";
import ChatThreadHeader from "../chats/ChatThreadHeader";
import ImageLightbox from "../chats/ImageLightbox";
import MessageComposer from "../chats/MessageComposer";
import MessageList from "../chats/MessageList";
import SendMessageIllustration from "../illustrations/SendMessageIllustration";

interface ChatNewThreadPageProps {
  viewerId?: string;
}

export default function ChatNewThreadPage({
  viewerId,
}: ChatNewThreadPageProps) {
  const router = useRouter();
  const { refetch } = useChatConversations();
  const [recipient, setRecipient] = useState<SearchPersonResult | null>(null);
  const [ready, setReady] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Picking someone else while already on /chats/new doesn't remount, so re-read on the modal's event too.
  useEffect(() => {
    function readRecipient() {
      const raw = sessionStorage.getItem(CHAT_NEW_RECIPIENT_KEY);
      try {
        setRecipient(raw ? JSON.parse(raw) : null);
      } catch {
        setRecipient(null);
      }
      setReady(true);
    }

    const timeoutId = setTimeout(readRecipient, 0);
    window.addEventListener(CHAT_NEW_RECIPIENT_KEY, readRecipient);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener(CHAT_NEW_RECIPIENT_KEY, readRecipient);
    };
  }, []);

  async function handleSend(content: string, attachmentUrl?: string) {
    if (!recipient) return;

    const { message, envelope } = await sendChatMessage({
      recipientId: recipient.id,
      content,
      attachmentUrl,
    });

    if (!message) {
      toast.error(envelope.message ?? "Gagal mengirim pesan.");
      return;
    }

    setMessages((prev) => [...prev, message]);
    sessionStorage.removeItem(CHAT_NEW_RECIPIENT_KEY);
    sessionStorage.setItem(CHAT_PENDING_MESSAGE_KEY, JSON.stringify(message));
    refetch();
    router.replace(`/chats/${message.conversation_id}`);
  }

  if (!ready) return <NewThreadPaneSkeleton />;

  if (!recipient) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <EmptyStateIllustration className="h-auto w-52" aria-hidden="true" />
        <p className="text-[15px] text-[#7b8190]">
          Pilih orang yang ingin dikirimi pesan dulu.
        </p>
        <Button
          variant="primary"
          size="pill"
          onClick={() => router.push("/chats")}
        >
          Kembali ke Pesan
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <ChatThreadHeader
        fullName={recipient.full_name}
        username={recipient.username}
        avatar={recipient.avatar}
      />

      {messages.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
          <SendMessageIllustration className="w-52 max-w-full" />
          <p className="text-[15px] text-[#7b8190]">
            Mulai percakapan dengan mengirim pesan pertama.
          </p>
        </div>
      ) : (
        <MessageList
          messages={messages}
          viewerId={viewerId}
          personName={recipient.full_name}
          personAvatar={recipient.avatar}
          loading={false}
          hasMore={false}
          loadingMore={false}
          onLoadMore={() => {}}
          onOpenImage={setLightboxUrl}
        />
      )}

      <MessageComposer
        key={recipient.id}
        userId={viewerId}
        onSend={handleSend}
      />

      {lightboxUrl && (
        <ImageLightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
      )}
    </div>
  );
}
