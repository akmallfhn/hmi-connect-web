"use client";

import { logoutUser } from "@/lib/actions";
import {
  Building2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "../buttons/Button";
import Avatar from "../common/Avatar";
import LogoHmiConnectHorizontal from "../svg/LogoHmiConnectHorizontal";

interface MasterSidebarProps {
  fullName?: string;
  avatar?: string;
  roleName?: string;
}

const SIDEBAR_COLLAPSED_KEY = "master_sidebar_collapsed";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/master", icon: LayoutDashboard, exact: true },
  { label: "User Management", href: "/master/users", icon: Users },
  { label: "Komisariat", href: "/master/chapters", icon: GraduationCap },
  { label: "Cabang", href: "/master/branches", icon: Building2 },
  { label: "Badko", href: "/master/coordinating-bodies", icon: Network },
];

function NavList({
  pathname,
  collapsed,
}: {
  pathname: string;
  collapsed?: boolean;
}) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ label, href, icon: Icon, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            title={collapsed ? label : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              collapsed ? "justify-center" : ""
            } ${
              isActive
                ? "bg-primary-soft text-primary"
                : "text-[#5f6573] hover:bg-[#f5f7fb]"
            }`}
          >
            <Icon className="size-5 shrink-0" />
            {!collapsed && label}
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
  collapsed,
}: {
  fullName?: string;
  avatar?: string;
  roleName?: string;
  collapsed?: boolean;
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

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-[#e6e9ef] p-2">
        <Avatar src={avatar} name={displayName} size={36} />
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          aria-label="Keluar"
          title="Keluar"
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-destructive transition hover:bg-destructive-soft disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    );
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

  // Always start expanded so the client's first render matches the server's (no localStorage access there).
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsCollapsed(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isCollapsed));
  }, [isCollapsed]);

  return (
    <>
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-[#e6e9ef] bg-white py-6 transition-[width] duration-150 lg:flex ${
          isCollapsed ? "w-20 px-3" : "w-64 px-4"
        }`}
      >
        <div
          className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between px-1"}`}
        >
          {!isCollapsed && (
            <Link href="/master">
              <LogoHmiConnectHorizontal className="h-7 w-auto" />
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed((prev) => !prev)}
            aria-label={isCollapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
            title={isCollapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
            className="size-8 shrink-0 rounded-full text-[#5f6573] hover:bg-[#f5f7fb]"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </Button>
        </div>
        <div className="mt-4 -mx-4 border-t border-[#e6e9ef]" />
        <div className="mt-6 flex-1">
          <NavList pathname={pathname} collapsed={isCollapsed} />
        </div>
        <ProfileBlock
          fullName={fullName}
          avatar={avatar}
          roleName={roleName}
          collapsed={isCollapsed}
        />
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
