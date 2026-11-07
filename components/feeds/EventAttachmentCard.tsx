"use client";

import {
  IconArrowRight,
  IconBuildingCommunity,
  IconCalendarEvent,
  IconMapPin,
  IconPhotoOff,
  IconTag,
  IconX,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import type { FeedEventAttachment } from "@/apis/feeds";
import Button from "@/components/buttons/Button";
import { formatEventDateLabel } from "@/lib/event-ui";
import { formatEntityAuthorName } from "@/lib/feed-author";
import type { AccessEntityTypeEnum } from "@/lib/types";

export default function EventAttachmentCard({
  attachment,
  onRemove,
  removeDisabled = false,
}: {
  attachment: FeedEventAttachment;
  onRemove?: () => void;
  removeDisabled?: boolean;
}) {
  if (attachment.reference_is_deleted) {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-xl bg-surface-muted px-3 py-4 text-sm text-muted-foreground">
        <IconCalendarEvent className="size-4 shrink-0" stroke={2} />
        Event yang dibagikan sudah dihapus
      </div>
    );
  }

  const start = attachment.reference_start_date;
  const end = attachment.reference_end_date ?? start;
  const dateLabel = start && end ? formatEventDateLabel(start, end) : null;
  const title = attachment.reference_title || "Event HMI";
  const location = attachment.reference_location_name?.trim() || "Lokasi menyusul";
  const rawOrganizerName = attachment.reference_organizer_entity_name?.trim();
  const organizerType = attachment.reference_organizer_entity_type;
  const organizerName = rawOrganizerName
    ? organizerType && organizerType !== "special_body"
      ? formatEntityAuthorName(organizerType as AccessEntityTypeEnum, rawOrganizerName)
      : rawOrganizerName
    : "Penyelenggara HMI";
  const href = `/events/${attachment.reference_id}`;

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-[#f5f7fb] dark:bg-[#1e1e1e]">
      <Link
        href={href}
        className="block p-4 pb-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:p-5 sm:pb-0"
      >
        <div className="relative aspect-video w-full overflow-hidden rounded-xl">
          {attachment.reference_image_url ? (
            <Image
              src={attachment.reference_image_url}
              alt=""
              fill
              sizes="(max-width: 639px) 100vw, 640px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-media-backdrop text-on-dark/50">
              <IconPhotoOff className="size-9" stroke={1.5} />
            </div>
          )}
          <span className="absolute left-3 top-3 inline-flex max-w-[70%] items-center gap-1.5 rounded-full bg-media-backdrop/75 px-2.5 py-1 text-xs font-semibold text-on-dark backdrop-blur-sm">
            <IconTag className="size-3.5 shrink-0" stroke={1.8} />
            <span className="truncate">{attachment.reference_category_name || "Event HMI"}</span>
          </span>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <div className="flex min-w-0 flex-col gap-2.5">
            <p className="line-clamp-2 font-stack-sans-headline text-lg font-medium leading-6 text-heading sm:text-xl sm:leading-7">
              {title}
            </p>
            <span className="flex min-w-0 items-center gap-2 text-[13px] leading-5 text-muted-foreground sm:text-sm">
              <IconBuildingCommunity className="size-4 shrink-0" stroke={1.8} />
              <span className="line-clamp-1 min-w-0">{organizerName}</span>
            </span>
          </div>

          <div className="flex min-w-0 flex-col gap-2">
            {dateLabel && (
              <span className="flex min-w-0 items-start gap-2 text-[13px] leading-5 text-muted-foreground sm:text-sm">
                <IconCalendarEvent className="mt-0.5 size-4 shrink-0" stroke={1.8} />
                <span className="line-clamp-1 min-w-0">{dateLabel}</span>
              </span>
            )}
            <span className="flex min-w-0 items-start gap-2 text-[13px] leading-5 text-muted-foreground sm:text-sm">
              <IconMapPin className="mt-0.5 size-4 shrink-0" stroke={1.8} />
              <span className="line-clamp-1 min-w-0">{location}</span>
            </span>
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-2 px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
        <Link href={href}>
          <Button variant="secondary">
            Lihat event <IconArrowRight className="size-4 shrink-0" stroke={2} />
          </Button>
        </Link>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            disabled={removeDisabled}
            aria-label="Hapus event"
            title="Hapus event"
            className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-black/5 text-muted-foreground transition-colors hover:bg-black/10 hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60 dark:bg-on-dark/10 dark:hover:bg-on-dark/20"
          >
            <IconX className="size-4" stroke={2} />
          </button>
        )}
      </div>
    </div>
  );
}
