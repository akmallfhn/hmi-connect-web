"use client";

import {
  IconArticle,
  IconBell,
  IconBrandHipchat,
  IconChevronDown,
  IconCreditCard,
  IconDots,
  IconListSearch,
  IconLogin,
  IconLogout,
  IconMosque,
  IconPlus,
  IconSettings,
  IconSmartHome,
  IconUserCircle,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { logoutUser } from "@/lib/actions";
import { useUnreadChatCount } from "@/hooks/useUnreadChatCount";
import { useNotificationsBell } from "@/hooks/useNotificationsBell";
import type { UserStatusEnum, VerificationStatusEnum } from "@/lib/types";
import Avatar from "../common/Avatar";
import CreateOptionList from "./CreateOptionList";
import Dropdown from "../common/Dropdown";
import ProfileBadges from "../common/ProfileBadges";
import Button from "../buttons/Button";
import LogoHmiConnectHorizontal from "../svg/LogoHmiConnectHorizontal";

interface MainSiteDesktopSidebarProps {
  userId?: string;
  avatar?: string;
  username?: string;
  userStatus?: UserStatusEnum;
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
    label: "Articles",
    href: "/articles",
    icon: IconArticle,
    // /articles/create has no nav entry of its own, so it lights this one up too.
    matches: (pathname: string) =>
      pathname === "/articles" || pathname.startsWith("/articles/"),
  },
  {
    label: "Al-Quran",
    href: "/quran",
    icon: IconMosque,
    matches: (pathname: string) =>
      pathname === "/quran" || pathname.startsWith("/quran/"),
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
  userStatus,
  verificationStatus,
  isAlumni,
}: MainSiteDesktopSidebarProps) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const unreadChatCount = useUnreadChatCount(userId);
  const { unreadCount } = useNotificationsBell(userId);
  const [loggingOut, setLoggingOut] = useState(false);
  // Posting needs an activated, verified account — the same bar reactions and comments sit behind.
  const canPost =
    Boolean(userId) &&
    userStatus !== "pending" &&
    verificationStatus === "verified";
  const postingHint =
    userStatus === "pending"
      ? "Selesaikan aktivasi akun dulu untuk bisa membuat postingan."
      : verificationStatus === "pending"
        ? "Verifikasi akunmu masih ditinjau admin."
        : "Verifikasi akunmu dulu untuk bisa membuat postingan.";
  const profileHref = username ? `/profile/${username}` : "/auth/login";
  const profileIsActive = username
    ? pathname === profileHref || pathname.startsWith(`${profileHref}/`)
    : false;

  // Posting stays clickable when it can't run — a disabled button never says why.
  function handleBlockedPost() {
    if (!userId) {
      router.push("/auth/login");
      return;
    }
    const nextStep =
      userStatus === "pending"
        ? "/activation"
        : verificationStatus === "unverified"
          ? "/verification"
          : null;
    toast.error(
      postingHint,
      nextStep
        ? { action: { label: "Lanjutkan", onClick: () => router.push(nextStep) } }
        : undefined,
    );
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
    <aside className="sticky top-0 z-50 hidden h-dvh w-64 shrink-0 flex-col self-start border-r border-[#e6e9ef] bg-white px-3 py-5 lg:flex">
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

        {canPost ? (
          <Dropdown
            align="left"
            panelClassName="w-60 rounded-xl"
            trigger={({ open, toggle }) => (
              <Button
                type="button"
                variant="secondary"
                onClick={toggle}
                aria-expanded={open}
                className="mt-3 h-11 w-full rounded-xl"
              >
                <IconPlus className="size-5" />
                Posting
                <IconChevronDown
                  className={`size-4 transition-transform ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </Button>
            )}
          >
            <CreateOptionList className="flex flex-col py-1" />
          </Dropdown>
        ) : (
          <Button
            type="button"
            variant="secondary"
            title={userId ? postingHint : undefined}
            onClick={handleBlockedPost}
            className="mt-3 h-11 w-full rounded-xl"
          >
            <IconPlus className="size-5" />
            Posting
          </Button>
        )}
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
              className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-[15px] font-stack-sans-headline font-normal text-[#424957] transition hover:bg-[#f5f7fb] hover:text-[#172033]"
            >
              <IconDots className="size-5" />
              More
            </button>
          )}
        >
          <div className="py-1 font-stack-sans-headline font-normal">
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
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-destructive transition hover:bg-destructive-soft disabled:cursor-not-allowed disabled:opacity-60"
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
