"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { COMPOSE_INTENT_KEY } from "@/lib/constants";
import Avatar from "../common/Avatar";
import HomeIcon from "../icons/HomeIcon";
import NotificationIcon from "../icons/NotificationIcon";
import PlusIcon from "../icons/PlusIcon";
import ProfileIcon from "../icons/ProfileIcon";
import SearchIcon from "../icons/SearchIcon";

const PULSE_DURATION = 350;

// :active is too short-lived on a real tap to be visible, so hold the pulse on a timer instead.
function usePressPulse(duration = PULSE_DURATION) {
  const [pressed, setPressed] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function trigger() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setPressed(true);
    timeoutRef.current = setTimeout(() => setPressed(false), duration);
  }

  return [pressed, trigger] as const;
}

function NavIconPulse({ pressed, children }: { pressed: boolean; children: ReactNode }) {
  return (
    <span className="relative inline-flex items-center justify-center">
      <span
        className={[
          "pointer-events-none absolute left-1/2 top-1/2 h-11 w-16 -translate-x-1/2 -translate-y-1/2 -z-10 rounded-full bg-primary/15 transition-all duration-300 ease-out",
          pressed ? "scale-100 opacity-100" : "scale-75 opacity-0",
        ].join(" ")}
      />
      {children}
    </span>
  );
}

interface BottomNavProps {
  username?: string;
  avatar?: string;
  fullName?: string;
}

export default function BottomNav({
  username,
  avatar,
  fullName,
}: BottomNavProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isSearch = pathname === "/search";
  const isNotifications = pathname === "/notifications";
  const isProfile = username ? pathname === `/profile/${username}` : false;

  const [homePressed, triggerHome] = usePressPulse();
  const [searchPressed, triggerSearch] = usePressPulse();
  const [notificationsPressed, triggerNotifications] = usePressPulse();
  const [profilePressed, triggerProfile] = usePressPulse();

  function handleComposeClick() {
    window.sessionStorage.setItem(COMPOSE_INTENT_KEY, "1");
    window.dispatchEvent(new Event(COMPOSE_INTENT_KEY));
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-between border-t border-[#e6e9ef] bg-white/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <Link
        href="/"
        onClick={triggerHome}
        className={[
          "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium",
          isHome ? "text-primary" : "text-[#5f6573]",
        ].join(" ")}
      >
        <NavIconPulse pressed={homePressed}>
          <HomeIcon variant={isHome ? "bulk" : "outline"} className="size-5" />
        </NavIconPulse>
        Beranda
      </Link>

      <Link
        href={username ? "/search" : "/auth/login"}
        onClick={triggerSearch}
        className={[
          "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium",
          isSearch ? "text-primary" : "text-[#5f6573]",
        ].join(" ")}
      >
        <NavIconPulse pressed={searchPressed}>
          <SearchIcon variant={isSearch ? "bulk" : "outline"} className="size-5" />
        </NavIconPulse>
        Cari
      </Link>

      <Link
        href={username ? "/" : "/auth/login"}
        onClick={username ? handleComposeClick : undefined}
        className="flex flex-1 flex-col items-center justify-center gap-1 py-1 text-[11px] font-medium text-[#5f6573]"
      >
        <span className="-mt-5 flex size-11 items-center justify-center rounded-full bg-primary text-white shadow-md shadow-primary/30 transition-transform duration-150 active:scale-90">
          <PlusIcon className="size-5" />
        </span>
        Posting
      </Link>

      <Link
        href={username ? "/notifications" : "/auth/login"}
        onClick={triggerNotifications}
        className={[
          "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium",
          isNotifications ? "text-primary" : "text-[#5f6573]",
        ].join(" ")}
      >
        <NavIconPulse pressed={notificationsPressed}>
          <NotificationIcon variant={isNotifications ? "bulk" : "outline"} className="size-5" />
        </NavIconPulse>
        Notifikasi
      </Link>

      <Link
        href={username ? `/profile/${username}` : "/auth/login"}
        onClick={triggerProfile}
        className={[
          "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium",
          isProfile ? "text-primary" : "text-[#5f6573]",
        ].join(" ")}
      >
        <NavIconPulse pressed={profilePressed}>
          {avatar || fullName ? (
            <Avatar
              src={avatar}
              name={fullName ?? "Kader"}
              size={20}
              className={isProfile ? "ring-2 ring-primary" : ""}
            />
          ) : (
            <ProfileIcon variant={isProfile ? "bulk" : "outline"} className="size-5" />
          )}
        </NavIconPulse>
        Profil
      </Link>
    </nav>
  );
}
