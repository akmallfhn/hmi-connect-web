"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import MainSiteDesktopSidebar from "./MainSiteDesktopSidebar";

interface MainSiteDesktopShellProps {
  children: ReactNode;
  userId?: string;
  fullName?: string;
  avatar?: string;
  username?: string;
}

// Authentication and activation are intentionally distraction-free. Every other www
// route shares the same desktop frame, including public profile and feed-detail routes.
function hidesDesktopSidebar(pathname: string) {
  return pathname === "/activation" || pathname.startsWith("/auth/") || pathname.startsWith("/reset-password/");
}

export default function MainSiteDesktopShell({
  children,
  userId,
  fullName,
  avatar,
  username,
}: MainSiteDesktopShellProps) {
  const pathname = usePathname() ?? "";
  const hidden = hidesDesktopSidebar(pathname);

  return (
    <div className={hidden ? undefined : "lg:pl-64"}>
      {!hidden && (
        <MainSiteDesktopSidebar
          userId={userId}
          fullName={fullName}
          avatar={avatar}
          username={username}
        />
      )}
      {children}
    </div>
  );
}
