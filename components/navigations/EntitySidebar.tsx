"use client";

import type { BranchTypeEnum } from "@/lib/types";
import {
  Award,
  BookText,
  GraduationCap,
  LayoutDashboard,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import LogoHmi from "../svg/LogoHmi";
import AdminSidebar, { type AdminNavEntry } from "./AdminSidebar";

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
  fullName?: string;
  avatar?: string;
  roleName?: string;
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

function getNavItems(
  scope: EntitySidebarScope,
  entityId: string
): AdminNavEntry[] {
  const base = getBaseHref(scope, entityId);

  if (scope === "organization") {
    return [
      {
        groupName: "Keanggotaan",
        items: [
          { label: "Daftar Kader", href: `${base}/members`, icon: Users },
          {
            label: "Permintaan Verifikasi",
            href: `${base}/verification`,
            icon: ShieldCheck,
          },
        ],
      },
    ];
  }

  if (scope !== "branch") {
    return [{ label: "Daftar Kader", href: `${base}/members`, icon: Users }];
  }

  return [
    { label: "Dashboard", href: base, icon: LayoutDashboard, exact: true },
    {
      groupName: "Organisasi",
      items: [
        { label: "AD ART", href: `${base}/ad-art`, icon: BookText },
        {
          label: "Kelola Komisariat",
          href: `${base}/chapters`,
          icon: GraduationCap,
        },
      ],
    },
    {
      groupName: "Keanggotaan",
      items: [
        { label: "Daftar Kader", href: `${base}/members`, icon: Users },
        {
          label: "Permintaan Verifikasi",
          href: `${base}/verification`,
          icon: ShieldCheck,
        },
      ],
    },
    {
      groupName: "Program",
      items: [
        { label: "Latihan Kader 2", href: `${base}/trainings`, icon: Award },
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
  collapsed,
}: Pick<
  EntitySidebarProps,
  "scope" | "entityId" | "entityName" | "parentName" | "entityType"
> & {
  collapsed: boolean;
}) {
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
  const accessibleLabel = secondaryText
    ? `${title}. ${secondaryText}`
    : title;
  const icon = (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15 ring-inset">
      <LogoHmi className="h-7 w-auto" />
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
          className="font-stack-sans-headline truncate text-sm font-semibold text-white"
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
            <span className="truncate text-xs text-white/50">{statusText}</span>
          </div>
        ) : (
          subtitle && (
            <p
              title={subtitle}
              className="mt-0.5 truncate text-xs text-white/50"
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
  fullName,
  avatar,
  roleName,
}: EntitySidebarProps) {
  return (
    <AdminSidebar
      storageKey={`${scope}_sidebar_collapsed`}
      navItems={getNavItems(scope, entityId)}
      renderHeader={(collapsed) => (
        <EntityHeader
          scope={scope}
          entityId={entityId}
          entityName={entityName}
          parentName={parentName}
          entityType={entityType}
          collapsed={collapsed}
        />
      )}
      fullName={fullName}
      avatar={avatar}
      roleName={roleName}
    />
  );
}
