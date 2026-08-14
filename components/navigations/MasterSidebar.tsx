"use client";

import {
  Building2,
  GraduationCap,
  LayoutDashboard,
  Network,
  Users,
} from "lucide-react";
import Link from "next/link";
import AdminSidebar, { type AdminNavEntry } from "./AdminSidebar";
import LogoHmiConnectHorizontal from "../svg/LogoHmiConnectHorizontal";

interface MasterSidebarProps {
  fullName?: string;
  avatar?: string;
  roleName?: string;
}

const NAV_ITEMS: AdminNavEntry[] = [
  { label: "Dashboard", href: "/master", icon: LayoutDashboard, exact: true },
  {
    groupName: "Administrasi",
    items: [{ label: "User Management", href: "/master/users", icon: Users }],
  },
  {
    groupName: "Organisasi",
    items: [
      { label: "Badko", href: "/master/coordinating-bodies", icon: Network },
      { label: "Cabang", href: "/master/branches", icon: Building2 },
      { label: "Komisariat", href: "/master/chapters", icon: GraduationCap },
    ],
  },
];

export default function MasterSidebar({
  fullName,
  avatar,
  roleName,
}: MasterSidebarProps) {
  return (
    <AdminSidebar
      storageKey="master_sidebar_collapsed"
      navItems={NAV_ITEMS}
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
