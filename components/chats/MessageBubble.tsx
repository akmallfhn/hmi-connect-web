"use client";

import { CheckCheck } from "lucide-react";
import type { ChatMessage } from "@/apis/chats";

// A short, emoji-only message renders large and bare, with no bubble background — same
// convention as WhatsApp/iMessage/Instagram.
const EMOJI_ONLY_PATTERN = /^(?:\p{Extended_Pictographic}|\u{FE0F}|\u{200D})+$/u;

function isEmojiOnly(text: string): boolean {
  if (!text) return false;
  return EMOJI_ONLY_PATTERN.test(text.trim());
}

function formatClockTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  onOpenImage: (url: string) => void;
}

export default function MessageBubble({ message, isOwn, onOpenImage }: MessageBubbleProps) {
  const bare = Boolean(message.content) && isEmojiOnly(message.content) && !message.attachment_url;

  return (
    <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
      <div className="w-fit max-w-[min(75%,480px)]">
        {message.attachment_url && (
          <button
            type="button"
            onClick={() => onOpenImage(message.attachment_url!)}
            className="block cursor-zoom-in overflow-hidden rounded-[20px]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- remote attachment served by Supabase Storage, not worth Next/Image optimization here */}
            <img src={message.attachment_url} alt="Lampiran" className="max-h-72 w-auto object-cover" />
          </button>
        )}

        {message.content && (
          <div
            className={[
              "select-none",
              message.attachment_url ? "mt-1" : "",
              bare
                ? "px-1 py-1 text-4xl leading-none"
                : [
                    "rounded-[20px] px-4 py-2.5 text-sm leading-relaxed break-words",
                    isOwn ? "bg-primary text-white" : "bg-[#f0f2f6] text-[#172033]",
                  ].join(" "),
            ].join(" ")}
          >
            {message.content}
          </div>
        )}
      </div>

      {/* WhatsApp-style meta row — clock time always, ticks only for messages the viewer sent:
          double gray check = sent, double primary-colored check = read (no "delivered" state,
          backend only tracks sent/read). */}
      <div className="mt-1 flex items-center gap-1 px-1">
        <span className="text-[11px] text-[#9aa1ad]">{formatClockTime(message.created_at)}</span>
        {isOwn && (
          <CheckCheck
            className={`size-3.5 ${message.status === "read" ? "text-primary" : "text-[#9aa1ad]"}`}
          />
        )}
      </div>
    </div>
  );
}
