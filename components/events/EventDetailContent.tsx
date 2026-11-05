"use client";

import {
  IconBrandWhatsapp,
  IconBuildingCommunity,
  IconCalendarEvent,
  IconExternalLink,
  IconMapPin,
  IconPhoto,
  IconPhotoOff,
  IconShare2,
  IconTag,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { EventAttendeePreview, EventDetail } from "@/apis/events";
import { useEventAttendance } from "@/hooks/useEventAttendance";
import {
  eventOrganizer,
  eventShareText,
  eventStatus,
  formatEventDateLabel,
  formatEventDuration,
  formatEventTimeLabel,
  safeExternalUrl,
  splitEventLocation,
} from "@/lib/event-ui";
import Button from "../buttons/Button";
import Avatar from "../common/Avatar";
import PageMargin from "../common/PageMargin";
import FeedAuthorAvatar from "../feeds/FeedAuthorAvatar";
import ImagePreviewOverlay from "../modals/ImagePreviewOverlay";
import ShareModal from "../modals/ShareModal";
import SendMessageButton from "../profile/SendMessageButton";
import EventAttendanceButton from "./EventAttendanceButton";
import EventAttendeesSummary from "./EventAttendeesSummary";
import EventLinkButton from "./EventLinkButton";
import EventLocationCard from "./EventLocationCard";
import EventStatusLabel from "./EventStatusLabel";

const CARD_CLASS =
  "border border-x-0 border-border bg-surface p-5 lg:rounded-2xl lg:border-x";
const CARD_TITLE_CLASS =
  "font-stack-sans-headline text-sm font-medium text-heading xl:text-[15px]";
const LONG_DESCRIPTION_LENGTH = 400;

function whatsappHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits.startsWith("62") ? digits : `62${digits.replace(/^0+/, "")}`}`;
}

function FactRow({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-[15px] leading-6">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span className="min-w-0 break-words">{children}</span>
    </li>
  );
}

// Inherits its text color, so the same rows read on the dark header and on the white aside.
function EventFacts({
  categoryName,
  place,
  dateTime,
  organizerName,
  organizerHref,
}: {
  categoryName: string;
  place: string;
  dateTime: string;
  organizerName: string;
  organizerHref: string | null;
}) {
  return (
    <ul className="flex flex-col gap-2.5">
      {categoryName && (
        <FactRow icon={<IconTag className="size-5" stroke={2} />}>
          {categoryName}
        </FactRow>
      )}
      <FactRow icon={<IconMapPin className="size-5" stroke={2} />}>
        {place || "Lokasi menyusul"}
      </FactRow>
      <FactRow icon={<IconCalendarEvent className="size-5" stroke={2} />}>
        {dateTime}
      </FactRow>
      <FactRow icon={<IconBuildingCommunity className="size-5" stroke={2} />}>
        {organizerHref ? (
          <Link href={organizerHref} className="hover:underline">
            {organizerName}
          </Link>
        ) : (
          organizerName
        )}
      </FactRow>
    </ul>
  );
}

export default function EventDetailContent({
  event,
  attendees,
  viewer,
  canChat = false,
}: {
  event: EventDetail;
  attendees: EventAttendeePreview[];
  viewer?: { id?: string; name?: string; avatar?: string | null };
  canChat?: boolean;
}) {
  const [shareOpen, setShareOpen] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const attendance = useEventAttendance({
    eventId: event.id,
    initialAttending: event.is_attending,
    initialCount: event.attendee_count,
  });

  const status = eventStatus(event.start_date, event.end_date);
  const ended = status.tone === "ended";
  const { author, href: organizerHref } = eventOrganizer(event);
  const duration = formatEventDuration(event.duration_minutes);
  const linkUrl = safeExternalUrl(event.link_url);
  const { place } = splitEventLocation(event.location_name);
  const dateTime = [
    formatEventDateLabel(event.start_date, event.end_date),
    formatEventTimeLabel(event.start_date, event.end_date),
    duration,
  ]
    .filter(Boolean)
    .join(" · ");
  const description = event.description ?? "";
  const isLongDescription = description.length > LONG_DESCRIPTION_LENGTH;
  const previewImages = [
    ...(event.thumbnail_url
      ? [
          {
            id: event.thumbnail_media_id ?? "event-cover",
            url: event.thumbnail_url,
          },
        ]
      : []),
    ...event.images.flatMap((image) =>
      image.image_url ? [{ id: image.media_id, url: image.image_url }] : []
    ),
  ].filter(
    (image, index, images) =>
      images.findIndex((candidate) => candidate.url === image.url) === index
  );
  const shareUrl =
    typeof window === "undefined"
      ? ""
      : `${window.location.origin}/events/${event.id}`;

  const statusLabel =
    status.tone === "upcoming" ? null : (
      <EventStatusLabel label={status.label} tone={status.tone} />
    );

  function renderMetadata(onDark: boolean) {
    return (
      <div className="flex flex-col gap-3">
        <EventFacts
          categoryName={event.category_name}
          place={place}
          dateTime={dateTime}
          organizerName={author.name}
          organizerHref={organizerHref}
        />
        {attendance.attendeeCount > 0 && (
          <EventAttendeesSummary
            viewer={viewer}
            attendees={attendees}
            count={attendance.attendeeCount}
            isAttending={attendance.isAttending}
            ended={ended}
            onDark={onDark}
          />
        )}
      </div>
    );
  }

  return (
    <>
      <main className="pb-6 lg:pb-12">
        {/* Desktop only: on mobile the aside opens the page with a plain photo and white metadata. */}
        <header className="relative hidden overflow-hidden bg-linear-to-br from-brand-deep to-primary text-on-dark lg:block">
          {event.thumbnail_url && (
            <Image
              src={event.thumbnail_url}
              alt=""
              fill
              aria-hidden="true"
              sizes="100vw"
              className="scale-110 object-cover blur-2xl"
            />
          )}
          <div className="absolute inset-0 bg-media-backdrop/60" />
          {/* The right padding keeps the text clear of the aside's photo, which overlaps this band. */}
          <PageMargin className="relative">
            <div className="flex min-h-72 flex-col justify-center gap-4 py-8 pr-[352px]">
              {statusLabel}
              <h1 className="break-words font-stack-sans-headline text-3xl font-medium leading-tight">
                {event.title}
              </h1>
              {renderMetadata(true)}
            </div>
          </PageMargin>
        </header>

        <PageMargin noMobilePadding>
          <div className="grid items-start gap-1.5 lg:grid-cols-[minmax(0,768px)_320px] lg:gap-6">
            {/* The negative margin equals the 16:9 photo's height, so it ends level with the band. */}
            <aside className="relative z-10 flex min-w-0 flex-col overflow-hidden border border-x-0 border-border bg-surface lg:sticky lg:top-6 lg:col-start-2 lg:row-start-1 lg:-mt-[180px] lg:rounded-2xl lg:border-x">
              <div className="relative order-1 aspect-[16/9] bg-linear-to-br from-brand-deep to-primary lg:order-none">
                {event.thumbnail_url ? (
                  <Image
                    src={event.thumbnail_url}
                    alt={`Thumbnail ${event.title}`}
                    fill
                    priority
                    sizes="(min-width: 1024px) 320px, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-on-dark/70">
                    <IconPhotoOff className="size-10" stroke={1.6} />
                  </div>
                )}
                {previewImages.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPreviewId(previewImages[0].id)}
                    className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-lg bg-media-backdrop/75 px-3 py-2 text-xs font-medium text-on-dark backdrop-blur-sm transition hover:bg-media-backdrop/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label={`Lihat semua foto event (${previewImages.length})`}
                  >
                    <IconPhoto className="size-4" stroke={2} />
                    Lihat semua foto ({previewImages.length})
                  </button>
                )}
              </div>

              {/* Desktop keeps the CTA under the photo; on mobile it follows the metadata. */}
              <div className="order-3 flex flex-col gap-3 px-4 pb-4 lg:order-none lg:border-b lg:border-border lg:pt-4">
                <div className="flex gap-2">
                  <EventAttendanceButton
                    isAttending={attendance.isAttending}
                    saving={attendance.saving}
                    ended={ended}
                    onToggle={attendance.toggle}
                    className="min-w-0 flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setShareOpen(true)}
                    aria-label="Bagikan event"
                    title="Bagikan"
                  >
                    <IconShare2 className="size-4.5" stroke={2} />
                  </Button>
                </div>

                {linkUrl && (
                  <EventLinkButton
                    href={linkUrl}
                    newTab
                    variant="outline"
                    title="Tautan dari penyelenggara, di luar HMI Connect"
                    className="w-full"
                  >
                    Buka tautan event
                    <IconExternalLink className="size-4" stroke={2} />
                  </EventLinkButton>
                )}
              </div>

              {/* The page's only metadata on mobile; from lg it repeats the header once that scrolls away. */}
              <div className="order-2 flex flex-col items-start gap-3 p-4 text-heading lg:order-none">
                {statusLabel && <div className="lg:hidden">{statusLabel}</div>}
                <h1 className="break-words font-stack-sans-headline text-2xl font-medium leading-tight lg:hidden">
                  {event.title}
                </h1>
                <p className="hidden break-words font-stack-sans-headline text-lg font-medium leading-snug lg:block">
                  {event.title}
                </p>
                {renderMetadata(false)}
              </div>
            </aside>

            <div className="flex min-w-0 flex-col gap-1.5 lg:col-start-1 lg:row-start-1 lg:gap-4 lg:pt-6">
              {description && (
                <section className={CARD_CLASS}>
                  <h2 className={CARD_TITLE_CLASS}>Deskripsi</h2>
                  <p
                    className={`mt-3 whitespace-pre-line break-words text-[15px] leading-7 text-content-foreground ${isLongDescription && !descriptionExpanded ? "line-clamp-6" : ""}`}
                  >
                    {description}
                  </p>
                  {isLongDescription && (
                    <Button
                      variant="ghost"
                      onClick={() =>
                        setDescriptionExpanded((current) => !current)
                      }
                      aria-expanded={descriptionExpanded}
                      className="mt-1"
                    >
                      {descriptionExpanded
                        ? "Tampilkan lebih sedikit"
                        : "Lihat selengkapnya"}
                    </Button>
                  )}
                </section>
              )}

              <EventLocationCard
                locationName={event.location_name}
                locationUrl={event.location_url}
              />

              <section className={CARD_CLASS}>
                <h2 className={CARD_TITLE_CLASS}>Penyelenggara</h2>
                <div className="mt-3 flex items-center gap-3">
                  <FeedAuthorAvatar author={author} size={48} />
                  <p className="min-w-0 flex-1 truncate font-medium text-heading">
                    {author.name}
                  </p>
                  {organizerHref && (
                    <EventLinkButton href={organizerHref} variant="soft">
                      Lihat profil
                    </EventLinkButton>
                  )}
                </div>
                {event.contacts.length > 0 && (
                  <div className="mt-4 border-t border-border pt-4">
                    <h3 className={CARD_TITLE_CLASS}>Narahubung</h3>
                    <div className="mt-3 flex flex-col gap-3">
                      {event.contacts.map((contact) => (
                        <div
                          key={contact.id}
                          className="flex flex-wrap items-center gap-3"
                        >
                          <Avatar
                            src={contact.user_id ? contact.avatar : undefined}
                            name={contact.name}
                            size={40}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-heading">
                              {contact.name}
                            </p>
                            {contact.phone_number && (
                              <p className="truncate text-sm text-muted-foreground">
                                {contact.phone_number}
                              </p>
                            )}
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            {canChat &&
                              contact.user_id &&
                              contact.user_id !== viewer?.id && (
                                <SendMessageButton
                                  userId={contact.user_id}
                                  fullName={contact.name}
                                  avatar={contact.avatar}
                                />
                              )}
                            {contact.phone_number && (
                              <EventLinkButton
                                href={whatsappHref(contact.phone_number)}
                                newTab
                                variant="soft"
                                size="default"
                                aria-label={`Hubungi ${contact.name} lewat WhatsApp`}
                                title="WhatsApp"
                              >
                                <IconBrandWhatsapp
                                  className="size-5"
                                  stroke={2}
                                />
                              </EventLinkButton>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </PageMargin>
      </main>

      <ImagePreviewOverlay
        images={previewImages}
        activeId={previewId}
        onActiveChange={setPreviewId}
        onClose={() => setPreviewId(null)}
        downloadName={`event-${event.id}`}
      />
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
