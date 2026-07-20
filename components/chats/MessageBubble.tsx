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
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div className="w-fit max-w-[min(75%,480px)]">
        {message.attachment_url && message.content ? (
          // Photo + caption share one padded card (bubble padding wraps both, photo sits
          // inset with its own smaller rounding — WhatsApp's own convention — rather than
          // bleeding edge-to-edge to the outer bubble's corners).
          <div
            className={[
              "w-full rounded-lg p-2",
              isOwn ? "bg-primary" : "bg-[#f0f2f6]",
            ].join(" ")}
          >
            <button
              type="button"
              onClick={() => onOpenImage(message.attachment_url!)}
              className="block w-full cursor-zoom-in overflow-hidden rounded-lg"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- remote attachment served by Supabase Storage, not worth Next/Image optimization here */}
              <img src={message.attachment_url} alt="Lampiran" className="max-h-72 w-full object-cover" />
            </button>
            <div
              className={[
                "select-none whitespace-pre-wrap px-1 pb-1 pt-2 text-sm leading-relaxed break-words",
                isOwn ? "text-white" : "text-[#172033]",
              ].join(" ")}
            >
              {message.content}
            </div>
          </div>
        ) : message.attachment_url ? (
          <button
            type="button"
            onClick={() => onOpenImage(message.attachment_url!)}
            className="block cursor-zoom-in overflow-hidden rounded-lg"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- remote attachment served by Supabase Storage, not worth Next/Image optimization here */}
            <img src={message.attachment_url} alt="Lampiran" className="max-h-72 w-auto object-cover" />
          </button>
        ) : message.content ? (
          <div
            className={
              bare
                ? "select-none px-1 py-1 text-4xl leading-none"
                : [
                    "select-none whitespace-pre-wrap rounded-xl px-4 py-2.5 text-sm leading-relaxed break-words",
                    isOwn ? "bg-primary text-white" : "bg-[#f0f2f6] text-[#172033]",
                  ].join(" ")
            }
          >
            {message.content}
          </div>
        ) : null}
      </div>
    </div>
  );
}

interface MessageMetaProps {
  message: ChatMessage;
  isOwn: boolean;
}

// Separate row (not inside MessageBubble's column) so the avatar aligns with the bubble, not this.
export function MessageMeta({ message, isOwn }: MessageMetaProps) {
  return (
    <div className={`flex items-center gap-1 px-1 ${isOwn ? "justify-end" : "justify-start"}`}>
      <span className="text-[11px] text-[#9aa1ad]">{formatClockTime(message.created_at)}</span>
      {isOwn && (
        <CheckCheck
          className={`size-3.5 ${message.status === "read" ? "text-primary" : "text-[#9aa1ad]"}`}
        />
      )}
    </div>
  );
}
