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
    <div className="relative z-0 overflow-hidden bg-white px-4 pb-20 pt-4 lg:hidden">
      <div className="pointer-events-none absolute -left-14 -top-16 size-56 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-12 -top-20 size-52 rounded-full bg-secondary/25 blur-3xl" />

      <div className="relative z-10 flex items-center justify-between gap-3">
        <Link href={profileHref} className="flex min-w-0 items-center gap-3">
          <Avatar
            src={avatar}
            name={displayName}
            size={36}
            className="ring-2 ring-white/80"
          />
          <div className="min-w-0">
            <p className="text-[15px] font-semibold leading-snug text-tertiary">
              Hi, {displayName}!
            </p>
            <p className="truncate text-[13px] leading-snug text-[#5f6573]">
              Let’s connect & grow.
            </p>
          </div>
        </Link>

        <Link
          href="/notifications"
          aria-label="Notifikasi"
          className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-white/75 text-tertiary shadow-sm ring-1 ring-black/5 transition hover:bg-white"
        >
          <IconBell className="size-5" stroke={2} />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex size-3.5 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold text-white ring-2 ring-white">
              {unreadCount}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}
