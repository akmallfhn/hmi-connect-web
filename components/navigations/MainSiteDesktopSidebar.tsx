"use client";

import {
  Bell,
  Compass,
  CreditCard,
  Home,
  LogIn,
  LogOut,
  MessageCircleMore,
  MoreHorizontal,
  Newspaper,
  Plus,
  Settings,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { logoutUser } from "@/lib/actions";
import { COMPOSE_INTENT_KEY } from "@/lib/constants";
import { useUnreadChatCount } from "@/hooks/useUnreadChatCount";
import Avatar from "../common/Avatar";
import Dropdown from "../common/Dropdown";
import Button from "../buttons/Button";
import LogoHmiConnectHorizontal from "../svg/LogoHmiConnectHorizontal";

interface MainSiteDesktopSidebarProps {
  userId?: string;
  fullName?: string;
  avatar?: string;
  username?: string;
}

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home, matches: (pathname: string) => pathname === "/" },
  {
    label: "Chat",
    href: "/chats",
    icon: MessageCircleMore,
    matches: (pathname: string) => pathname === "/chats" || pathname.startsWith("/chats/"),
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
    matches: (pathname: string) => pathname === "/notifications",
  },
  {
    label: "News",
    href: "/news",
    icon: Newspaper,
    matches: (pathname: string) => pathname === "/news" || pathname.startsWith("/news/"),
  },
  {
    label: "E-KTA",
    href: "/membership",
    icon: CreditCard,
    matches: (pathname: string) => pathname === "/membership",
  },
  {
    label: "Explore",
    href: "/search",
    icon: Compass,
    matches: (pathname: string) => pathname === "/search",
  },
] as const;

export default function MainSiteDesktopSidebar({
  userId,
  fullName,
  avatar,
  username,
}: MainSiteDesktopSidebarProps) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const unreadChatCount = useUnreadChatCount(userId);
  const [loggingOut, setLoggingOut] = useState(false);
  const profileHref = username ? `/profile/${username}` : "/auth/login";
  const profileIsActive = username
    ? pathname === profileHref || pathname.startsWith(`${profileHref}/`)
    : false;

  function handleCreate() {
    if (!userId) {
      router.push("/auth/login");
      return;
    }

    window.sessionStorage.setItem(COMPOSE_INTENT_KEY, "1");
    if (pathname === "/") {
      window.dispatchEvent(new Event(COMPOSE_INTENT_KEY));
      return;
    }
    router.push("/");
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logoutUser();
    } catch (error) {
      console.error("[MainSiteDesktopSidebar] logoutUser threw:", error);
    } finally {
      window.location.href = "/auth/login";
    }
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-[#e6e9ef] bg-white px-3 py-5 lg:flex">
      <Link href="/" className="mb-7 flex items-center px-2">
        <LogoHmiConnectHorizontal className="h-8 w-auto" />
      </Link>

      <nav className="flex flex-col gap-1" aria-label="Navigasi utama">
        {NAV_ITEMS.slice(0, 4).map(({ label, href, icon: Icon, matches }) => {
          const active = matches(pathname);
          return (
            <Link
              key={label}
              href={href}
              className={[
                "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition",
                active
                  ? "bg-primary-soft text-primary"
                  : "text-[#424957] hover:bg-[#f5f7fb] hover:text-[#172033]",
              ].join(" ")}
            >
              <span className="relative flex size-5 shrink-0 items-center justify-center">
                <Icon className="size-5" strokeWidth={active ? 2.4 : 2} />
                {label === "Chat" && unreadChatCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[9px] font-bold leading-4 text-white">
                    {unreadChatCount > 9 ? "9+" : unreadChatCount}
                  </span>
                )}
              </span>
              {label}
            </Link>
          );
        })}

        <Link
          href={profileHref}
          className={[
            "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition",
            profileIsActive
              ? "bg-primary-soft text-primary"
              : "text-[#424957] hover:bg-[#f5f7fb] hover:text-[#172033]",
          ].join(" ")}
        >
          <UserRound className="size-5 shrink-0" strokeWidth={profileIsActive ? 2.4 : 2} />
          Profile
        </Link>

        {NAV_ITEMS.slice(4).map(({ label, href, icon: Icon, matches }) => {
          const active = matches(pathname);
          return (
            <Link
              key={label}
              href={href}
              className={[
                "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition",
                active
                  ? "bg-primary-soft text-primary"
                  : "text-[#424957] hover:bg-[#f5f7fb] hover:text-[#172033]",
              ].join(" ")}
            >
              <Icon className="size-5 shrink-0" strokeWidth={active ? 2.4 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <Button
        type="button"
        onClick={handleCreate}
        className="mt-5 h-11 w-full rounded-xl"
      >
        <Plus className="size-5" />
        Create
      </Button>

      <div className="mt-3">
        <Dropdown
          align="left"
          panelClassName="w-56 rounded-xl"
          trigger={({ open, toggle }) => (
            <button
              type="button"
              onClick={toggle}
              aria-expanded={open}
              className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-[#424957] transition hover:bg-[#f5f7fb] hover:text-[#172033]"
            >
              <MoreHorizontal className="size-5" />
              More
            </button>
          )}
        >
          <div className="py-1">
            <Link
              href="/settings"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#172033] transition hover:bg-[#f5f7fb]"
            >
              <Settings className="size-4 text-[#5f6573]" />
              Settings
            </Link>
            {userId ? (
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-destructive transition hover:bg-destructive-soft disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut className="size-4" />
                {loggingOut ? "Keluar..." : "Keluar"}
              </button>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#172033] transition hover:bg-[#f5f7fb]"
              >
                <LogIn className="size-4 text-[#5f6573]" />
                Masuk
              </Link>
            )}
          </div>
        </Dropdown>
      </div>

      {userId && (
        <Link
          href={profileHref}
          className="mt-auto flex items-center gap-3 rounded-xl border border-[#e6e9ef] p-2.5 transition hover:bg-[#f5f7fb]"
        >
          <Avatar src={avatar} name={fullName ?? "Kader"} size={36} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-[#172033]">
              {fullName ?? "Kader HMI"}
            </span>
            {username && (
              <span className="block truncate text-xs text-[#7b8190]">@{username}</span>
            )}
          </span>
        </Link>
      )}
    </aside>
  );
}
