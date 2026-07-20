"use client";

import dayjs from "dayjs";
import "dayjs/locale/id";
import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/apis/chats";
import Avatar from "../common/Avatar";
import MessageBubble from "./MessageBubble";

const GROUP_GAP_MINUTES = 5;

function dayLabel(dateString: string): string {
  const date = dayjs(dateString);
  const now = dayjs();
  if (date.isSame(now, "day")) return "Hari ini";
  if (date.isSame(now.subtract(1, "day"), "day")) return "Kemarin";
  return date.locale("id").format("D MMMM YYYY");
}

interface MessageListProps {
  messages: ChatMessage[];
  viewerId?: string;
  personName: string;
  personAvatar?: string;
  loading: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  onOpenImage: (url: string) => void;
}

export default function MessageList({
  messages,
  viewerId,
  personName,
  personAvatar,
  loading,
  hasMore,
  loadingMore,
  onLoadMore,
  onOpenImage,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasScrolledInitially = useRef(false);
  const lastMessageIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (loading) return;
    const lastMessage = messages[messages.length - 1];
    const isInitial = !hasScrolledInitially.current;
    const isNewLastMessage = Boolean(lastMessage) && lastMessage.id !== lastMessageIdRef.current;

    if (isInitial || isNewLastMessage) {
      bottomRef.current?.scrollIntoView({ block: "end" });
      hasScrolledInitially.current = true;
    }
    lastMessageIdRef.current = lastMessage?.id;
  }, [loading, messages]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-[#7b8190]">Memuat pesan...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
        <Avatar src={personAvatar} name={personName} size={72} />
        <div>
          <p className="text-base font-semibold text-[#172033]">{personName}</p>
          <p className="mt-1 text-sm text-[#7b8190]">
            Mulai percakapan dengan mengirim pesan pertama.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 lg:px-6">
      <div className="flex flex-col">
        {hasMore && (
          <div className="mb-3 flex justify-center">
            <button
              type="button"
              onClick={onLoadMore}
              disabled={loadingMore}
              className="cursor-pointer rounded-full border border-[#e6e9ef] bg-white px-4 py-1.5 text-xs font-medium text-[#5f6573] transition hover:bg-[#f5f7fb] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingMore ? "Memuat..." : "Muat pesan lebih lama"}
            </button>
          </div>
        )}

        {messages.map((message, index) => {
          const previous = messages[index - 1];
          const next = messages[index + 1];
          const isOwn = message.sender_id === viewerId;

          const sameSenderAsPrevious = Boolean(previous) && previous.sender_id === message.sender_id;
          const closeToPrevious =
            Boolean(previous) && dayjs(message.created_at).diff(previous?.created_at, "minute") < GROUP_GAP_MINUTES;
          const isFirstInGroup = !(sameSenderAsPrevious && closeToPrevious);

          const showDayDivider = !previous || !dayjs(message.created_at).isSame(previous.created_at, "day");

          const sameSenderAsNext = Boolean(next) && next.sender_id === message.sender_id;
          const closeToNext =
            Boolean(next) && dayjs(next?.created_at).diff(message.created_at, "minute") < GROUP_GAP_MINUTES;
          const isLastInGroup = !(sameSenderAsNext && closeToNext);
          const showAvatar = !isOwn && isLastInGroup;

          return (
            <div key={message.id}>
              {showDayDivider && (
                <p className="my-4 text-center text-xs font-semibold uppercase tracking-wide text-[#9aa1ad]">
                  {dayLabel(message.created_at)}
                </p>
              )}

              <div className={isFirstInGroup ? "mt-3" : "mt-1.5"}>
                <div className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
                  {!isOwn && (
                    <div className="w-7 shrink-0">
                      {showAvatar && <Avatar src={personAvatar} name={personName} size={28} />}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <MessageBubble message={message} isOwn={isOwn} onOpenImage={onOpenImage} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
