"use client";

import Link from "next/link";
import type { ConversationSummary } from "@/apis/chats";
import { formatCompactTime } from "@/lib/formatCompactTime";
import Avatar from "../common/Avatar";

function previewText(
  conversation: ConversationSummary,
  viewerId: string | undefined
): string {
  const hasContent = Boolean(conversation.last_message_content);
  const hasAttachment = Boolean(conversation.last_message_attachment_url);
  if (!hasContent && !hasAttachment) return "Mulai percakapan baru";

  const prefix =
    conversation.last_message_sender_id === viewerId ? "Anda: " : "";
  if (!hasContent && hasAttachment) return `${prefix}📷 Foto`;
  return `${prefix}${conversation.last_message_content}`;
}

interface ConversationListItemProps {
  conversation: ConversationSummary;
  viewerId?: string;
  active: boolean;
}

export default function ConversationListItem({
  conversation,
  viewerId,
  active,
}: ConversationListItemProps) {
  const { unread } = conversation;
  const timestamp = conversation.last_message_at ?? conversation.created_at;

  return (
    <Link
      href={`/chats/${conversation.id}`}
      className={[
        "flex items-center gap-3 px-4 py-3 transition",
        active
          ? "bg-[#eef1f5]"
          : unread
            ? "bg-primary-soft/40 hover:bg-primary-soft/60"
            : "hover:bg-[#f5f7fb]",
      ].join(" ")}
    >
      <Avatar
        src={conversation.other_avatar}
        name={conversation.other_full_name}
        size={44}
        className="shrink-0"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p
            className={[
              "min-w-0 truncate text-sm",
              unread
                ? "font-semibold text-[#172033]"
                : "font-medium text-[#172033]",
            ].join(" ")}
          >
            {conversation.other_full_name}
          </p>
          <span
            className={[
              "shrink-0 text-xs",
              unread ? "font-semibold text-primary" : "text-[#7b8190]",
            ].join(" ")}
          >
            {formatCompactTime(timestamp)}
          </span>
        </div>
        <p
          className={[
            "mt-0.5 line-clamp-1 break-all text-xs",
            unread ? "font-semibold text-[#172033]" : "text-[#7b8190]",
          ].join(" ")}
        >
          {previewText(conversation, viewerId)}
        </p>
      </div>

      {unread && !active && (
        <span className="size-2.5 shrink-0 rounded-full bg-primary" />
      )}
    </Link>
  );
}
