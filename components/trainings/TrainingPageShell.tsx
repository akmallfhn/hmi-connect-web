import type { ReactNode } from "react";
import type { VerificationStatusEnum } from "@/lib/types";
import BottomNav from "../navigations/BottomNav";
import Header from "../navigations/Header";

export interface TrainingViewer {
  fullName?: string;
  avatar?: string;
  userId?: string;
  username?: string;
  branchName?: string;
  verificationStatus?: VerificationStatusEnum;
}

interface TrainingPageShellProps {
  viewer: TrainingViewer;
  mobileBackTitle?: string;
  bgClassName?: string;
  hideBottomNav?: boolean;
  children: ReactNode;
}

export default function TrainingPageShell({
  viewer,
  mobileBackTitle,
  bgClassName = "bg-[#f5f7fb]",
  hideBottomNav = false,
  children,
}: TrainingPageShellProps) {
  return (
    <div
      className={`min-h-screen ${bgClassName} ${hideBottomNav ? "pb-0" : "pb-16"} lg:pb-0`}
    >
      <Header
        fullName={viewer.fullName}
        avatar={viewer.avatar}
        userId={viewer.userId}
        username={viewer.username}
        verificationStatus={viewer.verificationStatus}
        mobileBackTitle={mobileBackTitle}
      />
      {children}
      {!hideBottomNav && (
        <BottomNav userId={viewer.userId} username={viewer.username} />
      )}
    </div>
  );
}
