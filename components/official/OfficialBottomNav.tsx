"use client";

import {
  IconArrowBackUp,
  IconCalendarEvent,
  IconSmartHome,
  IconUserCircle,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MANAGE_EVENTS_HREF,
} from "@/lib/access";
import { entityProfileHref } from "@/lib/feed-author";
import type { AccessEntityTypeEnum } from "@/lib/types";
import { NavIconPulse, usePressPulse } from "../navigations/NavPulse";
import SwitchAccountButton from "./SwitchAccountButton";

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
  const timelineHref = "/";
  const profileHref = entityProfileHref(entityType, entityId);
  const eventsHref = MANAGE_EVENTS_HREF;
  const isTimeline = pathname === timelineHref;
  const isProfile = pathname === profileHref;
  const isEvents = pathname === eventsHref || pathname.startsWith(`${eventsHref}/`);
  const [homePressed, triggerHome] = usePressPulse();
  const [profilePressed, triggerProfile] = usePressPulse();
  const [eventsPressed, triggerEvents] = usePressPulse();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-between border-t border-border bg-surface/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <Link
        href={timelineHref}
        onClick={triggerHome}
        className={`${TAB_CLASS} ${isTimeline ? "text-primary-foreground" : "text-muted-foreground"}`}
      >
        <NavIconPulse pressed={homePressed}>
          <IconSmartHome className="size-5" stroke={isTimeline ? 2.4 : 2} />
        </NavIconPulse>
        Beranda
      </Link>

      <Link
        href={eventsHref}
        onClick={triggerEvents}
        className={`${TAB_CLASS} ${isEvents ? "text-primary-foreground" : "text-muted-foreground"}`}
      >
        <NavIconPulse pressed={eventsPressed}>
          <IconCalendarEvent className="size-5" stroke={isEvents ? 2.4 : 2} />
        </NavIconPulse>
        Event
      </Link>

      <Link
        href={profileHref}
        onClick={triggerProfile}
        className={`${TAB_CLASS} ${isProfile ? "text-primary-foreground" : "text-muted-foreground"}`}
      >
        <NavIconPulse pressed={profilePressed}>
          <IconUserCircle className="size-5" stroke={isProfile ? 2.4 : 2} />
        </NavIconPulse>
        Profil HMI
      </Link>

      <SwitchAccountButton
        account={null}
        href="/"
        className={`${TAB_CLASS} text-destructive-foreground`}
      >
        <IconArrowBackUp className="size-5" stroke={2} />
        Mode User
      </SwitchAccountButton>
    </nav>
  );
}
