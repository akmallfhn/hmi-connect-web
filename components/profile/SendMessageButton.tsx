"use client";

import { MessageCircleMore } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { findConversationWithUser } from "@/lib/actions";
import { CHAT_NEW_RECIPIENT_KEY } from "@/lib/constants";
import Button from "../buttons/Button";

interface SendMessageButtonProps {
  userId: string;
  username?: string;
  fullName: string;
  avatar?: string;
  className?: string;
}

// Jumps to an existing thread if one exists, else hands off to /chats/new like NewMessageModal.
export default function SendMessageButton({
  userId,
  username,
  fullName,
  avatar,
  className,
}: SendMessageButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    try {
      const conversationId = await findConversationWithUser(userId);
      if (conversationId) {
        router.push(`/chats/${conversationId}`);
        return;
      }

      sessionStorage.setItem(
        CHAT_NEW_RECIPIENT_KEY,
        JSON.stringify({ id: userId, username, full_name: fullName, avatar })
      );
      router.push("/chats/new");
    } catch (err) {
      console.error("[SendMessageButton] lookup failed:", err);
      toast.error("Gagal membuka pesan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="light" onClick={handleClick} disabled={loading} className={className}>
      <MessageCircleMore className="size-3.5" />
      {loading ? "Membuka..." : "Chat"}
    </Button>
  );
}
