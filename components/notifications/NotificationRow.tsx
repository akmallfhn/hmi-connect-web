"use client";

import Link from "next/link";
import { Heart, MessageCircle, Reply, UserPlus } from "lucide-react";
import type { Notification } from "@/apis/notifications";
import Avatar from "../common/Avatar";
import { formatRelativeTime } from "@/lib/formatRelativeTime";

const TYPE_ICON: Record<Notification["type"], typeof Heart> = {
  like: Heart,
  comment: MessageCircle,
  comment_reply: Reply,
  follow: UserPlus,
};

function notificationText(notification: Notification): string {
  switch (notification.type) {
    case "like":
      if (notification.entity_type === "comment") return "menyukai komentarmu";
      if (notification.entity_type === "comment_reply")
        return "menyukai balasanmu";
      return "menyukai postinganmu";
    case "comment":
      return "mengomentari postinganmu";
    case "comment_reply":
      return "membalas komentarmu";
    case "follow":
      return "mulai mengikutimu";
  }
}

// feed_id is resolved server-side up through the comment/comment_reply and is null only
// for "follow" notifications, which navigate to the actor's profile instead.
function notificationHref(notification: Notification): string | null {
  if (notification.feed_id) return `/feeds/${notification.feed_id}`;
  if (notification.entity_type === "user") {
    return notification.actor_username
      ? `/profile/${notification.actor_username}`
      : null;
  }
  return null;
}

interface NotificationRowProps {
  notification: Notification;
  onRead: (id: string) => void;
}

export default function NotificationRow({
  notification,
  onRead,
}: NotificationRowProps) {
  const Icon = TYPE_ICON[notification.type];
  const href = notificationHref(notification);
  const unread = !notification.read_at;

  const className = [
    "flex items-start gap-3 px-4 py-3 transition hover:bg-[#f5f7fb]",
    unread ? "bg-primary-soft/40" : "",
    href ? "cursor-pointer" : "",
  ].join(" ");

  function handleClick() {
    if (unread) onRead(notification.id);
  }

  const content = (
    <>
      <div className="relative shrink-0">
        <Avatar
          src={notification.actor_avatar}
          name={notification.actor_full_name}
          size={36}
        />
        <span className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-white ring-2 ring-white">
          <Icon className="size-2.5" />
        </span>
      </div>
      <div className="min-w-0">
        <p className="line-clamp-2 text-sm text-[#172033]">
          <span className="font-semibold">{notification.actor_full_name}</span>{" "}
          {notificationText(notification)}
          {notification.entity_content && `: ${notification.entity_content}`}
        </p>
        <span className="mt-1 block text-xs text-[#5f6573]">
          {formatRelativeTime(notification.created_at)}
        </span>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} onClick={handleClick} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <div onClick={handleClick} className={className}>
      {content}
    </div>
  );
}
