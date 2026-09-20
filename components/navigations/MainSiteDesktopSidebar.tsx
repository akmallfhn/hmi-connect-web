"use client";

import {
  IconArticle,
  IconBell,
  IconBrandHipchat,
  IconCreditCard,
  IconDots,
  IconListSearch,
  IconLogin,
  IconLogout,
  IconPlus,
  IconSettings,
  IconSmartHome,
  IconUserCircle,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { logoutUser } from "@/lib/actions";
import { COMPOSE_INTENT_KEY } from "@/lib/constants";
import { useUnreadChatCount } from "@/hooks/useUnreadChatCount";
import { useNotificationsBell } from "@/hooks/useNotificationsBell";
import type { VerificationStatusEnum } from "@/lib/types";
import Avatar from "../common/Avatar";
import Dropdown from "../common/Dropdown";
import ProfileBadges from "../common/ProfileBadges";
import Button from "../buttons/Button";
import LogoHmiConnectHorizontal from "../svg/LogoHmiConnectHorizontal";

interface MainSiteDesktopSidebarProps {
  userId?: string;
  avatar?: string;
  username?: string;
  verificationStatus?: VerificationStatusEnum;
  isAlumni?: boolean;
}

const NAV_ITEMS = [
  {
    label: "Home",
    href: "/",
    icon: IconSmartHome,
    matches: (pathname: string) => pathname === "/",
  },
  {
    label: "Explore",
    href: "/search",
    icon: IconListSearch,
    matches: (pathname: string) => pathname === "/search",
  },
  {
    label: "Chat",
    href: "/chats",
    icon: IconBrandHipchat,
    matches: (pathname: string) =>
      pathname === "/chats" || pathname.startsWith("/chats/"),
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: IconBell,
    matches: (pathname: string) => pathname === "/notifications",
  },
  {
    label: "News",
    href: "/news",
    icon: IconArticle,
    matches: (pathname: string) =>
      pathname === "/news" || pathname.startsWith("/news/"),
  },
  {
    label: "E-KTA",
    href: "/membership",
    icon: IconCreditCard,
    matches: (pathname: string) => pathname === "/membership",
  },
] as const;

export default function MainSiteDesktopSidebar({
  userId,
  avatar,
  username,
  verificationStatus,
  isAlumni,
}: MainSiteDesktopSidebarProps) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const unreadChatCount = useUnreadChatCount(userId);
  const { unreadCount } = useNotificationsBell(userId);
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
        {NAV_ITEMS.map(({ label, href, icon: Icon, matches }) => {
          const active = matches(pathname);
          return (
            <Link
              key={label}
              href={href}
              className={[
                "flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-stack-sans-headline font-medium transition",
                active
                  ? "bg-primary-soft text-primary"
                  : "text-[#424957] hover:bg-[#f5f7fb] hover:text-[#172033]",
              ].join(" ")}
            >
              <span className="relative flex size-5 shrink-0 items-center justify-center">
                <Icon className="size-5" stroke={active ? 2.4 : 2} />
                {label === "Chat" && unreadChatCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[9px] font-bold leading-4 text-white">
                    {unreadChatCount > 9 ? "9+" : unreadChatCount}
                  </span>
                )}
                {label === "Notifications" && unreadCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[9px] font-bold leading-4 text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-1">
        <Link
          href={profileHref}
          className={[
            "flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-stack-sans-headline font-medium transition",
            profileIsActive
              ? "bg-primary-soft text-primary"
              : "text-[#424957] hover:bg-[#f5f7fb] hover:text-[#172033]",
          ].join(" ")}
        >
          {userId && avatar ? (
            <Avatar
              src={avatar}
              name={username ?? "Profil"}
              size={20}
              className="border border-current"
            />
          ) : (
            <IconUserCircle
              className="size-5 shrink-0"
              stroke={profileIsActive ? 2.4 : 2}
            />
          )}
          Profile
          <ProfileBadges
            isVerified={verificationStatus === "verified"}
            isAlumni={Boolean(isAlumni)}
            size={14}
          />
        </Link>

        <Button
          type="button"
          variant="secondary"
          onClick={handleCreate}
          className="mt-3 h-11 w-full rounded-xl"
        >
          <IconPlus className="size-5" />
          Create
        </Button>
      </div>

      <div className="mt-auto">
        <Dropdown
          align="left"
          panelClassName="w-56 rounded-xl"
          trigger={({ open, toggle }) => (
            <button
              type="button"
              onClick={toggle}
              aria-expanded={open}
              className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-[15px] font-stack-sans-headline font-medium text-[#424957] transition hover:bg-[#f5f7fb] hover:text-[#172033]"
            >
              <IconDots className="size-5" />
              More
            </button>
          )}
        >
          <div className="py-1">
            <Link
              href="/settings"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#172033] transition hover:bg-[#f5f7fb]"
            >
              <IconSettings className="size-4 text-[#5f6573]" />
              Settings
            </Link>
            {userId ? (
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-destructive transition hover:bg-destructive-soft disabled:cursor-not-allowed disabled:opacity-60"
              >
                <IconLogout className="size-4" />
                {loggingOut ? "Keluar..." : "Keluar"}
              </button>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#172033] transition hover:bg-[#f5f7fb]"
              >
                <IconLogin className="size-4 text-[#5f6573]" />
                Masuk
              </Link>
            )}
          </div>
        </Dropdown>
      </div>
    </aside>
  );
}
