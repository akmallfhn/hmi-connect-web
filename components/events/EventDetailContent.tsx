"use client";

import {
  IconBuildingCommunity,
  IconCalendarEvent,
  IconExternalLink,
  IconMail,
  IconMapPin,
  IconPencil,
  IconPhotoOff,
  IconShare2,
  IconTrash,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { EventAttendeePreview, EventDetail } from "@/apis/events";
import { useEventAttendance } from "@/hooks/useEventAttendance";
import { deleteEvent } from "@/lib/actions";
import { socialIconUrl } from "@/lib/constants";
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
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import Avatar from "../common/Avatar";
import PageMargin from "../common/PageMargin";
import FeedAuthorAvatar from "../feeds/FeedAuthorAvatar";
import AlertConfirmation from "../modals/AlertConfirmation";
import ImagePreviewOverlay from "../modals/ImagePreviewOverlay";
import ShareModal from "../modals/ShareModal";
import EventAttendanceButton from "./EventAttendanceButton";
import EventAttendeesSummary from "./EventAttendeesSummary";
import EventLinkButton from "./EventLinkButton";
import EventLocationCard from "./EventLocationCard";
import EventStatusLabel from "./EventStatusLabel";

const CARD_CLASS = "rounded-2xl border border-border bg-surface p-5";
const CARD_TITLE_CLASS = "font-stack-sans-headline text-lg font-medium text-heading";
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
  place,
  dateTime,
  organizerName,
  organizerHref,
}: {
  place: string;
  dateTime: string;
  organizerName: string;
  organizerHref: string | null;
}) {
  return (
    <ul className="flex flex-col gap-2.5">
      <FactRow icon={<IconMapPin className="size-5" stroke={2} />}>
        {place || "Lokasi menyusul"}
      </FactRow>
      <FactRow icon={<IconCalendarEvent className="size-5" stroke={2} />}>{dateTime}</FactRow>
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
  manage = false,
  editHref,
  afterDeleteHref = "/events",
}: {
  event: EventDetail;
  attendees: EventAttendeePreview[];
  viewer?: { id?: string; name?: string; avatar?: string | null };
  manage?: boolean;
  editHref?: string;
  afterDeleteHref?: string;
}) {
  const router = useRouter();
  const [shareOpen, setShareOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
  const registrationUrl = safeExternalUrl(event.registration_url);
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
  const previewImages = event.images.flatMap((image) =>
    image.image_url ? [{ id: image.media_id, url: image.image_url }] : [],
  );
  const shareUrl =
    typeof window === "undefined" ? "" : `${window.location.origin}/events/${event.id}`;

  async function handleDelete() {
    setDeleting(true);
    try {
      const result = await deleteEvent(event.id);
      if (!isSuccessStatus(result.status)) throw new Error(result.message);
      toast.success("Event berhasil dihapus.");
      router.replace(afterDeleteHref);
      router.refresh();
    } catch {
      toast.error("Event belum berhasil dihapus. Coba lagi.");
      setDeleting(false);
    }
  }

  const statusLabel =
    status.tone === "upcoming" ? null : (
      <EventStatusLabel label={status.label} tone={status.tone} />
    );

  function renderMetadata(onDark: boolean) {
    return (
      <div className="flex flex-col gap-3">
        <EventFacts
          place={place}
          dateTime={dateTime}
          organizerName={author.name}
          organizerHref={organizerHref}
        />
        <EventAttendeesSummary
          viewer={viewer}
          attendees={attendees}
          count={attendance.attendeeCount}
          isAttending={attendance.isAttending}
          ended={ended}
          onDark={onDark}
        />
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
            <div className="flex min-h-72 flex-col justify-center gap-4 py-8 pr-[372px] xl:pr-[432px]">
              {statusLabel}
              <h1 className="break-words font-stack-sans-headline text-3xl font-medium leading-tight">
                {event.title}
              </h1>
              {renderMetadata(true)}
            </div>
          </PageMargin>
        </header>

        <PageMargin>
          <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_400px]">
            {/* The negative margin equals the 16:9 photo's height, so it ends level with the band. */}
            <aside className="relative z-10 -mx-4 flex min-w-0 flex-col overflow-hidden border-b border-border bg-surface lg:sticky lg:top-6 lg:col-start-2 lg:row-start-1 lg:mx-0 lg:-mt-[191px] lg:rounded-2xl lg:border xl:-mt-[225px]">
              <div className="relative order-1 aspect-[16/9] bg-linear-to-br from-brand-deep to-primary lg:order-none">
                {event.thumbnail_url ? (
                  <Image
                    src={event.thumbnail_url}
                    alt={`Thumbnail ${event.title}`}
                    fill
                    priority
                    sizes="(min-width: 1280px) 400px, (min-width: 1024px) 340px, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-on-dark/70">
                    <IconPhotoOff className="size-10" stroke={1.6} />
                  </div>
                )}
              </div>

              {/* Desktop keeps the CTA under the photo; on mobile it follows the metadata. */}
              <div className="order-3 flex flex-col gap-3 px-4 pb-4 lg:order-none lg:border-b lg:border-border lg:pt-4">
                {!manage && (
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
                )}

                {!manage && registrationUrl && (
                  <EventLinkButton
                    href={registrationUrl}
                    newTab
                    variant="outline"
                    title="Formulir dari penyelenggara, di luar HMI Connect"
                    className="w-full"
                  >
                    Isi formulir pendaftaran
                    <IconExternalLink className="size-4" stroke={2} />
                  </EventLinkButton>
                )}

                {manage && (
                  <div className="grid grid-cols-2 gap-2">
                    {editHref && (
                      <EventLinkButton href={editHref} className="w-full">
                        <IconPencil className="size-4.5" stroke={2} />
                        Edit event
                      </EventLinkButton>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => setShareOpen(true)}
                      className="w-full"
                    >
                      <IconShare2 className="size-4.5" stroke={2} />
                      Bagikan
                    </Button>
                    <EventLinkButton
                      href={`/events/${event.id}`}
                      newTab
                      variant="outline"
                      className="w-full"
                    >
                      <IconExternalLink className="size-4.5" stroke={2} />
                      Lihat publik
                    </EventLinkButton>
                    <Button
                      variant="destructive"
                      onClick={() => setDeleteOpen(true)}
                      className="w-full"
                    >
                      <IconTrash className="size-4.5" stroke={2} />
                      Hapus
                    </Button>
                  </div>
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

            <div className="flex min-w-0 flex-col gap-4 lg:col-start-1 lg:row-start-1 lg:gap-6 lg:pt-6">
              {(description || manage) && (
                <section className={CARD_CLASS}>
                  <h2 className={CARD_TITLE_CLASS}>Deskripsi</h2>
                  <p
                    className={`mt-3 whitespace-pre-line break-words text-[15px] leading-7 text-content-foreground ${isLongDescription && !descriptionExpanded ? "line-clamp-6" : ""}`}
                  >
                    {description || "Belum ada deskripsi. Tambahkan lewat Edit event."}
                  </p>
                  {isLongDescription && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDescriptionExpanded((current) => !current)}
                      aria-expanded={descriptionExpanded}
                      className="mt-1"
                    >
                      {descriptionExpanded ? "Tampilkan lebih sedikit" : "Lihat selengkapnya"}
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
                  <p className="min-w-0 flex-1 truncate font-medium text-heading">{author.name}</p>
                  {organizerHref && (
                    <EventLinkButton href={organizerHref} variant="soft">
                      Lihat profil
                    </EventLinkButton>
                  )}
                </div>
              </section>

              {previewImages.length > 0 && (
                <section className={CARD_CLASS}>
                  <h2 className={CARD_TITLE_CLASS}>Galeri</h2>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {previewImages.map((image, index) => (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() => setPreviewId(image.id)}
                        aria-label={`Lihat foto ${index + 1}`}
                        className="relative aspect-square cursor-pointer overflow-hidden rounded-xl bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <Image
                          src={image.url}
                          alt=""
                          fill
                          loading="lazy"
                          sizes="(min-width: 1024px) 200px, 33vw"
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {event.contacts.length > 0 && (
                <section className={CARD_CLASS}>
                  <h2 className={CARD_TITLE_CLASS}>Narahubung</h2>
                  <div className="mt-3 flex flex-col gap-3">
                    {event.contacts.map((contact) => (
                      <div key={contact.id} className="flex items-center gap-3">
                        <Avatar name={contact.name} size={40} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-heading">
                            {contact.name}
                          </p>
                          <p className="truncate text-sm text-muted-foreground">
                            {contact.phone_number || contact.email}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {contact.phone_number && (
                            <EventLinkButton
                              href={whatsappHref(contact.phone_number)}
                              newTab
                              variant="ghost"
                              size="icon"
                              aria-label={`Hubungi ${contact.name} lewat WhatsApp`}
                              title="WhatsApp"
                            >
                              <Image
                                src={socialIconUrl("whatsapp")}
                                alt=""
                                width={28}
                                height={28}
                                className="size-7 rounded-full object-cover ring-1 ring-inset ring-black/5"
                              />
                            </EventLinkButton>
                          )}
                          {contact.email && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                window.location.href = `mailto:${contact.email}`;
                              }}
                              aria-label={`Kirim email ke ${contact.name}`}
                              title="Email"
                            >
                              <IconMail className="size-5" stroke={2} />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
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
      <AlertConfirmation
        open={deleteOpen}
        onClose={() => {
          if (!deleting) setDeleteOpen(false);
        }}
        onConfirm={handleDelete}
        title="Hapus event ini?"
        message="Event akan hilang dari daftar dan tidak bisa dibuka lagi, termasuk lewat tautan yang sudah dibagikan."
        confirmLabel="Hapus event"
        loading={deleting}
      />
    </>
  );
}
