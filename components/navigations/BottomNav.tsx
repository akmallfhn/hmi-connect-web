"use client";

import { Bell, CreditCard, Home, Search, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Avatar from "../common/Avatar";

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
  const isProfile = username ? pathname === `/profile/${username}` : false;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-between border-t border-[#e6e9ef] bg-white/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <Link
        href="/"
        className={[
          "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium",
          isHome ? "text-primary" : "text-[#5f6573]",
        ].join(" ")}
      >
        <Home className="size-5" strokeWidth={isHome ? 2.5 : 2} />
        Beranda
      </Link>

      <a
        href="#"
        className="flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium text-[#5f6573]"
      >
        <Search className="size-5" />
        Cari
      </a>

      <a
        href="#"
        className="flex flex-1 flex-col items-center justify-center gap-1 py-1 text-[11px] font-medium text-[#5f6573]"
      >
        <span className="-mt-5 flex size-11 items-center justify-center rounded-full bg-primary text-white shadow-md shadow-primary/30">
          <CreditCard className="size-5" />
        </span>
        E-KTA
      </a>

      <a
        href="#"
        className="flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium text-[#5f6573]"
      >
        <Bell className="size-5" />
        Notifikasi
      </a>

      <Link
        href={username ? `/profile/${username}` : "#"}
        className={[
          "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium",
          isProfile ? "text-primary" : "text-[#5f6573]",
        ].join(" ")}
      >
        {avatar || fullName ? (
          <Avatar
            src={avatar}
            name={fullName ?? "Kader"}
            size={20}
            className={isProfile ? "ring-2 ring-primary" : ""}
          />
        ) : (
          <UserRound className="size-5" strokeWidth={isProfile ? 2.5 : 2} />
        )}
        Profil
      </Link>
    </nav>
  );
}
