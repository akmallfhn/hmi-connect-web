"use client";

import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import type { UserStatusEnum, VerificationStatusEnum } from "@/lib/types";
import MainSiteDesktopSidebar from "./MainSiteDesktopSidebar";
import MainSiteDesktopHeader from "./MainSiteDesktopHeader";
import VerificationBanner from "./VerificationBanner";

interface MainSiteDesktopShellProps {
  children: ReactNode;
  userId?: string;
  fullName?: string;
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
    pathname.startsWith("/reset-password/") ||
    pathname === "/pendataan-komisariat"
  );
}

export default function MainSiteDesktopShell({
  children,
  userId,
  fullName,
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
        {/* The rail reads ?as=, and useSearchParams needs a boundary on statically rendered routes. */}
        <Suspense fallback={null}>
          <MainSiteDesktopSidebar
            userId={userId}
            userStatus={userStatus}
            verificationStatus={verificationStatus}
          />
        </Suspense>
        <div className="flex min-w-0 flex-1 flex-col">
          <Suspense fallback={null}>
            <MainSiteDesktopHeader
              userId={userId}
              fullName={fullName}
              avatar={avatar}
              username={username}
              verificationStatus={verificationStatus}
              isAlumni={isAlumni}
            />
          </Suspense>
          {children}
        </div>
      </div>
    </div>
  );
}
