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
import LogoHmiConnectHorizontal from "../svg/LogoHmiConnectHorizontal";

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

// The desktop rail stays deep-slate; the mobile bar and drawer are light. Same tree, two palettes.
export type SidebarTone = "dark" | "light";

const NAV_TONE: Record<
  SidebarTone,
  {
    activeLink: string;
    idleLink: string;
    activeIcon: string;
    idleIcon: string;
    groupLabel: string;
    groupButton: string;
  }
> = {
  dark: {
    activeLink:
      "bg-linear-to-r from-primary/40 via-primary/15 to-transparent font-medium text-white",
    idleLink:
      "text-white/65 hover:bg-linear-to-r hover:from-white/10 hover:to-transparent hover:text-white",
    activeIcon: "text-primary",
    idleIcon: "text-white/50 group-hover:text-white/85",
    groupLabel: "text-white/35",
    groupButton: "hover:bg-white/5",
  },
  light: {
    activeLink:
      "bg-linear-to-r from-primary/15 via-primary/5 to-transparent font-medium text-primary",
    idleLink: "text-[#5f6573] hover:bg-[#f5f7fb] hover:text-[#172033]",
    activeIcon: "text-primary",
    idleIcon: "text-[#7b8190] group-hover:text-[#172033]",
    groupLabel: "text-[#7b8190]",
    groupButton: "hover:bg-[#f5f7fb]",
  },
};

interface AdminSidebarProps {
  // localStorage key for the collapsed toggle — give each sidebar instance its own so they don't share state.
  storageKey: string;
  // Where this admin area's own root is — the mobile bar's logo links here.
  homeHref: string;
  navItems: AdminNavEntry[];
  // Left side of the top row (logo, or an entity's icon/name/status) — gets the collapsed state for an icon-only variant, and the tone since the drawer is light while the rail is dark.
  renderHeader: (collapsed: boolean, tone: SidebarTone) => ReactNode;
  fullName?: string;
  avatar?: string;
  roleName?: string;
}

