"use client";

import { logoutUser } from "@/lib/actions";
import { ChevronDown, LogOut } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Avatar from "../common/Avatar";
import Dropdown from "../common/Dropdown";

interface AdminUserMenuProps {
  fullName?: string;
  avatar?: string;
  roleName?: string;
  mainSiteOrigin: string;
}

export default function AdminUserMenu({
  fullName,
  avatar,
  roleName,
  mainSiteOrigin,
}: AdminUserMenuProps) {
  const displayName = fullName ?? "Admin";
  const firstName = displayName.split(" ")[0];
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logoutUser();
    } catch (err) {
      console.error("[AdminUserMenu] logoutUser threw:", err);
    } finally {
      window.location.href = "/auth/login";
    }
  }

  return (
    <Dropdown
      align="right"
      panelClassName="w-80"
      trigger={({ toggle }) => (
        <button
          type="button"
          onClick={toggle}
          className="flex cursor-pointer items-center gap-3 rounded-full border border-[#e6e9ef] bg-white py-2 pr-4 pl-2 transition hover:bg-[#f5f7fb]"
        >
          <Avatar src={avatar} name={displayName} size={38} />
          <div className="text-left">
            <p className="text-sm font-semibold text-[#172033]">{firstName}</p>
            {roleName && <p className="text-xs text-[#5f6573]">{roleName}</p>}
          </div>
          <ChevronDown className="size-5 text-[#5f6573]" />
        </button>
      )}
    >
      <div className="flex items-center gap-3 border-b border-[#e6e9ef] px-4 py-4">
        <Avatar src={avatar} name={displayName} size={38} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#172033]">
            {displayName}
          </p>
          {roleName && (
            <p className="truncate text-xs text-[#5f6573]">{roleName}</p>
          )}
        </div>
      </div>
      <div className="flex flex-col py-1">
        <Link
          href={mainSiteOrigin}
          className="flex items-center gap-3 px-4 py-3 text-sm text-[#172033] transition hover:bg-[#f5f7fb]"
        >
          Kembali ke HMI Connect
        </Link>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm font-medium text-destructive transition hover:bg-destructive-soft disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LogOut className="size-4" />
        {loggingOut ? "Keluar..." : "Keluar"}
      </button>
    </Dropdown>
  );
}
