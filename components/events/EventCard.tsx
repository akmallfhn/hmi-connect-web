"use client";

import {
  IconClock,
  IconMapPin,
  IconPhotoOff,
  IconShare2,
  IconUsers,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { EventListEntry } from "@/apis/events";
import { useEventAttendance } from "@/hooks/useEventAttendance";
import {
  eventOrganizer,
  eventShareText,
  eventStatus,
  formatEventAttendees,
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
}: {
  event: EventListEntry;
  href?: string;
  manage?: boolean;
}) {
  const [shareOpen, setShareOpen] = useState(false);
  const attendance = useEventAttendance({
    eventId: event.id,
    initialAttending: event.is_attending,
    initialCount: event.attendee_count,
  });
  const status = eventStatus(event.start_date, event.end_date);
  const ended = status.tone === "ended";
  const { author } = eventOrganizer(event);
  const shareUrl =
    typeof window === "undefined" ? "" : `${window.location.origin}/events/${event.id}`;

  return (
    <>
      <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border-strong bg-surface transition-colors hover:border-primary/60 focus-within:border-primary">
        <Link
          href={href}
          className="flex flex-1 flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
        >
          <div className="relative aspect-[16/9] overflow-hidden bg-linear-to-br from-brand-deep to-primary">
            {event.thumbnail_url ? (
              <Image
                src={event.thumbnail_url}
                alt=""
                fill
                sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 390px"
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
                className="absolute left-3 top-3"
              />
            )}
          </div>

          <div className="flex flex-1 gap-3 p-4">
            <EventDateTile value={event.start_date} />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <h2 className="line-clamp-2 font-stack-sans-headline text-lg font-medium leading-6 text-heading">
                {event.title}
              </h2>
              <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                <span className="flex min-w-0 items-center gap-1.5">
                  <IconClock className="size-4 shrink-0" stroke={2} />
                  <span className="truncate">
                    {formatEventTimeLabel(event.start_date, event.end_date)}
                  </span>
                </span>
                <span className="flex min-w-0 items-center gap-1.5">
                  <IconMapPin className="size-4 shrink-0" stroke={2} />
                  <span className="truncate">{event.location_name || "Lokasi menyusul"}</span>
                </span>
                <span className="flex min-w-0 items-center gap-1.5">
                  <IconUsers className="size-4 shrink-0" stroke={2} />
                  <span className="truncate">
                    {formatEventAttendees(attendance.attendeeCount, ended)}
                  </span>
                </span>
              </div>
              <div className="mt-auto flex min-w-0 items-center gap-2 pt-2">
                <FeedAuthorAvatar author={author} size={24} />
                <span className="truncate text-sm font-medium text-heading">{author.name}</span>
              </div>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2 border-t border-border px-4 py-3">
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
      </article>
      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title="Bagikan Event"
        url={shareUrl}
        text={eventShareText(event.title, event.start_date, event.end_date)}
      />
    </>
  );
}
