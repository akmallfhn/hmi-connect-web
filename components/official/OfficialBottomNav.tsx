"use client";

import {
  IconArrowBackUp,
  IconSmartHome,
  IconUserCircle,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { officialEntityHref, withActingEntity } from "@/lib/access";
import { entityProfileHref } from "@/lib/feed-author";
import type { AccessEntityTypeEnum } from "@/lib/types";
import { NavIconPulse, usePressPulse } from "../navigations/BottomNav";

interface OfficialBottomNavProps {
  entityType: AccessEntityTypeEnum;
  entityId: string;
}

const TAB_CLASS =
  "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium";

// Mobile twin of the official desktop rail: the entity's timeline, its profile, and the way back out.
export default function OfficialBottomNav({
  entityType,
  entityId,
}: OfficialBottomNavProps) {
  const pathname = usePathname();
  const timelineHref = officialEntityHref(entityType, entityId);
  const profileHref = entityProfileHref(entityType, entityId);
  const isTimeline = pathname === timelineHref;
  const isProfile = pathname === profileHref;
  const [homePressed, triggerHome] = usePressPulse();
  const [profilePressed, triggerProfile] = usePressPulse();
  const [exitPressed, triggerExit] = usePressPulse();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-between border-t border-[#e6e9ef] bg-white/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <Link
        href={timelineHref}
        onClick={triggerHome}
        className={`${TAB_CLASS} ${isTimeline ? "text-primary" : "text-[#5f6573]"}`}
      >
        <NavIconPulse pressed={homePressed}>
          <IconSmartHome className="size-5" stroke={isTimeline ? 2.4 : 2} />
        </NavIconPulse>
        Beranda
      </Link>

      <Link
        href={withActingEntity(profileHref, { entityType, entityId })}
        onClick={triggerProfile}
        className={`${TAB_CLASS} ${isProfile ? "text-primary" : "text-[#5f6573]"}`}
      >
        <NavIconPulse pressed={profilePressed}>
          <IconUserCircle className="size-5" stroke={isProfile ? 2.4 : 2} />
        </NavIconPulse>
        Profil HMI
      </Link>

      <Link
        href="/settings"
        onClick={triggerExit}
        className={`${TAB_CLASS} text-destructive`}
      >
        <NavIconPulse pressed={exitPressed}>
          <IconArrowBackUp className="size-5" stroke={2} />
        </NavIconPulse>
        Mode User
      </Link>
    </nav>
  );
}
