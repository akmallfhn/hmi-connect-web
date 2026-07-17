"use client";

import {
  listNotifications,
  logoutUser,
  markNotificationsAsRead,
} from "@/lib/actions";
import {
  Bell,
  ChevronDown,
  CreditCard,
  LogOut,
  Search,
  Settings,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import type { Notification } from "@/apis/notifications";
import Avatar from "../common/Avatar";
import Dropdown from "../common/Dropdown";
import PageMargin from "../common/PageMargin";
import VerifiedBadge from "../common/VerifiedBadge";
import Button from "../buttons/Button";
import NotificationRow from "../notifications/NotificationRow";
import LogoHmiConnectHorizontal from "../svg/LogoHmiConnectHorizontal";

const DROPDOWN_LIMIT = 5;

interface HeaderProps {
  fullName?: string;
  avatar?: string;
  email?: string;
  userId?: string;
  username?: string;
  isVerified?: boolean;
  /** Set from loading.tsx, where session data isn't available yet — an absent userId there
   *  doesn't mean logged out, so this skips the "Masuk" fallback in favor of a neutral skeleton. */
  loading?: boolean;
}

export default function Header({
  fullName,
  avatar,
  email,
  userId,
  username,
  isVerified,
  loading,
}: HeaderProps) {
  const displayName = fullName ?? "Kader";
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const unreadCount = notifications.filter((item) => !item.read_at).length;

  function handleSearchSubmit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchValue.trim()) params.set("q", searchValue.trim());
    router.push(`/search${params.toString() ? `?${params}` : ""}`);
  }

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    listNotifications(1).then((result) => {
      if (!cancelled) setNotifications(result.list);
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  function handleRead(id: string) {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id && !item.read_at
          ? { ...item, read_at: new Date().toISOString() }
          : item
      )
    );
    markNotificationsAsRead([id]);
  }

  function handleMarkAllRead() {
    if (unreadCount === 0) return;
    setNotifications((prev) =>
      prev.map((item) =>
        item.read_at ? item : { ...item, read_at: new Date().toISOString() }
      )
    );
    markNotificationsAsRead();
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
            <Button type="submit" variant="primary" size="pillSm" className="shrink-0">
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
                <div className="flex items-center justify-between border-b border-[#e6e9ef] px-4 py-3">
                  <p className="text-sm font-semibold text-[#172033]">
                    Notifikasi
                  </p>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="cursor-pointer text-xs font-medium text-primary hover:underline"
                    >
                      Tandai semua dibaca
                    </button>
                  )}
                </div>
                <div className="flex max-h-80 flex-col overflow-y-auto">
                  {notifications.length === 0 && (
                    <p className="px-4 py-6 text-center text-sm text-[#5f6573]">
                      Belum ada notifikasi.
                    </p>
                  )}
                  {notifications.slice(0, DROPDOWN_LIMIT).map((item) => (
                    <NotificationRow
                      key={item.id}
                      notification={item}
                      onRead={handleRead}
                    />
                  ))}
                </div>
                <Link
                  href="/notifications"
                  className="block border-t border-[#e6e9ef] px-4 py-2.5 text-center text-xs font-medium text-primary hover:bg-[#f5f7fb]"
                >
                  Lihat semua notifikasi
                </Link>
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
    </header>
  );
}
