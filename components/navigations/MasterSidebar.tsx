"use client";

import { logoutUser } from "@/lib/actions";
import {
  Building2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Network,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Avatar from "../common/Avatar";
import LogoHmiConnectHorizontal from "../svg/LogoHmiConnectHorizontal";

interface MasterSidebarProps {
  fullName?: string;
  avatar?: string;
  roleName?: string;
}

const NAV_ITEMS = [
  { label: "Dashboard", href: "/master", icon: LayoutDashboard },
  { label: "User Management", href: "/master/users", icon: Users },
  { label: "Komisariat", href: "/master/chapters", icon: GraduationCap },
  { label: "Cabang", href: "/master/branches", icon: Building2 },
  { label: "Badko", href: "/master/coordinating-bodies", icon: Network },
];

function NavList({ pathname }: { pathname: string }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? "bg-primary-soft text-primary"
                : "text-[#5f6573] hover:bg-[#f5f7fb]"
            }`}
          >
            <Icon className="size-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function ProfileBlock({
  fullName,
  avatar,
  roleName,
}: {
  fullName?: string;
  avatar?: string;
  roleName?: string;
}) {
  const displayName = fullName ?? "Admin";
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logoutUser();
    } catch (err) {
      console.error("[MasterSidebar] logoutUser threw:", err);
    } finally {
      window.location.href = "/auth/login";
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#e6e9ef] p-3">
      <Avatar src={avatar} name={displayName} size={40} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#172033]">
          {displayName}
        </p>
        {roleName && (
          <p className="truncate text-xs text-[#5f6573]">{roleName}</p>
        )}
      </div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        aria-label="Keluar"
        className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-destructive transition hover:bg-destructive-soft disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LogOut className="size-5" />
      </button>
    </div>
  );
}

export default function MasterSidebar({
  fullName,
  avatar,
  roleName,
}: MasterSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[#e6e9ef] bg-white px-4 py-6 lg:flex">
        <Link href="/master" className="px-1">
          <LogoHmiConnectHorizontal className="h-7 w-auto" />
        </Link>
        <div className="mt-4 -mx-4 border-t border-[#e6e9ef]" />
        <div className="mt-6 flex-1">
          <NavList pathname={pathname} />
        </div>
        <ProfileBlock fullName={fullName} avatar={avatar} roleName={roleName} />
      </aside>

      <div className="flex h-14 items-center justify-between border-b border-[#e6e9ef] bg-white px-4 lg:hidden">
        <Link href="/master">
          <LogoHmiConnectHorizontal className="h-6 w-auto" />
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Buka menu"
          className="flex size-9 items-center justify-center rounded-full text-[#172033] hover:bg-[#f5f7fb]"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-0 left-0 flex h-full w-72 flex-col bg-white px-4 py-6 shadow-xl">
            <div className="flex items-center justify-between px-1">
              <LogoHmiConnectHorizontal className="h-7 w-auto" />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Tutup menu"
                className="flex size-9 items-center justify-center rounded-full text-[#172033] hover:bg-[#f5f7fb]"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-4 -mx-4 border-t border-[#e6e9ef]" />
            <div className="mt-6 flex-1" onClick={() => setMobileOpen(false)}>
              <NavList pathname={pathname} />
            </div>
            <ProfileBlock
              fullName={fullName}
              avatar={avatar}
              roleName={roleName}
            />
          </div>
        </div>
      )}
    </>
  );
}