function NavLink({
  item,
  pathname,
  collapsed,
  onNavigate,
  tone = "dark",
}: {
  item: AdminNavItem;
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
  tone?: SidebarTone;
}) {
  const { label, href, icon: Icon, exact } = item;
  const isActive = exact ? pathname === href : pathname.startsWith(href);
  const palette = NAV_TONE[tone];
  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      aria-current={isActive ? "page" : undefined}
      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
        collapsed ? "justify-center" : ""
      } ${isActive ? palette.activeLink : palette.idleLink}`}
    >
      <Icon
        className={`size-5 shrink-0 transition-colors ${
          isActive ? palette.activeIcon : palette.idleIcon
        }`}
      />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

function NavGroup({
  groupName,
  items,
  pathname,
  collapsed,
  onNavigate,
  tone = "dark",
}: {
  groupName: string;
  items: AdminNavItem[];
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
  tone?: SidebarTone;
}) {
  // Defaults open — matches the sibling sevenpreneur project's AppSidebarGroupMenu.
  const [isOpen, setIsOpen] = useState(true);
  const palette = NAV_TONE[tone];

  if (collapsed) {
    return (
      <div className="flex flex-col gap-1">
        {items.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            pathname={pathname}
            collapsed
            onNavigate={onNavigate}
            tone={tone}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex cursor-pointer items-center justify-between rounded-md px-3 py-1.5 text-left transition ${palette.groupButton}`}
      >
        <span
          className={`text-[11px] font-medium tracking-widest uppercase ${palette.groupLabel}`}
        >
          {groupName}
        </span>
        <ChevronDown
          className={`size-3.5 shrink-0 transition-transform duration-300 ${palette.groupLabel} ${
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
          <NavLink
            key={item.href}
            item={item}
            pathname={pathname}
            onNavigate={onNavigate}
            tone={tone}
          />
        ))}
      </div>
    </div>
  );
}

function NavList({
  navItems,
  pathname,
  collapsed,
  onNavigate,
  tone = "dark",
}: {
  navItems: AdminNavEntry[];
  pathname: string;
  collapsed?: boolean;
  // Mobile drawer closes on an actual link click — never on a group header toggle.
  onNavigate?: () => void;
  tone?: SidebarTone;
}) {
  return (
    <nav className="flex flex-col gap-2">
      {navItems.map((entry) =>
        isNavGroup(entry) ? (
          <NavGroup
            key={entry.groupName}
            groupName={entry.groupName}
            items={entry.items}
            pathname={pathname}
            collapsed={collapsed}
            onNavigate={onNavigate}
            tone={tone}
          />
        ) : (
          <NavLink
            key={entry.href}
            item={entry}
            pathname={pathname}
            collapsed={collapsed}
            onNavigate={onNavigate}
            tone={tone}
          />
        ),
      )}
    </nav>
  );
}

function ProfileBlock({
  fullName,
  avatar,
  roleName,
  collapsed,
  tone = "dark",
}: {
  fullName?: string;
  avatar?: string;
  roleName?: string;
  collapsed?: boolean;
  tone?: SidebarTone;
}) {
  const displayName = fullName ?? "Admin";
  const [loggingOut, setLoggingOut] = useState(false);
  const isLight = tone === "light";
  const shellClasses = isLight
    ? "border-[#e6e9ef] bg-[#f5f7fb]"
    : "border-white/10 bg-white/5 backdrop-blur-sm";
  const avatarRing = isLight ? "ring-2 ring-white" : "ring-2 ring-white/15";
  const logoutClasses = isLight
    ? "text-destructive hover:bg-destructive-soft"
    : "text-secondary hover:bg-secondary/15";

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
      <div
        className={`flex flex-col items-center gap-2 rounded-xl border p-2 ${shellClasses}`}
      >
        <Avatar
          src={avatar}
          name={displayName}
          size={36}
          className={avatarRing}
        />
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          aria-label="Keluar"
          title="Keluar"
          className={`flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-60 ${logoutClasses}`}
        >
          <LogOut className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border p-3 ${shellClasses}`}
    >
      <Avatar
        src={avatar}
        name={displayName}
        size={40}
        className={avatarRing}
      />
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-medium ${isLight ? "text-[#172033]" : "text-white"}`}
        >
          {displayName}
        </p>
        {roleName && (
          <p
            className={`truncate text-xs ${isLight ? "text-[#5f6573]" : "text-white/50"}`}
          >
            {roleName}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        aria-label="Keluar"
        className={`flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-60 ${logoutClasses}`}
      >
        <LogOut className="size-5" />
      </button>
    </div>
  );
}

// Shared shell (collapse/mobile-drawer chrome, nav list, profile block) behind every admin sidebar — MasterSidebar/EntitySidebar/etc only supply their own header content and nav items.
export default function AdminSidebar({
  storageKey,
  homeHref,
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

  // Locks the root too, not just body — and never repositions either, or the sticky mobile bar unsticks.
  useEffect(() => {
    if (!mobileOpen) return;

    const root = document.documentElement;
    const { body } = document;
    const previousRoot = root.style.overflow;
    const previousBody = body.style.overflow;

    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      root.style.overflow = previousRoot;
      body.style.overflow = previousBody;
    };
  }, [mobileOpen]);

  // Resizing to desktop hides the drawer, which would strand the scroll lock with no way to lift it.
  useEffect(() => {
    if (!mobileOpen) return;

    const desktop = window.matchMedia("(min-width: 1024px)");
    function handleChange() {
      if (desktop.matches) setMobileOpen(false);
    }
    desktop.addEventListener("change", handleChange);
    return () => desktop.removeEventListener("change", handleChange);
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  return (
    <>
      <aside
        className={`font-stack-sans-headline sticky top-0 hidden h-screen shrink-0 flex-col border-r border-white/10 bg-admin-sidebar py-6 transition-[width] duration-150 lg:flex ${
          isCollapsed ? "w-20 px-3" : "w-64 px-4"
        }`}
      >
        {/* Collapsed stacks header above the toggle instead of squeezing both into one row, which was clipping the header out of the narrower w-20 rail. */}
        <div
          className={`flex shrink-0 ${isCollapsed ? "flex-col items-center gap-2" : "items-center justify-between px-1"}`}
        >
          {renderHeader(isCollapsed, "dark")}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed((prev) => !prev)}
            aria-label={isCollapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
            title={isCollapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
            className="shrink-0 text-white/65 hover:bg-white/10 hover:text-white focus-visible:ring-secondary/50"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="size-4.5" />
            ) : (
              <PanelLeftClose className="size-4.5" />
            )}
          </Button>
        </div>
        <div className="mt-4 -mx-4 shrink-0 border-t border-white/10" />
        <div className="mt-5 min-h-0 flex-1 overflow-y-auto pb-4">
          <NavList
            navItems={navItems}
            pathname={pathname}
            collapsed={isCollapsed}
          />
        </div>
        <div className="shrink-0">
          <ProfileBlock
            fullName={fullName}
            avatar={avatar}
            roleName={roleName}
            collapsed={isCollapsed}
          />
        </div>
      </aside>

      {/* Mobile chrome is light on purpose — the deep-slate rail is a desktop-only treatment. */}
      <div className="font-stack-sans-headline sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b border-[#e6e9ef] bg-white px-4 lg:hidden">
        <Link
          href={homeHref}
          className="flex items-center"
          aria-label="Beranda"
        >
          <LogoHmiConnectHorizontal className="h-7 w-auto" />
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Buka menu"
          aria-expanded={mobileOpen}
          className="flex size-9 items-center justify-center rounded-full text-[#5f6573] transition hover:bg-[#f5f7fb] hover:text-[#172033]"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {/* Kept mounted so closing animates too, and h-dvh since a fixed box sizes off the large viewport. */}
      <div
        className={`fixed inset-x-0 top-0 z-50 h-dvh lg:hidden ${mobileOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!mobileOpen}
        inert={!mobileOpen}
      >
        <div
          onClick={() => setMobileOpen(false)}
          className={`absolute inset-0 bg-[#172033]/40 transition-opacity duration-300 ease-out motion-reduce:transition-none ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`font-stack-sans-headline absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-[#e6e9ef] bg-white px-4 py-6 shadow-2xl transition-transform duration-300 ease-out will-change-transform motion-reduce:transition-none ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* shrink-0 on both ends so only the nav scrolls — without it a long menu squeezes them instead. */}
          <div className="flex shrink-0 items-center justify-between gap-2 px-1">
            {renderHeader(false, "light")}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Tutup menu"
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-[#5f6573] transition hover:bg-[#f5f7fb] hover:text-[#172033]"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="mt-4 -mx-4 shrink-0 border-t border-[#e6e9ef]" />
          <div className="mt-5 min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4">
            <NavList
              navItems={navItems}
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
              tone="light"
            />
          </div>
          <div className="mt-4 shrink-0">
            <ProfileBlock
              fullName={fullName}
              avatar={avatar}
              roleName={roleName}
              tone="light"
            />
          </div>
        </div>
      </div>
    </>
  );
}
