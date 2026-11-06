"use client";

import {
  IconBell,
  IconBrandHipchat,
  IconChevronDown,
  IconLogin,
  IconLogout,
  IconUserCircle,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { logoutUser } from "@/lib/actions";
import {
  ADMIN_ENTITY_LABEL,
  ADMIN_ENTITY_ORDER,
} from "@/lib/access";
import { entityProfileHref, formatMentionEntityName } from "@/lib/feed-author";
import { useUnreadChatCount } from "@/hooks/useUnreadChatCount";
import { useNotificationsBell } from "@/hooks/useNotificationsBell";
import type { VerificationStatusEnum } from "@/lib/types";
import Avatar from "../common/Avatar";
import Dropdown from "../common/Dropdown";
import PageMargin from "../common/PageMargin";
import ProfileBadges from "../common/ProfileBadges";
import LogoBpl from "../svg/LogoBpl";
import LogoHmi from "../svg/LogoHmi";
import LogoKohati from "../svg/LogoKohati";
import { useHeaderAdminAccess } from "./HeaderAdminAccessContext";
import type { HeaderAdminGrant } from "./HeaderAdminAccessContext";
import SwitchAccountButton from "../official/SwitchAccountButton";

interface MainSiteDesktopHeaderProps {
  userId?: string;
  fullName?: string;
  avatar?: string;
  username?: string;
  verificationStatus?: VerificationStatusEnum;
  isAlumni?: boolean;
}

function GrantFallbackLogo({ grant }: { grant: HeaderAdminGrant }) {
  const name = grant.entity_name ?? "";
  if (/kohati/i.test(name)) {
    return <LogoKohati className="max-h-full max-w-full" aria-hidden="true" />;
  }
  if (/bpl/i.test(name)) {
    return <LogoBpl className="size-full" aria-hidden="true" />;
  }
  return <LogoHmi className="max-h-full max-w-full" aria-hidden="true" />;
}

function GrantLogo({
  grant,
  className = "size-8",
}: {
  grant: HeaderAdminGrant;
  className?: string;
}) {
  return (
    <span
      className={`flex ${className} shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-muted ${grant.entity_image_url ? "" : "p-1.5"}`}
    >
      {grant.entity_image_url ? (
        <Image
          src={grant.entity_image_url}
          alt=""
          width={32}
          height={32}
          className="h-full w-full object-contain"
        />
      ) : (
        <GrantFallbackLogo grant={grant} />
      )}
    </span>
  );
}

export default function MainSiteDesktopHeader({
  userId,
  fullName,
  avatar,
  username,
  verificationStatus,
  isAlumni,
}: MainSiteDesktopHeaderProps) {
  const access = useHeaderAdminAccess();
  const unreadChatCount = useUnreadChatCount(userId);
  const { unreadCount } = useNotificationsBell(userId);
  const [loggingOut, setLoggingOut] = useState(false);
  const requested = access?.activeEntity;
  const grants = [...(access?.grants ?? [])].sort(
    (a, b) =>
      (a.entity_type === "special_body" ? 5 : ADMIN_ENTITY_ORDER.indexOf(a.entity_type)) -
      (b.entity_type === "special_body" ? 5 : ADMIN_ENTITY_ORDER.indexOf(b.entity_type)),
  );
  const activeGrant = requested
    ? grants.find(
        (grant) =>
          requested.entityType === grant.entity_type &&
          requested.entityId === grant.entity_id,
      )
    : undefined;
  const activeEntityName = activeGrant
    ? activeGrant.entity_name
      ? formatMentionEntityName(
          activeGrant.entity_type,
          activeGrant.entity_name,
        )
      : activeGrant.entity_type === "special_body" ? "Badan Khusus" : ADMIN_ENTITY_LABEL[activeGrant.entity_type]
    : null;
  const personalDisplayName =
    fullName?.trim().split(/\s+/)[0] || username || "Profil";
  const identityHref = activeGrant
    ? activeGrant.entity_type === "special_body" ? access?.activeProfileHref ?? "/settings" : entityProfileHref(activeGrant.entity_type, activeGrant.entity_id)
    : `/profile/${username}`;

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logoutUser();
    } catch (error) {
      console.error("[MainSiteDesktopHeader] logoutUser threw:", error);
    } finally {
      window.location.href = "/auth/login";
    }
  }

  return (
    <header className="hidden border-b border-border bg-surface dark:bg-[#141414] lg:block">
      <PageMargin className="flex h-16 items-center justify-end gap-3">
        {!activeGrant && (
          <>
            <Link
              href={userId ? "/notifications" : "/auth/login"}
              aria-label={
                unreadCount > 0
                  ? `Notifikasi, ${unreadCount} belum dibaca`
                  : "Notifikasi"
              }
              className="relative flex size-10 items-center justify-center rounded-full text-foreground transition hover:bg-surface-muted hover:text-heading"
            >
              <IconBell className="size-5" stroke={2} />
              {unreadCount > 0 && (
                <span className="absolute right-0 top-0 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[9px] font-bold leading-4 text-badge-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
            <Link
              href={userId ? "/chats" : "/auth/login"}
              aria-label={
                unreadChatCount > 0
                  ? `Pesan, ${unreadChatCount} belum dibaca`
                  : "Pesan"
              }
              className="relative flex size-10 items-center justify-center rounded-full text-foreground transition hover:bg-surface-muted hover:text-heading"
            >
              <IconBrandHipchat className="size-5" stroke={2} />
              {unreadChatCount > 0 && (
                <span className="absolute right-0 top-0 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[9px] font-bold leading-4 text-badge-foreground">
                  {unreadChatCount > 9 ? "9+" : unreadChatCount}
                </span>
              )}
            </Link>
          </>
        )}
        <Dropdown
          align="right"
          panelClassName="w-72 rounded-xl"
          trigger={({ open, toggle }) => (
            <button
              type="button"
              onClick={toggle}
              aria-expanded={open}
              aria-label="Buka menu profil"
              className="flex h-10 items-center gap-2 rounded-full py-1 pl-1 pr-3 text-foreground transition hover:bg-surface-muted"
            >
              {activeGrant ? (
                <GrantLogo grant={activeGrant} className="size-8" />
              ) : userId ? (
                <Avatar
                  src={avatar}
                  name={fullName || username || "Profil"}
                  size={32}
                />
              ) : (
                <IconUserCircle className="size-7" stroke={1.8} />
              )}
              <span className="max-w-36 truncate text-sm font-medium">
                {activeGrant
                  ? activeEntityName
                  : userId
                    ? personalDisplayName
                    : "Profil"}
              </span>
              {userId && !activeGrant && (
                <ProfileBadges
                  isVerified={verificationStatus === "verified"}
                  isAlumni={Boolean(isAlumni)}
                  size={14}
                />
              )}
              <IconChevronDown
                className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
              />
            </button>
          )}
        >
          <div className="max-h-[min(70vh,32rem)] overflow-y-auto py-1">
            {userId ? (
              <>
                {activeGrant && activeEntityName ? (
                  <Link
                    href={identityHref}
                    className="flex items-center gap-3 px-4 py-3 transition hover:bg-surface-muted"
                  >
                    <GrantLogo grant={activeGrant} className="size-9" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-heading">
                        {activeEntityName}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        Akun resmi aktif
                      </span>
                    </span>
                  </Link>
                ) : (
                  <Link
                    href={identityHref}
                    className="flex items-center gap-3 px-4 py-3 transition hover:bg-surface-muted"
                  >
                    <Avatar
                      src={avatar}
                      name={fullName || username || "Profil"}
                      size={36}
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-heading">
                        {fullName || "Profil"}
                      </span>
                      {username && (
                        <span className="block truncate text-xs text-muted-foreground">
                          @{username}
                        </span>
                      )}
                    </span>
                  </Link>
                )}
                {grants.length > 0 && (
                  <div className="border-t border-border py-1">
                    <p className="px-4 py-2 text-xs font-medium text-muted-foreground">
                      Beralih Akun
                    </p>
                    {activeGrant && (
                      <SwitchAccountButton
                        account={null}
                        href="/"
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-heading transition hover:bg-surface-muted"
                      >
                        <Avatar
                          src={avatar}
                          name={fullName || username || "Profil"}
                          size={32}
                        />
                        <span className="min-w-0 flex-1 truncate">
                          {fullName || "Profil"}
                        </span>
                        {username && (
                          <span className="shrink-0 text-xs text-muted-foreground">
                            @{username}
                          </span>
                        )}
                      </SwitchAccountButton>
                    )}
                    {grants.map((grant) => {
                      const current =
                        requested?.entityType === grant.entity_type &&
                        requested.entityId === grant.entity_id;
                      if (current && activeGrant) return null;
                      return (
                        <SwitchAccountButton
                          key={grant.id}
                          account={{ entityType: grant.entity_type, entityId: grant.entity_id }}
                          href="/"
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-heading transition hover:bg-surface-muted"
                        >
                          <GrantLogo grant={grant} />
                          <span className="min-w-0 flex-1 truncate">
                            {grant.entity_name
                              ? formatMentionEntityName(
                                  grant.entity_type,
                                  grant.entity_name,
                                )
                              : grant.entity_type === "special_body" ? "Badan Khusus" : ADMIN_ENTITY_LABEL[grant.entity_type]}
                          </span>
                          {current && (
                            <span className="size-2 shrink-0 rounded-full bg-primary" />
                          )}
                        </SwitchAccountButton>
                      );
                    })}
                  </div>
                )}
                <div className="border-t border-border pt-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-destructive-foreground transition hover:bg-destructive-soft disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <IconLogout className="size-4" />
                    {loggingOut ? "Keluar..." : "Keluar"}
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-3 px-4 py-3 text-sm text-heading transition hover:bg-surface-muted"
              >
                <IconLogin className="size-4 text-muted-foreground" />
                Masuk
              </Link>
            )}
          </div>
        </Dropdown>
      </PageMargin>
    </header>
  );
}
