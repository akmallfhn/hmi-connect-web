"use client";

import { logoutUser } from "@/lib/actions";
import {
  Bell,
  ChevronDown,
  ClipboardList,
  LogOut,
  Plus,
  Search,
  Settings,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Avatar from "../common/Avatar";
import Dropdown from "../common/Dropdown";
import PageMargin from "../common/PageMargin";
import VerifiedBadge from "../common/VerifiedBadge";
import Button from "../buttons/Button";
import { NAV_ITEMS, NOTIFICATIONS } from "../feeds/mockData";
import LogoHmiConnect from "../svg/LogoHmiConnect";

interface DashboardHeaderProps {
  fullName?: string;
  avatar?: string;
  email?: string;
  userId?: string;
  isVerified?: boolean;
}

export default function DashboardHeader({
  fullName,
  avatar,
  email,
  userId,
  isVerified,
}: DashboardHeaderProps) {
  const displayName = fullName ?? "Kader";
  const unreadCount = NOTIFICATIONS.filter((item) => !item.read).length;
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logoutUser();
    } catch (err) {
      console.error("[DashboardHeader] logoutUser threw:", err);
    } finally {
      window.location.href = "/auth/login";
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#e6e9ef] bg-white/90 backdrop-blur">
      <PageMargin className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <LogoHmiConnect className="h-10 w-auto" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item, index) => (
            <a
              key={item.label}
              href={item.href}
              className={[
                "rounded-lg px-3 py-2 text-sm font-medium transition",
                index === 0
                  ? "bg-primary-soft text-primary"
                  : "text-[#5f6573] hover:bg-[#f5f7fb] hover:text-[#172033]",
              ].join(" ")}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="hidden rounded-full text-[#5f6573] hover:bg-[#f5f7fb] sm:flex"
            aria-label="Cari"
          >
            <Search className="size-5" />
          </Button>

          {userId ? (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full"
                aria-label="Buat postingan"
              >
                <Plus className="size-5" />
              </Button>

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
                  <span className="text-xs font-medium text-primary">
                    Tandai semua dibaca
                  </span>
                </div>
                <div className="flex max-h-80 flex-col overflow-y-auto">
                  {NOTIFICATIONS.map((item) => (
                    <div
                      key={item.id}
                      className={[
                        "flex cursor-pointer items-start gap-3 px-4 py-3 transition hover:bg-[#f5f7fb]",
                        !item.read ? "bg-primary-soft/40" : "",
                      ].join(" ")}
                    >
                      <Avatar src={item.avatar} name={item.actor} size={36} />
                      <p className="text-sm text-[#172033]">
                        <span className="font-semibold">{item.actor}</span>{" "}
                        {item.action}
                        <span className="mt-0.5 block text-xs text-[#5f6573]">
                          {item.timestamp}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
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
                    href={`/profile/${userId}`}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#172033] transition hover:bg-[#f5f7fb]"
                  >
                    <UserRound className="size-4 text-[#5f6573]" />
                    Profil Saya
                  </Link>
                  <a
                    href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#172033] transition hover:bg-[#f5f7fb]"
                  >
                    <ClipboardList className="size-4 text-[#5f6573]" />
                    Log Kaderisasi
                  </a>
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
            <span>Data akun kamu belum diverifikasi oleh admin HMI Connect.</span>
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
