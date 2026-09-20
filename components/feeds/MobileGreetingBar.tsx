"use client";

import { IconBell } from "@tabler/icons-react";
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
  const displayName = fullName?.split(" ")[0] ?? "Kader";
  const profileHref = username ? `/profile/${username}` : "#";
  const { unreadCount } = useNotificationsBell(userId);

  return (
    <div className="bg-primary px-4 pb-20 pt-4 lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <Link href={profileHref} className="flex min-w-0 items-center gap-3">
          <Avatar
            src={avatar}
            name={displayName}
            size={36}
            className="ring-2 ring-white/30"
          />
          <div className="min-w-0">
            <p className="text-[15px] text-white font-semibold leading-snug">
              Hi, {displayName}!
            </p>
            <p className="truncate text-[13px] text-white/80 leading-snug">
              Let’s connect & grow.
            </p>
          </div>
        </Link>

        <Link
          href="/notifications"
          aria-label="Notifikasi"
          className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/10"
        >
          <IconBell className="size-5" stroke={2} />
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
