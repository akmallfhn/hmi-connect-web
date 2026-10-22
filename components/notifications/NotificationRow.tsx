"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  IconHeartFilled,
  IconMessageCircleFilled,
  IconMessagesFilled,
  IconShieldCheckFilled,
  IconUserFilled,
  type TablerIcon,
} from "@tabler/icons-react";
import { toast } from "sonner";
import type { Notification } from "@/apis/notifications";
import { acceptAccessGrant, followUser, unfollowUser } from "@/lib/actions";
import { formatEntityAuthorName } from "@/lib/feed-author";
import { formatRelativeTime } from "@/lib/time-manipulation";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import Avatar from "../common/Avatar";
import LogoHmi from "../svg/LogoHmi";

const TYPE_ICON: Record<Notification["type"], TablerIcon> = {
  like: IconHeartFilled,
  comment: IconMessageCircleFilled,
  comment_reply: IconMessagesFilled,
  follow: IconUserFilled,
  access_invitation: IconShieldCheckFilled,
};

function invitationScope(notification: Notification): string {
  if (notification.access_entity_type === "organization") {
    return notification.access_entity_name?.trim() || "PB HMI";
  }
  if (notification.access_entity_type) {
    return formatEntityAuthorName(
      notification.access_entity_type,
      notification.access_entity_name?.trim() || ""
    );
  }
  return notification.access_entity_name?.trim() || "entitas HMI";
}

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
    case "access_invitation":
      return `mengundangmu sebagai admin untuk mengelola ${invitationScope(notification)}`;
  }
}

function notificationHref(notification: Notification): string | null {
  if (notification.type === "access_invitation") {
    return `/invitations/${notification.entity_id}`;
  }
  if (notification.feed_id) return `/feeds/${notification.feed_id}`;
  if (notification.type === "follow" && notification.actor_username) {
    return `/profile/${notification.actor_username}`;
  }
  return null;
}

interface NotificationRowProps {
  notification: Notification;
  onRead: (id: string) => void;
  onUpdate?: (id: string, patch: Partial<Notification>) => void;
}

export default function NotificationRow({
  notification,
  onRead,
  onUpdate,
}: NotificationRowProps) {
  const router = useRouter();
  const [followedHere, setFollowedHere] = useState<boolean | null>(null);
  const [acceptedHere, setAcceptedHere] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const Icon = TYPE_ICON[notification.type];
  const href = notificationHref(notification);
  const unread = !notification.read_at;
  const isInvitation = notification.type === "access_invitation";
  const isFollow = notification.type === "follow";
  const isFollowing =
    followedHere ?? notification.actor_is_followed_by_me === true;
  const grantStatus = acceptedHere
    ? "accepted"
    : notification.access_grant_status;

  function handleRead() {
    if (unread) onRead(notification.id);
  }

  async function handleAction() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = isInvitation
        ? await acceptAccessGrant(notification.entity_id)
        : isFollowing
          ? await unfollowUser(notification.actor_id)
          : await followUser(notification.actor_id);
      if (!isSuccessStatus(result.status)) {
        toast.error(
          result.message ??
            (isInvitation
              ? "Gagal menerima undangan."
              : isFollowing
                ? "Gagal berhenti mengikuti pengguna."
                : "Gagal mengikuti pengguna.")
        );
        return;
      }

      if (isInvitation) {
        setAcceptedHere(true);
        onUpdate?.(notification.id, { access_grant_status: "accepted" });
        toast.success("Undangan admin diterima.");
        router.refresh();
      } else {
        setFollowedHere(!isFollowing);
        onUpdate?.(notification.id, { actor_is_followed_by_me: !isFollowing });
      }
      handleRead();
    } catch (error) {
      console.error("[NotificationRow] action failed:", error);
      toast.error(
        isInvitation
          ? "Gagal menerima undangan."
          : isFollowing
            ? "Gagal berhenti mengikuti pengguna."
            : "Gagal mengikuti pengguna."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const content = (
    <>
      <div className="relative shrink-0">
        {isInvitation && !notification.access_entity_image_url ? (
          <div className="flex size-9 items-center justify-center rounded-full bg-white ring-1 ring-border dark:bg-black">
            <LogoHmi
              className="h-7 w-auto"
              aria-label={invitationScope(notification)}
            />
          </div>
        ) : (
          <Avatar
            src={
              isInvitation
                ? notification.access_entity_image_url
                : notification.actor_avatar
            }
            name={
              isInvitation
                ? invitationScope(notification)
                : notification.actor_full_name
            }
            size={36}
          />
        )}
        <span className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-badge-primary text-badge-foreground ring-2 ring-on-dark">
          <Icon className="size-2.5" />
        </span>
      </div>
      <div className="min-w-0">
        <p className="line-clamp-2 text-sm text-heading">
          <span className="font-semibold">{notification.actor_full_name}</span>{" "}
          {notificationText(notification)}
          {notification.entity_content && `: ${notification.entity_content}`}
        </p>
        <span className="mt-1 block text-xs text-muted-foreground">
          {formatRelativeTime(notification.created_at)}
        </span>
      </div>
    </>
  );

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 transition hover:bg-surface-muted ${
        unread ? "bg-primary-soft/40" : ""
      }`}
    >
      {href ? (
        <Link
          href={href}
          onClick={handleRead}
          className="flex min-w-0 flex-1 items-start gap-3"
        >
          {content}
        </Link>
      ) : (
        <div className="flex min-w-0 flex-1 items-start gap-3">{content}</div>
      )}

      {isFollow && (
        <Button
          variant={isFollowing ? "light" : "primary"}
          size="sm"
          onClick={handleAction}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Memproses..."
            : isFollowing
              ? "Diikuti"
              : "Ikuti Balik"}
        </Button>
      )}
      {isInvitation &&
        (grantStatus === "pending" ? (
          <Button
            variant="primary"
            size="sm"
            onClick={handleAction}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Memproses..." : "Terima"}
          </Button>
        ) : (
          <span className="shrink-0 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-heading">
            Diterima
          </span>
        ))}
    </div>
  );
}
