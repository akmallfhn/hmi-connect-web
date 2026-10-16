"use client";

import { ADMIN_NAV_ICON } from "./admin-nav-icons";
import Link from "next/link";
import AdminSidebar, { type AdminNavEntry } from "./AdminSidebar";
import LogoHmiConnectHorizontal from "../svg/LogoHmiConnectHorizontal";

interface MasterSidebarProps {
  fullName?: string;
  avatar?: string;
  email?: string;
  // This deployment manages one organization, so its item links straight to that id — there is no list.
  organizationId?: string;
}

function getNavItems(organizationId?: string): AdminNavEntry[] {
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
}: MasterSidebarProps) {
  return (
    <AdminSidebar
      storageKey="master_sidebar_collapsed"
      homeHref="/master"
      navItems={getNavItems(organizationId)}
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
