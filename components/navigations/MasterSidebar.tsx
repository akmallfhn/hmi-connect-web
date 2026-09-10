"use client";

import {
  Building,
  GitBranch,
  LayoutDashboard,
  Network,
  School,
  ShieldCheck,
  Users,
  Waypoints,
} from "lucide-react";
import Link from "next/link";
import AdminSidebar, { type AdminNavEntry } from "./AdminSidebar";
import LogoHmiConnectHorizontal from "../svg/LogoHmiConnectHorizontal";

interface MasterSidebarProps {
  fullName?: string;
  avatar?: string;
  roleName?: string;
  // This deployment manages one organization, so its item links straight to that id — there is no list.
  organizationId?: string;
}

function getNavItems(organizationId?: string): AdminNavEntry[] {
  return [
    { label: "Dashboard", href: "/master", icon: LayoutDashboard, exact: true },
    {
      groupName: "Organisasi",
      items: [
        ...(organizationId
          ? [
              {
                label: "Kelola Organisasi",
                href: `/master/organizations/${organizationId}`,
                icon: Building,
              },
            ]
          : []),
        {
          label: "Kelola Badko",
          href: "/master/coordinating-bodies",
          icon: Network,
        },
        { label: "Kelola Cabang", href: "/master/branches", icon: GitBranch },
        {
          label: "Kelola Korkom",
          href: "/master/coordinating-chapters",
          icon: Waypoints,
        },
        {
          label: "Kelola Komisariat",
          href: "/master/chapters",
          icon: School,
        },
      ],
    },
    {
      groupName: "Keanggotaan",
      items: [
        { label: "User Management", href: "/master/users", icon: Users },
        {
          label: "Permintaan Verifikasi",
          href: "/master/verification",
          icon: ShieldCheck,
        },
      ],
    },
  ];
}

export default function MasterSidebar({
  fullName,
  avatar,
  roleName,
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
      roleName={roleName}
    />
  );
}
