"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { UserStatusEnum, VerificationStatusEnum } from "@/lib/types";
import MainSiteDesktopSidebar from "./MainSiteDesktopSidebar";

interface MainSiteDesktopShellProps {
  children: ReactNode;
  userId?: string;
  avatar?: string;
  username?: string;
  userStatus?: UserStatusEnum;
  verificationStatus?: VerificationStatusEnum;
  isAlumni?: boolean;
}

const ARTICLE_EDIT_PATH = /^\/articles\/[^/]+\/[^/]+\/edit$/;

// Auth, activation, and both article composer routes are distraction-free; every other www route keeps the frame.
function hidesDesktopSidebar(pathname: string) {
  return (
    pathname === "/activation" ||
    pathname === "/articles/create" ||
    ARTICLE_EDIT_PATH.test(pathname) ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/reset-password/")
  );
}

export default function MainSiteDesktopShell({
  children,
  userId,
  avatar,
  username,
  userStatus,
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
          userStatus={userStatus}
          verificationStatus={verificationStatus}
          isAlumni={isAlumni}
        />
      )}
      {children}
    </div>
  );
}
