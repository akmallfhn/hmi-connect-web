import type { ReactNode } from "react";
import type { SessionUser } from "@/apis/session";
import Header from "../navigations/Header";
import BottomNav from "../navigations/BottomNav";

export default function EventPageShell({
  viewer,
  mobileBackTitle,
  hideBottomNav = false,
  children,
}: {
  viewer: SessionUser;
  mobileBackTitle?: string;
  hideBottomNav?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`min-h-screen bg-surface ${hideBottomNav ? "" : "pb-16"} lg:pb-0`}>
      <Header
        fullName={viewer.full_name}
        avatar={viewer.avatar}
        userId={viewer.id}
        username={viewer.username}
        verificationStatus={viewer.verification_status}
        mobileBackTitle={mobileBackTitle}
      />
      {children}
      {!hideBottomNav && <BottomNav userId={viewer.id} username={viewer.username} />}
    </div>
  );
}
