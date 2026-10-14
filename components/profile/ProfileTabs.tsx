"use client";

import { useActingHref } from "@/hooks/useActingEntity";
import Tabs from "../common/Tabs";

interface ProfileTabsProps {
  username: string;
  activeTab: "activities" | "profile";
}

export default function ProfileTabs({ username, activeTab }: ProfileTabsProps) {
  const actingHref = useActingHref();
  const baseHref = `/profile/${encodeURIComponent(username)}`;

  return (
    <nav aria-label="Bagian profil" className="px-4 lg:px-0">
      <Tabs
        ariaLabel="Bagian profil"
        items={[
          { value: "activities", label: "Activities", href: actingHref(baseHref) },
          {
            value: "profile",
            label: "Profile",
            href: actingHref(`${baseHref}?tab=profile`),
          },
        ]}
        activeValue={activeTab}
        className="w-full sm:w-fit"
      />
    </nav>
  );
}
