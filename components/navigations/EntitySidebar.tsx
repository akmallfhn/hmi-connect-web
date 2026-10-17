"use client";

import type { BranchTypeEnum } from "@/lib/types";
import { ADMIN_NAV_ICON } from "./admin-nav-icons";
import Image from "next/image";
import Link from "next/link";
import LogoHmi from "../svg/LogoHmi";
import AdminSidebar, {
  type AdminNavEntry,
  type SidebarTone,
} from "./AdminSidebar";

export type EntitySidebarScope =
  | "organization"
  | "coordinating_body"
  | "branch"
  | "coordinating_chapter"
  | "chapter";

interface EntitySidebarProps {
  scope: EntitySidebarScope;
  entityId: string;
  entityName: string;
  parentName?: string;
  entityType?: BranchTypeEnum;
  // Entity's own logo/image (e.g. coordinating_body.image_url) — falls back to the LogoHmi emblem when unset.
  imageUrl?: string | null;
  fullName?: string;
  avatar?: string;
  email?: string;
  pendingVerificationCount?: number;
}

const scopePaths: Record<EntitySidebarScope, string> = {
  organization: "organizations",
  coordinating_body: "coordinating-bodies",
  branch: "branches",
  coordinating_chapter: "coordinating-chapters",
  chapter: "chapters",
};

function getBaseHref(scope: EntitySidebarScope, entityId: string) {
  return `/${scopePaths[scope]}/${entityId}`;
}

// Profile group heading per scope; an organization is named outright, like everywhere else.
function getProfileGroupName(scope: EntitySidebarScope, entityName: string) {
  switch (scope) {
    case "organization":
      return `Profil ${entityName}`;
    case "coordinating_body":
      return "Profil Badko";
    case "branch":
      return "Profil Cabang";
    case "coordinating_chapter":
      return "Profil Korkom";
    case "chapter":
      return "Profil Komisariat";
  }
}

function getScopeNavItems(
  scope: EntitySidebarScope,
  base: string,
  pendingVerificationCount?: number,
): AdminNavEntry[] {
  const membersItem: AdminNavEntry = {
    label: "Daftar Kader",
    href: `${base}/members`,
    icon: ADMIN_NAV_ICON.members,
  };
  const verificationItem: AdminNavEntry = {
    label: "Permintaan Verifikasi",
    href: `${base}/verification`,
    icon: ADMIN_NAV_ICON.verification,
    badgeCount: pendingVerificationCount,
  };

  switch (scope) {
    case "organization":
      return [
        {
          groupName: "Organisasi",
          items: [
            {
              label: "Kelola Badko",
              href: `${base}/coordinating-bodies`,
              icon: ADMIN_NAV_ICON.coordinatingBody,
            },
            {
              label: "Kelola Cabang",
              href: `${base}/branches`,
              icon: ADMIN_NAV_ICON.branch,
            },
            {
              label: "Daftar Korkom",
              href: `${base}/coordinating-chapters`,
              icon: ADMIN_NAV_ICON.coordinatingChapter,
            },
            {
              label: "Daftar Komisariat",
              href: `${base}/chapters`,
              icon: ADMIN_NAV_ICON.chapter,
            },
          ],
        },
        { groupName: "Keanggotaan", items: [membersItem, verificationItem] },
      ];
    case "coordinating_body":
      return [
        {
          label: "Daftar Cabang",
          href: `${base}/branches`,
          icon: ADMIN_NAV_ICON.branch,
        },
        membersItem,
      ];
    case "branch":
      return [
        {
          groupName: "Organisasi",
          items: [
            { label: "AD ART", href: `${base}/ad-art`, icon: ADMIN_NAV_ICON.adArt },
            {
              label: "Kelola Korkom",
              href: `${base}/coordinating-chapters`,
              icon: ADMIN_NAV_ICON.coordinatingChapter,
            },
            {
              label: "Kelola Komisariat",
              href: `${base}/chapters`,
              icon: ADMIN_NAV_ICON.chapter,
            },
          ],
        },
        { groupName: "Keanggotaan", items: [membersItem, verificationItem] },
      ];
    case "coordinating_chapter":
      return [
        {
          label: "Daftar Komisariat",
          href: `${base}/chapters`,
          icon: ADMIN_NAV_ICON.chapter,
        },
        membersItem,
      ];
    case "chapter":
      return [membersItem];
  }
}

