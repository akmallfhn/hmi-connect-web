"use client";

import { useEffect, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useActingHref } from "@/hooks/useActingEntity";
import { useLocalTabs } from "@/hooks/useLocalTabs";
import type { EntityTab } from "@/lib/entity-profile";
import Tabs from "../common/Tabs";

export type EntitySection = {
  value: EntityTab;
  label: string;
  panel: ReactNode;
};

interface EntitySectionsProps {
  baseHref: string;
  sections: EntitySection[];
}

// Only non-empty sections reach here; the tab bar shows once there are at least two to choose from.
export default function EntitySections({ baseHref, sections }: EntitySectionsProps) {
  const searchParams = useSearchParams();
  const actingHref = useActingHref();
  const defaultTab = sections[0]?.value ?? "posts";
  const { activeTab, selectTab } = useLocalTabs(sections, defaultTab);
  const hasTabNavigation = sections.length > 1;

  useEffect(() => {
    const requestedTab = searchParams.get("tab");
    if (
      !requestedTab ||
      (hasTabNavigation && sections.some((section) => section.value === requestedTab))
    ) {
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.delete("tab");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [hasTabNavigation, searchParams, sections]);

  if (sections.length === 0) return null;
  const active = sections.find((section) => section.value === activeTab) ?? sections[0];

  return (
    <>
      {hasTabNavigation && (
        <nav aria-label="Bagian profil" className="px-4 lg:px-0">
          <Tabs
            ariaLabel="Bagian profil"
            items={sections.map((section) => ({
              value: section.value,
              label: section.label,
              href: actingHref(
                section.value === defaultTab
                  ? baseHref
                  : `${baseHref}?tab=${section.value}`,
              ),
            }))}
            activeValue={active.value}
            onChange={selectTab}
            className="w-full sm:w-fit"
          />
        </nav>
      )}
      {active.panel}
    </>
  );
}
