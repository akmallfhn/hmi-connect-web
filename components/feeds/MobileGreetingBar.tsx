"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useNotificationsBell } from "@/hooks/useNotificationsBell";
import Avatar from "../common/Avatar";

interface MobileGreetingBarProps {
  fullName?: string;
  avatar?: string;
  username?: string;
  userId?: string;
}

export default function MobileGreetingBar({
  fullName,
  avatar,
  username,
  userId,
}: MobileGreetingBarProps) {
  const displayName = fullName ?? "Kader";
  const profileHref = username ? `/profile/${username}` : "#";
  const { unreadCount } = useNotificationsBell(userId);

  return (
    <div className="bg-primary px-4 pb-20 pt-4 lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <Link href={profileHref} className="flex min-w-0 items-center gap-3">
          <Avatar
            src={avatar}
            name={displayName}
            size={44}
            className="ring-2 ring-white/30"
          />
          <div className="min-w-0">
            <p className="text-xs text-white/80">Welcome!</p>
            <p className="truncate text-sm font-semibold text-white">
              {displayName}
            </p>
          </div>
        </Link>

        <Link
          href="/notifications"
          aria-label="Notifikasi"
          className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/10"
        >
          <Bell className="size-5" fill="#FFFFFF" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex size-3.5 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold text-white ring-2 ring-primary">
              {unreadCount}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}
