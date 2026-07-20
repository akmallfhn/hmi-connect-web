"use client";

import type { ChatMessage } from "@/apis/chats";
import { formatRelativeTime } from "@/lib/formatRelativeTime";

// A short, emoji-only message renders large and bare, with no bubble background — same
// convention as WhatsApp/iMessage/Instagram.
const EMOJI_ONLY_PATTERN = /^(?:\p{Extended_Pictographic}|\u{FE0F}|\u{200D})+$/u;

function isEmojiOnly(text: string): boolean {
  if (!text) return false;
  return EMOJI_ONLY_PATTERN.test(text.trim());
}

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showTimestampDivider: boolean;
  statusLabel?: string;
  onOpenImage: (url: string) => void;
}

export default function MessageBubble({
  message,
  isOwn,
  showTimestampDivider,
  statusLabel,
  onOpenImage,
}: MessageBubbleProps) {
  const bare = Boolean(message.content) && isEmojiOnly(message.content) && !message.attachment_url;

  return (
    <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
      {showTimestampDivider && (
        <p className="mb-3 self-center text-xs font-medium text-[#9aa1ad]">
          {formatRelativeTime(message.created_at)}
        </p>
      )}

      <div className="relative max-w-[78%] sm:max-w-[65%]">
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

      {statusLabel && <p className="mt-2 text-xs text-[#9aa1ad]">{statusLabel}</p>}
    </div>
  );
}
