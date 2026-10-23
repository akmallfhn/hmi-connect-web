"use client";

import { useEffect, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useLocalTabs } from "@/hooks/useLocalTabs";
import ProfileTabs, { type ProfileTab } from "./ProfileTabs";

export default function ProfileSections({
  username,
  availableTabs,
  postPanel,
  activityPanel,
  articlesPanel,
  children,
}: {
  username: string;
  availableTabs: readonly ProfileTab[];
  postPanel: ReactNode;
  activityPanel: ReactNode;
  articlesPanel: ReactNode;
  children: ReactNode;
}) {
  const searchParams = useSearchParams();
  const items = availableTabs.map((value) => ({ value }));
  const { activeTab, selectTab } = useLocalTabs(
    items,
    availableTabs[0] ?? "profile",
  );
  const hasTabNavigation = availableTabs.length > 1;

  useEffect(() => {
    const requestedTab = searchParams.get("tab");
    if (
      !requestedTab ||
      (hasTabNavigation && availableTabs.includes(requestedTab as ProfileTab))
    ) {
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.delete("tab");
    window.history.replaceState(
      null,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }, [availableTabs, hasTabNavigation, searchParams]);

  return (
    <>
      {hasTabNavigation ? (
        <ProfileTabs
          username={username}
          tabs={availableTabs}
          activeTab={activeTab}
          onChange={selectTab}
        />
      ) : null}
      {activeTab === "posts"
        ? postPanel
        : activeTab === "activities"
          ? activityPanel
          : activeTab === "articles"
            ? articlesPanel
            : children}
    </>
  );
}
