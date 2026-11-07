"use client";

import {
  IconCalendarEvent,
  IconClock,
  IconMapPin,
  IconPhotoOff,
  IconShare2,
  IconUsers,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { EventListEntry } from "@/apis/events";
import { useEventAttendance } from "@/hooks/useEventAttendance";
import { eventComposeIntent, openFeedComposerWithAttachment } from "@/lib/feed-compose-intent";
import {
  eventOrganizer,
  eventShareText,
  eventStatus,
  formatEventDateLabel,
  formatEventTimeLabel,
} from "@/lib/event-ui";
import Button from "../buttons/Button";
import FeedAuthorAvatar from "../feeds/FeedAuthorAvatar";
import ShareModal from "../modals/ShareModal";
import EventAttendanceButton from "./EventAttendanceButton";
import EventDateTile from "./EventDateTile";
import EventLinkButton from "./EventLinkButton";
import EventStatusLabel from "./EventStatusLabel";

export default function EventCard({
  event,
  href = `/events/${event.id}`,
  manage = false,
  compactMobile = false,
  showActions = true,
}: {
  event: EventListEntry;
  href?: string;
  manage?: boolean;
  compactMobile?: boolean;
  showActions?: boolean;
}) {
  const router = useRouter();
  const [shareOpen, setShareOpen] = useState(false);
  const attendance = useEventAttendance({
    eventId: event.id,
    initialAttending: event.is_attending,
    initialCount: event.attendee_count,
  });
  const status = eventStatus(event.start_date, event.end_date);
  const ended = status.tone === "ended";
  const { author } = eventOrganizer(event);
  const attendanceLabel = `${attendance.attendeeCount} orang ${ended ? "hadir" : "akan hadir"}`;
  const shareUrl =
    typeof window === "undefined" ? "" : `${window.location.origin}/events/${event.id}`;

  return (
    <>
      <article className={`group flex h-full min-w-0 flex-col overflow-hidden transition-colors hover:border-primary/60 focus-within:border-primary ${compactMobile ? "border-0 p-0 sm:rounded-2xl sm:border sm:border-border-strong sm:bg-surface" : "rounded-2xl border border-border-strong bg-surface"}`}>
        <Link
          href={href}
          className={`flex min-w-0 flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary ${compactMobile ? "flex-row gap-3 sm:flex-col sm:gap-0" : "flex-col"}`}
        >
          <div className={`relative overflow-hidden bg-linear-to-br from-brand-deep to-primary ${compactMobile ? "aspect-[16/9] w-24 shrink-0 self-start rounded-lg sm:w-auto sm:self-auto sm:rounded-none" : "aspect-[16/9]"}`}>
            {event.thumbnail_url ? (
              <Image
                src={event.thumbnail_url}
                alt=""
                fill
                sizes={compactMobile ? "(max-width: 639px) 96px, (max-width: 1279px) 50vw, 390px" : "(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 390px"}
                className={`object-cover transition duration-500 group-hover:scale-105 motion-reduce:transition-none ${ended ? "grayscale-[35%]" : ""}`}
              />
            ) : (
              <div className="flex size-full items-center justify-center text-on-dark/70">
                <IconPhotoOff className="size-8" stroke={1.8} />
              </div>
            )}
            {status.tone !== "upcoming" && (
              <EventStatusLabel
                label={status.label}
                tone={status.tone}
                className={`absolute left-3 top-3 ${compactMobile ? "hidden sm:inline-flex" : ""}`}
              />
            )}
          </div>

          <div className={`flex min-w-0 flex-1 gap-3 ${compactMobile ? "p-0 sm:p-4" : "p-4"}`}>
            <span className={compactMobile ? "hidden sm:block" : ""}>
              <EventDateTile value={event.start_date} />
            </span>
            <div className={`flex min-w-0 flex-1 flex-col ${compactMobile ? "gap-1.5 sm:gap-2" : "gap-2"}`}>
              <h2 className={`line-clamp-2 font-stack-sans-headline font-medium text-heading ${compactMobile ? "text-sm leading-5 sm:text-lg sm:leading-6" : "text-lg leading-6"}`}>
                {event.title}
              </h2>
              {compactMobile && status.tone !== "upcoming" && (
                <span className="block truncate text-xs font-semibold text-muted-foreground sm:hidden">
                  {status.label}
                </span>
              )}
              <div className={`flex min-w-0 flex-col gap-1 text-muted-foreground ${compactMobile ? "text-xs sm:text-sm" : "text-sm"}`}>
                {compactMobile && (
                  <span className="flex min-w-0 items-center gap-1.5 sm:hidden">
                    <IconCalendarEvent className="size-4 shrink-0" stroke={2} />
                    <span className="truncate">{formatEventDateLabel(event.start_date, event.end_date)}</span>
                  </span>
                )}
                {manage && (
                  <span className="flex min-w-0 items-center gap-1.5">
                    <IconUsers className="size-4 shrink-0" stroke={2} />
                    <span className="truncate">{attendanceLabel}</span>
                  </span>
                )}
                <span className={`min-w-0 items-center gap-1.5 ${compactMobile ? "hidden sm:flex" : "flex"}`}>
                  <IconClock className="size-4 shrink-0" stroke={2} />
                  <span className="truncate">
                    {formatEventTimeLabel(event.start_date, event.end_date)}
                  </span>
                </span>
                <span className="flex min-w-0 items-center gap-1.5">
                  <IconMapPin className="size-4 shrink-0" stroke={2} />
                  <span className="truncate">{event.location_name || "Lokasi menyusul"}</span>
                </span>
              </div>
              {!manage && (
                <div className={`mt-auto min-w-0 items-center gap-2 pt-2 ${compactMobile ? "hidden sm:flex" : "flex"}`}>
                  <FeedAuthorAvatar author={author} size={24} />
                  <span className="truncate text-sm font-medium text-heading">{author.name}</span>
                </div>
              )}
            </div>
          </div>
        </Link>

        {showActions && (
          <div className={`items-center gap-2 border-t border-border px-4 py-3 ${compactMobile ? "hidden sm:flex" : "flex"}`}>
            {manage ? (
              <EventLinkButton href={href} className="min-w-0 flex-1">
                Kelola event
              </EventLinkButton>
            ) : (
              <EventAttendanceButton
                isAttending={attendance.isAttending}
                saving={attendance.saving}
                ended={ended}
                onToggle={attendance.toggle}
                className="min-w-0 flex-1"
              />
            )}
            <Button
              variant="outline"
              onClick={() => setShareOpen(true)}
              aria-label={`Bagikan ${event.title}`}
              title="Bagikan"
            >
              <IconShare2 className="size-5" stroke={2} />
            </Button>
          </div>
        )}
      </article>
      {showActions && (
        <ShareModal
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          title="Bagikan Event"
          url={shareUrl}
          text={eventShareText(event.title, event.start_date, event.end_date)}
          onShareToFeed={() => {
            const { key, draft } = eventComposeIntent(event);
            openFeedComposerWithAttachment(key, draft, router.push);
          }}
        />
      )}
    </>
  );
}
