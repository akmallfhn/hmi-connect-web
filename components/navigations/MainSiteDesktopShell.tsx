"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { UserStatusEnum, VerificationStatusEnum } from "@/lib/types";
import MainSiteDesktopSidebar from "./MainSiteDesktopSidebar";
import VerificationBanner from "./VerificationBanner";

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

// Auth, activation, verification, and both article composer routes are distraction-free; every other www route keeps the frame.
function hidesDesktopSidebar(pathname: string) {
  return (
    pathname === "/activation" ||
    pathname === "/verification" ||
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

  if (hidden) return <>{children}</>;

  return (
    <div className="flex min-h-dvh flex-col">
      <VerificationBanner
        userId={userId}
        verificationStatus={verificationStatus}
      />

      <div className="flex flex-1">
        <MainSiteDesktopSidebar
          userId={userId}
          avatar={avatar}
          username={username}
          userStatus={userStatus}
          verificationStatus={verificationStatus}
          isAlumni={isAlumni}
        />
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
