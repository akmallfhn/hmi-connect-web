"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import LogoHmi from "../svg/LogoHmi";
import AdminSidebar from "./AdminSidebar";

interface EntitySidebarProps {
  storageKey: string;
  href: string;
  entityLabel: string;
  entityName: string;
  membersHref: string;
  fullName?: string;
  avatar?: string;
  roleName?: string;
}

function EntityHeader({
  href,
  entityLabel,
  entityName,
  collapsed,
}: Pick<EntitySidebarProps, "href" | "entityLabel" | "entityName"> & {
  collapsed: boolean;
}) {
  const icon = (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15 ring-inset">
      <LogoHmi className="h-7 w-auto" />
    </span>
  );

  if (collapsed) {
    return (
      <Link href={href} title={entityName}>
        {icon}
      </Link>
    );
  }

  return (
    <Link href={href} className="flex min-w-0 items-center gap-3">
      {icon}
      <div className="min-w-0">
        <p className="font-stack-sans-headline truncate text-sm font-semibold text-white">
          {entityName}
        </p>
        <p className="mt-0.5 truncate text-xs text-white/50">{entityLabel}</p>
      </div>
    </Link>
  );
}

export default function EntitySidebar({
  storageKey,
  href,
  entityLabel,
  entityName,
  membersHref,
  fullName,
  avatar,
  roleName,
}: EntitySidebarProps) {
  return (
    <AdminSidebar
      storageKey={storageKey}
      navItems={[{ label: "Daftar Kader", href: membersHref, icon: Users }]}
      renderHeader={(collapsed) => (
        <EntityHeader
          href={href}
          entityLabel={entityLabel}
          entityName={entityName}
          collapsed={collapsed}
        />
      )}
      fullName={fullName}
      avatar={avatar}
      roleName={roleName}
    />
  );
}
