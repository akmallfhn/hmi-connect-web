"use client";

import {
  IconArrowBackUp,
  IconArticle,
  IconBook2,
  IconChevronDown,
  IconClockHour4,
  IconCalendarEvent,
  IconCreditCard,
  IconDots,
  IconLogin,
  IconListSearch,
  IconMosque,
  IconPlus,
  IconSchool,
  IconSettings,
  IconSmartHome,
  IconUserCircle,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  MANAGE_EVENTS_HREF,
  type ActingEntityRef,
} from "@/lib/access";
import { entityProfileHref } from "@/lib/feed-author";
import type { UserStatusEnum, VerificationStatusEnum } from "@/lib/types";
import CreateOptionList from "./CreateOptionList";
import Dropdown from "../common/Dropdown";
import Button from "../buttons/Button";
import LogoHmiConnectHorizontal from "../svg/LogoHmiConnectHorizontal";
import { useHeaderAdminAccess } from "./HeaderAdminAccessContext";
import SwitchAccountButton from "../official/SwitchAccountButton";

interface MainSiteDesktopSidebarProps {
  userId?: string;
  userStatus?: UserStatusEnum;
  verificationStatus?: VerificationStatusEnum;
}

const NAV_ITEMS = [
  {
    label: "Beranda",
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
    label: "Artikel",
    href: "/articles",
    icon: IconArticle,
    // /articles/create has no nav entry of its own, so it lights this one up too.
    matches: (pathname: string) =>
      pathname === "/articles" || pathname.startsWith("/articles/"),
  },
  {
    label: "Pedoman Organisasi",
    href: "/organizational-documents",
    icon: IconBook2,
    matches: (pathname: string) =>
      pathname === "/organizational-documents" ||
      pathname.startsWith("/organizational-documents/"),
  },
  {
    label: "Training Center",
    href: "/trainings",
    icon: IconSchool,
    // Covers the event detail, registration, and /trainings/create routes too.
    matches: (pathname: string) =>
      pathname === "/trainings" || pathname.startsWith("/trainings/"),
  },
  {
    label: "Al-Quran",
    href: "/quran",
    icon: IconMosque,
    matches: (pathname: string) =>
      pathname === "/quran" || pathname.startsWith("/quran/"),
  },
  {
    label: "Jadwal Sholat",
    href: "/prayer-schedules",
    icon: IconClockHour4,
    matches: (pathname: string) => pathname === "/prayer-schedules",
  },
  {
    label: "E-KTA",
    href: "/membership",
    icon: IconCreditCard,
    matches: (pathname: string) => pathname === "/membership",
  },
] as const;

type RailNavItem = {
  label: string;
  href: string;
  icon: typeof IconSmartHome;
  matches: (pathname: string) => boolean;
};

// On an official-account page the rail speaks for that entity: its timeline and its public profile.
function officialNavItems(
  official: ActingEntityRef,
): RailNavItem[] {
  const timelineHref = "/";
  const profileHref = entityProfileHref(official.entityType, official.entityId);
  const eventsHref = MANAGE_EVENTS_HREF;
  return [
    {
      label: "Beranda",
      href: timelineHref,
      icon: IconSmartHome,
      matches: (pathname) => pathname === timelineHref,
    },
    {
      label: "Kelola Event",
      href: eventsHref,
      icon: IconCalendarEvent,
      matches: (pathname) =>
        pathname === eventsHref || pathname.startsWith(`${eventsHref}/`),
    },
    {
      label: "Profile",
      href: profileHref,
      icon: IconUserCircle,
      matches: (pathname) => pathname === profileHref,
    },
  ];
}

export default function MainSiteDesktopSidebar({
  userId,
  userStatus,
  verificationStatus,
}: MainSiteDesktopSidebarProps) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const adminAccess = useHeaderAdminAccess();
  const requested = adminAccess?.activeEntity;
  // Reaching either surface as an entity requires a grant at it, so the layout's grant list names it.
  const officialGrant = requested
    ? adminAccess?.grants.find(
        (grant) =>
          grant.entity_type === requested.entityType &&
          grant.entity_id === requested.entityId,
      )
    : undefined;
  const official = officialGrant ? requested : null;
  const navItems: readonly RailNavItem[] = official
    ? officialNavItems(official)
    : NAV_ITEMS;
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
        ? {
            action: {
              label: "Lanjutkan",
              onClick: () => router.push(nextStep),
            },
          }
        : undefined,
    );
  }

  return (
    <aside className="sticky top-0 z-50 hidden h-dvh w-64 shrink-0 flex-col self-start border-r border-border bg-surface px-3 py-5 dark:bg-[#141414] lg:flex">
      <Link href="/" className="mb-7 flex shrink-0 items-center px-2">
        <LogoHmiConnectHorizontal className="h-8 w-auto" />
      </Link>

      {/* Only the menu scrolls; the logo above and Posting/Lainnya below stay put. */}
      <div className="-mx-3 min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <nav className="flex flex-col gap-1" aria-label="Navigasi utama">
          {navItems.map(({ label, href, icon: Icon, matches }) => {
            const active = matches(pathname);
            return (
              <Link
                key={label}
                href={href}
                className={[
                  "flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-stack-sans-headline font-medium transition",
                  active
                    ? "bg-primary-soft text-primary-foreground"
                    : "text-foreground hover:bg-surface-muted hover:text-heading",
                ].join(" ")}
              >
                <span className="relative flex size-5 shrink-0 items-center justify-center">
                  <Icon className="size-5" stroke={active ? 2.4 : 2} />
                </span>
                {label}
              </Link>
            );
          })}
        </nav>

      </div>

      <div className="shrink-0 pt-3">
        {!official &&
          (canPost ? (
            <Dropdown
              align="left"
              panelClassName="w-60 rounded-xl"
              trigger={({ open, toggle }) => (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={toggle}
                  aria-expanded={open}
                  className="h-11 w-full rounded-xl"
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
              className="h-11 w-full rounded-xl"
            >
              <IconPlus className="size-5" />
              Posting
            </Button>
          ))}

        <div className={official ? undefined : "mt-4"}>
          {official ? (
            <SwitchAccountButton
              account={null}
              href="/"
              className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-[15px] font-stack-sans-headline font-medium text-destructive-foreground transition hover:bg-destructive-soft"
            >
              <IconArrowBackUp className="size-5" />
              Mode User
            </SwitchAccountButton>
          ) : (
            <Dropdown
              align="left"
              panelClassName="w-56 rounded-xl"
              trigger={({ open, toggle }) => (
                <button
                  type="button"
                  onClick={toggle}
                  aria-expanded={open}
                  className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-[15px] font-stack-sans-headline font-normal text-foreground transition hover:bg-surface-muted hover:text-heading"
                >
                  <IconDots className="size-5" />
                  Lainnya
                </button>
              )}
            >
              <div className="py-1 font-stack-sans-headline font-normal">
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-heading transition hover:bg-surface-muted"
                >
                  <IconSettings className="size-4 text-muted-foreground" />
                  Pengaturan
                </Link>
                {!userId && (
                  <Link
                    href="/auth/login"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-heading transition hover:bg-surface-muted"
                  >
                    <IconLogin className="size-4 text-muted-foreground" />
                    Masuk
                  </Link>
                )}
              </div>
            </Dropdown>
          )}
        </div>
      </div>
    </aside>
  );
}
