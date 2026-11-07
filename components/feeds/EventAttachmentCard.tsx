"use client";

import { IconArrowRight, IconCalendarEvent, IconPhotoOff, IconX } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import type { FeedEventAttachment } from "@/apis/feeds";
import { formatEventDateLabel, formatEventTimeLabel } from "@/lib/event-ui";
import { formatEntityAuthorName } from "@/lib/feed-author";
import type { AccessEntityTypeEnum } from "@/lib/types";
import Label from "../common/Label";
import LogoHmi from "../svg/LogoHmi";

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
  const end = attachment.reference_end_date;
  const schedule = start && end
    ? `${formatEventDateLabel(start, end)} · ${formatEventTimeLabel(start, end)}`
    : null;
  const organizerType = attachment.reference_organizer_entity_type;
  const rawOrganizerName = attachment.reference_organizer_entity_name?.trim();
  const organizerName = rawOrganizerName
    ? organizerType && organizerType !== "special_body"
      ? formatEntityAuthorName(organizerType as AccessEntityTypeEnum, rawOrganizerName)
      : rawOrganizerName
    : "Penyelenggara HMI";

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-border-strong bg-surface transition-colors focus-within:border-primary">
      <Link
        href={`/events/${attachment.reference_id}`}
        className="group flex min-w-0 items-stretch gap-3 p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:gap-4 sm:p-4"
      >
        <div className="relative aspect-[4/5] w-[88px] shrink-0 overflow-hidden rounded-xl bg-primary-soft sm:w-28">
          {attachment.reference_image_url ? (
            <Image
              src={attachment.reference_image_url}
              alt=""
              fill
              sizes="(max-width: 639px) 88px, 112px"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
              unoptimized
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-linear-to-br from-primary-soft to-surface-muted text-primary-foreground">
              <IconPhotoOff className="size-8" stroke={1.5} />
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col items-start gap-2 py-0.5">
          <Label variant="orange" size="sm">{attachment.reference_category_name || "Event HMI"}</Label>
          <p className="line-clamp-2 font-stack-sans-headline text-[15px] font-medium leading-5 text-heading sm:text-base sm:leading-6">
            {attachment.reference_title || "Event HMI"}
          </p>
          <div className="mt-auto flex w-full min-w-0 flex-col gap-1.5">
            {schedule && (
              <span className="flex min-w-0 items-start gap-1.5 text-xs font-medium text-secondary-foreground sm:text-[13px]">
                <IconCalendarEvent className="mt-0.5 size-3.5 shrink-0" stroke={2} />
                <span className="line-clamp-2">{schedule}</span>
              </span>
            )}
            <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground sm:text-[13px]">
              <span className="relative flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-soft ring-1 ring-border">
                {attachment.reference_organizer_entity_image_url ? (
                  <Image src={attachment.reference_organizer_entity_image_url} alt="" fill sizes="20px" className="object-cover" unoptimized />
                ) : (
                  <LogoHmi className="h-3.5 w-auto" />
                )}
              </span>
              <span className="truncate">{organizerName}</span>
            </div>
          </div>
        </div>
      </Link>
      <div className="flex items-center justify-between gap-2 border-t border-divider bg-surface-subtle px-3 py-2.5 sm:px-4">
        <Link href={`/events/${attachment.reference_id}`} className="inline-flex min-h-9 items-center gap-1.5 text-xs font-semibold text-primary-foreground focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:text-sm">
          Lihat detail <IconArrowRight className="size-3.5" stroke={2} />
        </Link>
        {onRemove && (
          <button type="button" onClick={onRemove} disabled={removeDisabled} aria-label="Hapus event" title="Hapus event"
            className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-border-strong bg-surface text-muted-foreground transition hover:bg-destructive-soft hover:text-destructive-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:cursor-not-allowed disabled:opacity-60">
            <IconX className="size-4" stroke={2} />
          </button>
        )}
      </div>
    </div>
  );
}