function getNavItems(
  scope: EntitySidebarScope,
  entityId: string,
  entityName: string,
  pendingVerificationCount?: number,
): AdminNavEntry[] {
  const base = getBaseHref(scope, entityId);
  return [
    {
      label: "Dashboard",
      href: base,
      icon: ADMIN_NAV_ICON.dashboard,
      exact: true,
    },
    ...getScopeNavItems(scope, base, pendingVerificationCount),
    {
      groupName: getProfileGroupName(scope, entityName),
      items: [
        {
          label: "Str. Kepengurusan",
          href: `${base}/structural`,
          icon: ADMIN_NAV_ICON.structural,
        },
        {
          label: "Pengaturan",
          href: `${base}/settings`,
          icon: ADMIN_NAV_ICON.settings,
        },
      ],
    },
  ];
}

function getHeaderCopy({
  scope,
  entityName,
  parentName,
}: Pick<EntitySidebarProps, "scope" | "entityName" | "parentName">) {
  switch (scope) {
    case "coordinating_body":
      return { title: `Badko ${entityName}`, subtitle: parentName };
    case "branch":
      return { title: `Cabang ${entityName}` };
    case "coordinating_chapter":
      return {
        title: `Korkom ${entityName}`,
        subtitle: parentName ? `Cabang ${parentName}` : undefined,
      };
    case "chapter":
      return { title: `Komisariat ${entityName}` };
    case "organization":
      return { title: entityName, subtitle: "Organisasi" };
  }
}

function EntityHeader({
  scope,
  entityId,
  entityName,
  parentName,
  entityType,
  imageUrl,
  collapsed,
  tone,
}: Pick<
  EntitySidebarProps,
  "scope" | "entityId" | "entityName" | "parentName" | "entityType" | "imageUrl"
> & {
  collapsed: boolean;
  tone: SidebarTone;
}) {
  const isLight = tone === "light";
  const href = getBaseHref(scope, entityId);
  const { title, subtitle } = getHeaderCopy({
    scope,
    entityName,
    parentName,
  });
  const showsStatus =
    (scope === "branch" || scope === "chapter") && entityType !== undefined;
  const statusText =
    entityType === "full" ? "Status: Penuh" : "Status: Persiapan";
  const dotColor = entityType === "full" ? "bg-primary" : "bg-secondary";
  const secondaryText = showsStatus ? statusText : subtitle;
  const accessibleLabel = secondaryText ? `${title}. ${secondaryText}` : title;
  const icon = (
    <span
      className={`flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg ring-1 ring-inset ${
        isLight ? "bg-surface-muted ring-border" : "bg-on-dark/10 ring-on-dark/15"
      }`}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          width={40}
          height={40}
          className="size-full object-cover"
        />
      ) : (
        <LogoHmi className="h-7 w-auto" />
      )}
    </span>
  );

  if (collapsed) {
    return (
      <Link href={href} title={title} aria-label={accessibleLabel}>
        {icon}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      title={title}
      aria-label={accessibleLabel}
      className="flex min-w-0 flex-1 items-center gap-3"
    >
      {icon}
      <div className="min-w-0">
        <p
          title={title}
          className={`font-stack-sans-headline truncate text-sm font-semibold ${
            isLight ? "text-heading" : "text-on-dark"
          }`}
        >
          {title}
        </p>
        {showsStatus ? (
          <div className="mt-0.5 flex items-center gap-1.5">
            <span className="relative flex size-1.5">
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${dotColor}`}
              />
              <span
                className={`relative inline-flex size-1.5 rounded-full ${dotColor}`}
              />
            </span>
            <span
              className={`truncate text-xs ${isLight ? "text-muted-foreground" : "text-on-dark/50"}`}
            >
              {statusText}
            </span>
          </div>
        ) : (
          subtitle && (
            <p
              title={subtitle}
              className={`mt-0.5 truncate text-xs ${isLight ? "text-muted-foreground" : "text-on-dark/50"}`}
            >
              {subtitle}
            </p>
          )
        )}
      </div>
    </Link>
  );
}

export default function EntitySidebar({
  scope,
  entityId,
  entityName,
  parentName,
  entityType,
  imageUrl,
  fullName,
  avatar,
  email,
  pendingVerificationCount,
}: EntitySidebarProps) {
  return (
    <AdminSidebar
      storageKey={`${scope}_sidebar_collapsed`}
      homeHref={getBaseHref(scope, entityId)}
      navItems={getNavItems(scope, entityId, entityName, pendingVerificationCount)}
      renderHeader={(collapsed, tone) => (
        <EntityHeader
          scope={scope}
          entityId={entityId}
          entityName={entityName}
          parentName={parentName}
          entityType={entityType}
          imageUrl={imageUrl}
          collapsed={collapsed}
          tone={tone}
        />
      )}
      fullName={fullName}
      avatar={avatar}
      email={email}
    />
  );
}
