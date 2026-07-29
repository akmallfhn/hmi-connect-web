"use client";

import {
  Award,
  BookText,
  FileCheck2,
  GraduationCap,
  LayoutDashboard,
  Users,
  Vote,
} from "lucide-react";
import Link from "next/link";
import type { BranchTypeEnum } from "@/lib/types";
import LogoHmi from "../svg/LogoHmi";
import AdminSidebar, { type AdminNavEntry } from "./AdminSidebar";

interface BranchSidebarProps {
  branchId: string;
  branchName: string;
  branchType: BranchTypeEnum;
  fullName?: string;
  avatar?: string;
  roleName?: string;
}

function getNavItems(branchId: string): AdminNavEntry[] {
  const base = `/branches/${branchId}`;
  return [
    { label: "Dashboard", href: base, icon: LayoutDashboard, exact: true },
    {
      groupName: "Organisasi",
      items: [
        { label: "Penerbitan SK", href: `${base}/sk`, icon: FileCheck2 },
        { label: "AD ART", href: `${base}/ad-art`, icon: BookText },
        {
          label: "Kelola Komisariat",
          href: `${base}/chapters`,
          icon: GraduationCap,
        },
        { label: "Daftar Kader", href: `${base}/members`, icon: Users },
      ],
    },
    {
      groupName: "Program",
      items: [
        { label: "Latihan Kader 2", href: `${base}/lk2`, icon: Award },
        { label: "Konfercab", href: `${base}/konfercab`, icon: Vote },
      ],
    },
  ];
}

function BranchHeader({
  branchId,
  branchName,
  branchType,
  collapsed,
}: {
  branchId: string;
  branchName: string;
  branchType: BranchTypeEnum;
  collapsed: boolean;
}) {
  const icon = (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft">
      <LogoHmi className="h-7 w-auto" />
    </span>
  );

  if (collapsed) {
    return (
      <Link href={`/branches/${branchId}`} title={branchName}>
        {icon}
      </Link>
    );
  }

  const statusText =
    branchType === "full" ? "Status: Penuh" : "Status: Persiapan";
  const dotColor = branchType === "full" ? "bg-blue-500" : "bg-amber-500";

  return (
    <Link
      href={`/branches/${branchId}`}
      className="flex min-w-0 items-center gap-3"
    >
      {icon}
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[#172033]">
          Cabang {branchName}
        </p>
        <div className="mt-0.5 flex items-center gap-1.5">
          <span className="relative flex size-1.5">
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${dotColor}`}
            />
            <span
              className={`relative inline-flex size-1.5 rounded-full ${dotColor}`}
            />
          </span>
          <span className="truncate text-xs text-[#5f6573]">{statusText}</span>
        </div>
      </div>
    </Link>
  );
}

export default function BranchSidebar({
  branchId,
  branchName,
  branchType,
  fullName,
  avatar,
  roleName,
}: BranchSidebarProps) {
  return (
    <AdminSidebar
      storageKey="branch_sidebar_collapsed"
      navItems={getNavItems(branchId)}
      renderHeader={(collapsed) => (
        <BranchHeader
          branchId={branchId}
          branchName={branchName}
          branchType={branchType}
          collapsed={collapsed}
        />
      )}
      fullName={fullName}
      avatar={avatar}
      roleName={roleName}
    />
  );
}
