"use client";

import { logoutUser } from "@/lib/actions";
import {
  ChevronDown,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import Button from "../buttons/Button";
import Avatar from "../common/Avatar";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  // Exact pathname match instead of the default startsWith — for a Dashboard-style item whose href is a prefix of every sibling route.
  exact?: boolean;
}

export interface AdminNavGroup {
  groupName: string;
  items: AdminNavItem[];
}

export type AdminNavEntry = AdminNavItem | AdminNavGroup;

function isNavGroup(entry: AdminNavEntry): entry is AdminNavGroup {
  return "items" in entry;
}

interface AdminSidebarProps {
  // localStorage key for the collapsed toggle — give each sidebar instance its own so they don't share state.
  storageKey: string;
  navItems: AdminNavEntry[];
  // Left side of the top row (logo, or an entity's icon/name/status) — receives the current collapsed state so it can render an icon-only variant.
  renderHeader: (collapsed: boolean) => ReactNode;
  fullName?: string;
  avatar?: string;
  roleName?: string;
}

function NavLink({
  item,
  pathname,
  collapsed,
}: {
  item: AdminNavItem;
  pathname: string;
  collapsed?: boolean;
}) {
  const { label, href, icon: Icon, exact } = item;
  const isActive = exact ? pathname === href : pathname.startsWith(href);
  return (
    <Link
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
}

function NavGroup({
  groupName,
  items,
  pathname,
  collapsed,
}: {
  groupName: string;
  items: AdminNavItem[];
  pathname: string;
  collapsed?: boolean;
}) {
  // Defaults open — matches the sibling sevenpreneur project's AppSidebarGroupMenu.
  const [isOpen, setIsOpen] = useState(true);

  if (collapsed) {
    return (
      <div className="flex flex-col gap-1">
        {items.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} collapsed />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex cursor-pointer items-center justify-between rounded-md px-3 py-1.5 text-left transition hover:bg-[#f5f7fb]"
      >
        <span className="text-[11px] font-semibold tracking-widest text-[#9aa1ac] uppercase">
          {groupName}
        </span>
        <ChevronDown
          className={`size-3.5 shrink-0 text-[#9aa1ac] transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`flex flex-col gap-1 overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {items.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
      </div>
    </div>
  );
}

function NavList({
  navItems,
  pathname,
  collapsed,
}: {
  navItems: AdminNavEntry[];
  pathname: string;
  collapsed?: boolean;
}) {
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((entry) =>
        isNavGroup(entry) ? (
          <NavGroup
            key={entry.groupName}
            groupName={entry.groupName}
            items={entry.items}
            pathname={pathname}
            collapsed={collapsed}
          />
        ) : (
          <NavLink
            key={entry.href}
            item={entry}
            pathname={pathname}
            collapsed={collapsed}
          />
        )
      )}
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
      console.error("[AdminSidebar] logoutUser threw:", err);
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

// Shared shell (collapse/mobile-drawer chrome, nav list, profile block) behind every admin sidebar — MasterSidebar/BranchSidebar/etc only supply their own header content and nav items.
export default function AdminSidebar({
  storageKey,
  navItems,
  renderHeader,
  fullName,
  avatar,
  roleName,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Always start expanded so the client's first render matches the server's (no localStorage access there).
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsCollapsed(localStorage.getItem(storageKey) === "true");
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, String(isCollapsed));
  }, [storageKey, isCollapsed]);

  return (
    <>
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-[#e6e9ef] bg-white py-6 transition-[width] duration-150 lg:flex ${
          isCollapsed ? "w-20 px-3" : "w-64 px-4"
        }`}
      >
        {/* Collapsed stacks header above the toggle instead of squeezing both into one row, which was clipping the header out of the narrower w-20 rail. */}
        <div
          className={`flex ${isCollapsed ? "flex-col items-center gap-2" : "items-center justify-between px-1"}`}
        >
          {renderHeader(isCollapsed)}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed((prev) => !prev)}
            aria-label={isCollapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
            title={isCollapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
            className="shrink-0"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="size-4.5 text-[#5f6573] hover:bg-[#f5f7fb]" />
            ) : (
              <PanelLeftClose className="size-4.5 text-[#5f6573] hover:bg-[#f5f7fb]" />
            )}
          </Button>
        </div>
        <div className="mt-4 -mx-4 border-t border-[#e6e9ef]" />
        <div className="mt-6 flex-1">
          <NavList
            navItems={navItems}
            pathname={pathname}
            collapsed={isCollapsed}
          />
        </div>
        <ProfileBlock
          fullName={fullName}
          avatar={avatar}
          roleName={roleName}
          collapsed={isCollapsed}
        />
      </aside>

      <div className="flex h-14 items-center justify-between border-b border-[#e6e9ef] bg-white px-4 lg:hidden">
        {renderHeader(false)}
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
              {renderHeader(false)}
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
              <NavList navItems={navItems} pathname={pathname} />
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
