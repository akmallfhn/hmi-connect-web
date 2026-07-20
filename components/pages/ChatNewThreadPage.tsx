"use client";

import { MessageCircleOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { SearchPersonResult } from "@/apis/search";
import { sendChatMessage } from "@/lib/actions";
import { CHAT_NEW_RECIPIENT_KEY } from "@/lib/constants";
import Button from "../buttons/Button";
import Avatar from "../common/Avatar";
import { useChatConversations } from "../chats/ChatConversationsContext";
import ChatThreadHeader from "../chats/ChatThreadHeader";
import MessageComposer from "../chats/MessageComposer";

function affiliationLabel(person: SearchPersonResult): string | undefined {
  if (person.branch_name) return `Cabang ${person.branch_name}`;
  if (person.coordinating_body_name) return person.coordinating_body_name;
  return person.chapter_name;
}

interface ChatNewThreadPageProps {
  viewerId?: string;
}

// Reached from NewMessageModal, which stashes the picked recipient's basic profile in
// sessionStorage since there's no conversation id to navigate to yet — the backend only
// creates a conversation as a side effect of the first `messages/send` call.
export default function ChatNewThreadPage({ viewerId }: ChatNewThreadPageProps) {
  const router = useRouter();
  const { refetch } = useChatConversations();
  const [recipient, setRecipient] = useState<SearchPersonResult | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const raw = sessionStorage.getItem(CHAT_NEW_RECIPIENT_KEY);
      if (raw) {
        try {
          setRecipient(JSON.parse(raw));
        } catch {
          setRecipient(null);
        }
      }
      setReady(true);
    }, 0);
    return () => clearTimeout(timeoutId);
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

    sessionStorage.removeItem(CHAT_NEW_RECIPIENT_KEY);
    refetch();
    router.replace(`/chats/${message.conversation_id}`);
  }

  if (!ready) return null;

  if (!recipient) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <MessageCircleOff className="size-10 text-[#9aa1ad]" />
        <p className="text-sm text-[#7b8190]">Pilih orang yang ingin dikirimi pesan dulu.</p>
        <Button variant="light" size="sm" onClick={() => router.push("/chats")}>
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
        affiliation={affiliationLabel(recipient)}
      />

      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
        <Avatar src={recipient.avatar} name={recipient.full_name} size={72} />
        <div>
          <p className="text-base font-semibold text-[#172033]">{recipient.full_name}</p>
          <p className="mt-1 text-sm text-[#7b8190]">
            Mulai percakapan dengan mengirim pesan pertama.
          </p>
        </div>
      </div>

      <MessageComposer userId={viewerId} onSend={handleSend} />
    </div>
  );
}
