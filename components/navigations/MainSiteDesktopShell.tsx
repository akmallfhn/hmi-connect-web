"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { VerificationStatusEnum } from "@/lib/types";
import MainSiteDesktopSidebar from "./MainSiteDesktopSidebar";

interface MainSiteDesktopShellProps {
  children: ReactNode;
  userId?: string;
  avatar?: string;
  username?: string;
  verificationStatus?: VerificationStatusEnum;
  isAlumni?: boolean;
}

// Auth, activation, and the article composer are deliberately distraction-free; every other www route keeps the frame.
function hidesDesktopSidebar(pathname: string) {
  return (
    pathname === "/activation" ||
    pathname === "/articles/create" ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/reset-password/")
  );
}

export default function MainSiteDesktopShell({
  children,
  userId,
  avatar,
  username,
  verificationStatus,
  isAlumni,
}: MainSiteDesktopShellProps) {
  const pathname = usePathname() ?? "";
  const hidden = hidesDesktopSidebar(pathname);

  return (
    <div className={hidden ? undefined : "lg:pl-64"}>
      {!hidden && (
        <MainSiteDesktopSidebar
          userId={userId}
          avatar={avatar}
          username={username}
          verificationStatus={verificationStatus}
          isAlumni={isAlumni}
        />
      )}
      {children}
    </div>
  );
}
