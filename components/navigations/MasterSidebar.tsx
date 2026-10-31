"use client";

import { ADMIN_NAV_ICON } from "./admin-nav-icons";
import Link from "next/link";
import { usePendingVerificationCount } from "@/hooks/usePendingVerificationCount";
import AdminSidebar, { type AdminNavEntry } from "./AdminSidebar";
import LogoHmiConnectHorizontal from "../svg/LogoHmiConnectHorizontal";

interface MasterSidebarProps {
  fullName?: string;
  avatar?: string;
  email?: string;
  // This deployment manages one organization, so its item links straight to that id — there is no list.
  organizationId?: string;
  pendingVerificationCount?: number;
}

function getNavItems(
  organizationId?: string,
  pendingVerificationCount?: number,
): AdminNavEntry[] {
  return [
    { label: "Dashboard", href: "/master", icon: ADMIN_NAV_ICON.dashboard, exact: true },
    {
      groupName: "Organisasi",
      items: [
        ...(organizationId
          ? [
              {
                label: "Kelola Organisasi",
                href: `/master/organizations/${organizationId}`,
                icon: ADMIN_NAV_ICON.organization,
              },
            ]
          : []),
        {
          label: "Kelola Badko",
          href: "/master/coordinating-bodies",
          icon: ADMIN_NAV_ICON.coordinatingBody,
        },
        { label: "Kelola Cabang", href: "/master/branches", icon: ADMIN_NAV_ICON.branch },
        {
          label: "Kelola Korkom",
          href: "/master/coordinating-chapters",
          icon: ADMIN_NAV_ICON.coordinatingChapter,
        },
        {
          label: "Kelola Komisariat",
          href: "/master/chapters",
          icon: ADMIN_NAV_ICON.chapter,
        },
        {
          label: "Pedoman Organisasi",
          href: "/master/organizational-documents",
          icon: ADMIN_NAV_ICON.organizationalDocument,
        },
        {
          label: "Kelola Institusi",
          href: "/master/institutions",
          icon: ADMIN_NAV_ICON.institution,
        },
      ],
    },
    {
      groupName: "Keanggotaan",
      items: [
        { label: "User Management", href: "/master/users", icon: ADMIN_NAV_ICON.members },
        {
          label: "Permintaan Verifikasi",
          href: "/master/verification",
          icon: ADMIN_NAV_ICON.verification,
          badgeCount: pendingVerificationCount,
        },
      ],
    },
  ];
}

export default function MasterSidebar({
  fullName,
  avatar,
  email,
  organizationId,
  pendingVerificationCount = 0,
}: MasterSidebarProps) {
  const liveVerificationCount = usePendingVerificationCount(pendingVerificationCount, {});

  return (
    <AdminSidebar
      storageKey="master_sidebar_collapsed"
      homeHref="/master"
      navItems={getNavItems(organizationId, liveVerificationCount)}
      renderHeader={(collapsed) =>
        !collapsed ? (
          <Link href="/master" className="flex items-center">
            <LogoHmiConnectHorizontal className="h-7 w-auto" />
          </Link>
        ) : null
      }
      fullName={fullName}
      avatar={avatar}
      email={email}
    />
  );
}
