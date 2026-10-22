"use client";

import type { ReactNode } from "react";
import { useLocalTabs } from "@/hooks/useLocalTabs";
import ProfileTabs from "./ProfileTabs";

const ITEMS = [{ value: "activities" }, { value: "profile" }] as const;

export default function ProfileSections({
  username,
  activityPanel,
  children,
}: {
  username: string;
  activityPanel: ReactNode;
  children: ReactNode;
}) {
  const { activeTab, selectTab } = useLocalTabs(ITEMS, "activities");
  return (
    <>
      <ProfileTabs
        username={username}
        activeTab={activeTab}
        onChange={selectTab}
      />
      {activeTab === "activities" ? activityPanel : children}
    </>
  );
}
