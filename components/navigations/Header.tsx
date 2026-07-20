"use client";

import { logoutUser } from "@/lib/actions";
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  CreditCard,
  EllipsisVertical,
  LogOut,
  MessageCircleMore,
  Search,
  Settings,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { useNotificationsBell } from "@/hooks/useNotificationsBell";
import Avatar from "../common/Avatar";
import Dropdown from "../common/Dropdown";
import PageMargin from "../common/PageMargin";
import VerifiedBadge from "../common/VerifiedBadge";
import Button from "../buttons/Button";
import NotificationsDropdownPanel from "../notifications/NotificationsDropdownPanel";
import LogoHmiConnectHorizontal from "../svg/LogoHmiConnectHorizontal";

interface HeaderProps {
  fullName?: string;
  avatar?: string;
  email?: string;
  userId?: string;
  username?: string;
  isVerified?: boolean;
  loading?: boolean;
  mobileBackTitle?: string;
  mobileMenu?: ReactNode;
  mobileMenuLabel?: string;
  /** Renders as a colored strip below the banner, desktop-only — for page-level filters
   *  (e.g. news categories) that should live in the sticky navbar rather than the page body. */
  desktopFilterBar?: ReactNode;
}

export default function Header({
  fullName,
  avatar,
  email,
  userId,
  username,
  isVerified,
  loading,
  mobileBackTitle,
  mobileMenu,
  mobileMenuLabel = "Menu",
  desktopFilterBar,
}: HeaderProps) {
  const displayName = fullName ?? "Kader";
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { notifications, unreadCount, handleRead, handleMarkAllRead } =
    useNotificationsBell(userId);

  function handleSearchSubmit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchValue.trim()) params.set("q", searchValue.trim());
    router.push(`/search${params.toString() ? `?${params}` : ""}`);
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logoutUser();
    } catch (err) {
      console.error("[Header] logoutUser threw:", err);
    } finally {
      window.location.href = "/auth/login";
    }
  }

  return (
    <header className="sticky top-0 z-40 lg:border-b lg:border-[#e6e9ef] lg:bg-white/90 lg:backdrop-blur">
      <PageMargin className="hidden h-16 items-center justify-center lg:grid lg:grid-cols-[280px_minmax(0,1fr)_auto] lg:gap-6 xl:grid-cols-[280px_minmax(0,1fr)_280px]">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 lg:justify-self-start"
        >
          <LogoHmiConnectHorizontal className="h-8 w-auto" />
        </Link>

        <div className="hidden min-w-0 flex-1 justify-center lg:flex">
          <form
            onSubmit={handleSearchSubmit}
            className="flex w-full items-center gap-2"
          >
            <label className="relative flex-1">
              <span className="sr-only">Cari</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#7b8190]" />
              <input
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Cari orang atau postingan..."
                className="h-10 w-full rounded-full border border-[#dbe3ef] bg-[#f5f7fb] pl-10 pr-4 text-sm text-[#172033] outline-none transition placeholder:text-[#7b8190] focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"
              />
            </label>
            <Button
              type="submit"
              variant="primary"
              size="pillSm"
              className="shrink-0"
            >
              Cari
            </Button>
          </form>
        </div>

        <div className="hidden items-center gap-2 lg:flex lg:justify-self-end">
          {loading ? (
            <div className="flex items-center gap-2 animate-pulse">
              <div className="size-10 rounded-full bg-[#e6e9ef]" />
              <div className="size-8 rounded-full bg-[#e6e9ef]" />
            </div>
          ) : userId ? (
            <>
              <Link
                href="/chats"
                aria-label="Pesan"
                className="flex size-10 cursor-pointer items-center justify-center rounded-full text-[#5f6573] transition hover:bg-[#f5f7fb]"
              >
                <MessageCircleMore className="size-5" />
              </Link>

              <Dropdown
                align="right"
                trigger={({ toggle }) => (
                  <button
                    type="button"
                    onClick={toggle}
                    className="relative flex size-10 cursor-pointer items-center justify-center rounded-full text-[#5f6573] transition hover:bg-[#f5f7fb]"
                    aria-label="Notifikasi"
                  >
                    <Bell className="size-5" />
                    {unreadCount > 0 && (
                      <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                )}
              >
                <NotificationsDropdownPanel
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onMarkAllRead={handleMarkAllRead}
                  onRead={handleRead}
                />
              </Dropdown>

              <Dropdown
                align="right"
                trigger={({ toggle }) => (
                  <button
                    type="button"
                    onClick={toggle}
                    className="flex cursor-pointer items-center gap-2 rounded-full py-1 pl-1 pr-2 transition hover:bg-[#f5f7fb]"
                  >
                    <Avatar src={avatar} name={displayName} size={32} />
                    <ChevronDown className="hidden size-4 text-[#5f6573] sm:block" />
                  </button>
                )}
              >
                <div className="flex items-center gap-3 border-b border-[#e6e9ef] px-4 py-3">
                  <Avatar src={avatar} name={displayName} size={40} />
                  <div className="min-w-0">
                    <p className="flex items-center gap-1 truncate text-sm font-semibold text-[#172033]">
                      <span className="truncate">{displayName}</span>
                      {isVerified && <VerifiedBadge size={14} />}
                    </p>
                    <p className="truncate text-xs text-[#5f6573]">{email}</p>
                  </div>
                </div>
                <div className="flex flex-col py-1">
                  <Link
                    href={username ? `/profile/${username}` : "#"}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#172033] transition hover:bg-[#f5f7fb]"
                  >
                    <UserRound className="size-4 text-[#5f6573]" />
                    Profil Saya
                  </Link>
                  <Link
                    href="/membership"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#172033] transition hover:bg-[#f5f7fb]"
                  >
                    <CreditCard className="size-4 text-[#5f6573]" />
                    E-KTA
                  </Link>
                  <a
                    href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#172033] transition hover:bg-[#f5f7fb]"
                  >
                    <Settings className="size-4 text-[#5f6573]" />
                    Pengaturan
                  </a>
                </div>
                <div className="border-t border-[#e6e9ef] py-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-destructive transition hover:bg-destructive-soft disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LogOut className="size-4" />
                    {loggingOut ? "Keluar..." : "Keluar"}
                  </button>
                </div>
              </Dropdown>
            </>
          ) : (
            <Link href="/auth/login">
              <Button variant="primary">Masuk</Button>
            </Link>
          )}
        </div>
      </PageMargin>

      {userId && isVerified === false && (
        <div className="border-t border-destructive/20 bg-destructive-soft">
          <PageMargin className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 py-2 text-center text-sm font-medium text-destructive">
            <TriangleAlert className="size-4 shrink-0" />
            <span>Akun kamu belum terverifikasi.</span>
            <Link
              href="/verification"
              className="underline underline-offset-2 hover:text-destructive-foreground"
            >
              Verifikasi sekarang
            </Link>
          </PageMargin>
        </div>
      )}

      {desktopFilterBar && (
        <div className="hidden border-t border-[#e6e9ef] bg-white lg:block">
          <PageMargin className="flex items-center gap-4 py-3">
            {desktopFilterBar}
          </PageMargin>
        </div>
      )}

      {(mobileBackTitle || mobileMenu) && (
        <div className="border-t border-[#e6e9ef] bg-white lg:hidden">
          <PageMargin className="flex h-12 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              aria-label="Kembali"
              className="-ml-2 size-8 shrink-0 rounded-full text-[#172033] hover:bg-[#f5f7fb]"
            >
              <ArrowLeft className="size-5" />
            </Button>
            {mobileBackTitle ? (
              <h1 className="min-w-0 flex-1 truncate text-base font-semibold text-[#172033]">
                {mobileBackTitle}
              </h1>
            ) : (
              <div className="min-w-0 flex-1" />
            )}
            {mobileMenu && (
              <Dropdown
                align="right"
                panelClassName="w-56 rounded-xl"
                trigger={({ open, toggle }) => (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggle}
                    aria-label={mobileMenuLabel}
                    aria-expanded={open}
                    className="-mr-2 size-8 shrink-0 rounded-full text-[#172033] hover:bg-[#f5f7fb]"
                  >
                    <EllipsisVertical className="size-5" />
                  </Button>
                )}
              >
                {mobileMenu}
              </Dropdown>
            )}
          </PageMargin>
        </div>
      )}
    </header>
  );
}
