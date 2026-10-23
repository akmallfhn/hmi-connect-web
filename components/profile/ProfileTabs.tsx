"use client";

import { useActingHref } from "@/hooks/useActingEntity";
import Tabs from "../common/Tabs";

export type ProfileTab = "posts" | "activities" | "articles" | "profile";

interface ProfileTabsProps {
  username: string;
  tabs: readonly ProfileTab[];
  activeTab: ProfileTab;
  onChange?: (value: ProfileTab) => void;
}

const TAB_LABEL: Record<ProfileTab, string> = {
  posts: "Post",
  activities: "Activities",
  articles: "Articles",
  profile: "Profile",
};

export default function ProfileTabs({
  username,
  tabs,
  activeTab,
  onChange,
}: ProfileTabsProps) {
  const actingHref = useActingHref();
  const baseHref = `/profile/${encodeURIComponent(username)}`;
  const defaultTab = tabs[0] ?? "profile";

  return (
    <nav aria-label="Bagian profil" className="px-4 lg:px-0">
      <Tabs
        ariaLabel="Bagian profil"
        items={tabs.map((value) => ({
          value,
          label: TAB_LABEL[value],
          href: actingHref(
            value === defaultTab ? baseHref : `${baseHref}?tab=${value}`,
          ),
        }))}
        activeValue={activeTab}
        onChange={onChange}
        className="w-full sm:w-fit"
      />
    </nav>
  );
}
