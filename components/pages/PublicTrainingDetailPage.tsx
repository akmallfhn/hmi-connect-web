"use client";

import {
  IconBellCheck, IconBellPlus, IconBrandWhatsapp, IconCalendarEvent,
  IconExternalLink, IconFileTypePdf, IconMapPin, IconPhoto, IconPhotoOff, IconSchool, IconShare2,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { TrainingDetail } from "@/apis/trainings";
import { useTrainingReminder } from "@/hooks/useTrainingReminder";
import { safeExternalUrl } from "@/lib/event-ui";
import { entityProfileHref } from "@/lib/feed-author";
import { formatOrganizerName } from "@/lib/organizer";
import { openFeedComposerWithAttachment, trainingComposeIntent } from "@/lib/feed-compose-intent";
import { formatDateRangeWithWeekday } from "@/lib/time-manipulation";
import Button from "../buttons/Button";
import Avatar from "../common/Avatar";
import PageMargin from "../common/PageMargin";
import EventLinkButton from "../events/EventLinkButton";
import EventLocationCard from "../events/EventLocationCard";
import FeedAuthorAvatar from "../feeds/FeedAuthorAvatar";
import ImagePreviewOverlay from "../modals/ImagePreviewOverlay";
import ShareModal from "../modals/ShareModal";
import SendMessageButton from "../profile/SendMessageButton";
import SpecialBodyLogoFallback from "../svg/SpecialBodyLogoFallback";
import TrainingPageShell, { type TrainingViewer } from "../trainings/TrainingPageShell";
import { TrainingRegistrationLabel } from "../trainings/TrainingLabels";

const CARD_CLASS = "border border-x-0 border-border bg-surface p-5 lg:rounded-2xl lg:border-x";
const TITLE_CLASS = "font-stack-sans-headline text-sm font-medium text-heading xl:text-[15px]";

function whatsappHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits.startsWith("62") ? digits : `62${digits.replace(/^0+/, "")}`}`;
}

function TrainingFacts({ training, organizerName, organizerHref }: {
  training: TrainingDetail;
  organizerName: string;
  organizerHref: string | null;
}) {
  return <ul className="flex flex-col gap-2.5">
    <li className="flex items-start gap-3 text-[15px] leading-6">
      <IconCalendarEvent className="mt-0.5 size-5 shrink-0" stroke={2} />
      <span className="min-w-0 break-words">{formatDateRangeWithWeekday(training.start_date, training.end_date)}</span>
    </li>
    <li className="flex items-start gap-3 text-[15px] leading-6">
      <IconMapPin className="mt-0.5 size-5 shrink-0" stroke={2} />
      <span className="min-w-0 break-words">{training.location_name || "Lokasi menyusul"}</span>
    </li>
    <li className="flex items-start gap-3 text-[15px] leading-6">
      <IconSchool className="mt-0.5 size-5 shrink-0" stroke={2} />
      <span className="min-w-0 break-words">{organizerHref ? <Link href={organizerHref} className="hover:underline">{organizerName}</Link> : organizerName}</span>
    </li>
  </ul>;
}

export default function PublicTrainingDetailPage({ viewer, training, canChat = false }: {
  viewer: TrainingViewer;
  training: TrainingDetail;
  canChat?: boolean;
}) {
  const router = useRouter();
  const [shareOpen, setShareOpen] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const reminder = useTrainingReminder({
    trainingId: training.id,
    initialActive: training.is_reminder_active,
    isSignedIn: Boolean(viewer.userId),
  });
  const organizerName = formatOrganizerName(training);
  const organizerHref = training.organizer_type === "special_body" ? null
    : entityProfileHref(training.organizer_type, training.organizer_id);
  const organizerAuthor = { name: organizerName, avatar: training.organizer_image_url ?? undefined,
    href: organizerHref ?? "#", isEntity: true };
  const fallbackLogo = training.organizer_type === "special_body"
    ? <SpecialBodyLogoFallback type={training.level === "SC" ? "bpl" : "kohati"} className="h-7 w-auto max-h-8 max-w-8" />
    : undefined;
  const proposalUrl = safeExternalUrl(training.proposal_url);
  const cover = training.images?.find((image) => image.role === "cover");
  const previewImages = [
    ...(training.image_url ? [{ id: cover?.id ?? "training-cover", url: training.image_url }] : []),
    ...(training.images ?? []).filter((image) => image.role === "gallery" && Boolean(image.image_url))
      .map((image) => ({ id: image.id, url: image.image_url! })),
  ].filter((image, index, images) => images.findIndex((candidate) => candidate.url === image.url) === index);
  const galleryImages = previewImages.filter((image) => image.id !== (cover?.id ?? "training-cover"));
  const shareUrl = typeof window === "undefined" ? "" : `${window.location.origin}/trainings/${training.id}`;
  const contactName = training.contact_person_name;
  const contacts = training.contacts?.length
    ? training.contacts.map((contact) => ({
        id: contact.id,
        userId: contact.user_id,
        name: contact.name ?? "Narahubung",
        phone: contact.phone_number,
        avatar: contact.avatar,
      }))
    : contactName ? [{ id: "legacy-contact", userId: undefined, name: contactName, phone: training.contact_person_phone_number, avatar: training.contact_person_avatar }] : [];

  return (
    <TrainingPageShell viewer={viewer} mobileBackTitle="Detail Training" hideBottomNav>
      <main className="pb-6 lg:pb-12">
        <header className="relative hidden overflow-hidden bg-linear-to-br from-brand-deep to-primary text-on-dark lg:block">
          {training.image_url && (
            <Image src={training.image_url} alt="" fill aria-hidden="true" sizes="100vw" className="scale-110 object-cover blur-2xl" />
          )}
          <div className="absolute inset-0 bg-media-backdrop/60" />
          <PageMargin className="relative">
            <div className="flex min-h-72 flex-col justify-center gap-4 py-8 pr-[352px]">
              <h1 className="break-words font-stack-sans-headline text-3xl font-medium leading-tight">{training.name}</h1>
              <TrainingFacts training={training} organizerName={organizerName} organizerHref={organizerHref} />
            </div>
          </PageMargin>
        </header>

        <PageMargin noMobilePadding>
          <div className="grid items-start gap-1.5 lg:grid-cols-[minmax(0,768px)_320px] lg:gap-6">
            <aside className="relative z-10 flex min-w-0 flex-col overflow-hidden border border-x-0 border-border bg-surface lg:sticky lg:top-6 lg:col-start-2 lg:row-start-1 lg:-mt-[180px] lg:rounded-2xl lg:border-x">
              <div className="relative aspect-[4/5] bg-linear-to-br from-brand-deep to-primary">
                {training.image_url ? (
                  <Image src={training.image_url} alt={`Poster ${training.name}`} fill priority sizes="(min-width: 1024px) 320px, 100vw" className="object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center text-on-dark/70"><IconPhotoOff className="size-10" stroke={1.6} /></div>
                )}
                {previewImages.length > 0 && <button type="button" onClick={() => setPreviewId(previewImages[0].id)}
                  className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-lg bg-media-backdrop/75 px-3 py-2 text-xs font-medium text-on-dark backdrop-blur-sm transition hover:bg-media-backdrop/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label={`Lihat semua foto training (${previewImages.length})`}>
                  <IconPhoto className="size-4" stroke={2} /> Lihat semua foto ({previewImages.length})
                </button>}
              </div>
              <div className="order-2 flex flex-col items-start gap-3 p-4 text-heading lg:order-none">
                <h1 className="break-words font-stack-sans-headline text-2xl font-medium leading-tight lg:hidden">{training.name}</h1>
                <p className="hidden break-words font-stack-sans-headline text-lg font-medium leading-snug lg:block">{training.name}</p>
                <div className="text-foreground"><TrainingFacts training={training} organizerName={organizerName} organizerHref={organizerHref} /></div>
                {typeof training.is_registration_open === "boolean" && (
                  <TrainingRegistrationLabel isOpen={training.is_registration_open} />
                )}
              </div>
              <div className="order-3 flex flex-col gap-3 px-4 pb-4 lg:order-none lg:border-t lg:border-border lg:pt-4">
                {training.is_registration_open && (
                  <Link href={`/trainings/${training.id}/register`} className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-on-primary-action transition hover:bg-primary-hover">Daftar training</Link>
                )}
                <div className="flex gap-2">
                  <Button variant={reminder.active ? "soft" : "outline"} onClick={reminder.toggle} disabled={reminder.saving} aria-pressed={reminder.active} className="min-w-0 flex-1">
                    {reminder.active ? <IconBellCheck className="size-4.5" stroke={2} /> : <IconBellPlus className="size-4.5" stroke={2} />}
                    {reminder.active ? "Pengingat aktif" : "Ingatkan saya"}
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setShareOpen(true)} aria-label="Bagikan training"><IconShare2 className="size-5" stroke={2} /></Button>
                </div>
              </div>
            </aside>

            <div className="flex min-w-0 flex-col gap-1.5 lg:col-start-1 lg:row-start-1 lg:gap-4 lg:pt-6">
              <section className={CARD_CLASS}>
                <h2 className={TITLE_CLASS}>Deskripsi</h2>
                <p className="mt-3 whitespace-pre-line break-words text-[15px] leading-7 text-content-foreground">{training.description || "Deskripsi training belum tersedia."}</p>
              </section>
              {proposalUrl && <section className={CARD_CLASS}>
                <h2 className={TITLE_CLASS}>Proposal training</h2>
                <a href={proposalUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-surface-muted">
                  <IconFileTypePdf className="size-5" stroke={2} /> Lihat proposal PDF <IconExternalLink className="size-4" stroke={2} />
                </a>
              </section>}
              {galleryImages.length > 0 && <section className={CARD_CLASS}>
                <h2 className={TITLE_CLASS}>Foto lainnya</h2>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {galleryImages.map((image, index) => <button key={image.id} type="button" onClick={() => setPreviewId(image.id)}
                    aria-label={`Lihat foto training ${index + 1}`} className="relative aspect-square overflow-hidden rounded-lg bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                    <Image src={image.url} alt={`Foto training ${index + 1}`} fill sizes="(min-width: 640px) 220px, 50vw" className="object-cover transition-transform hover:scale-105" />
                  </button>)}
                </div>
              </section>}
              <EventLocationCard locationName={training.location_name} locationUrl={training.location_url} subject="training" />
              <section className={CARD_CLASS}>
                <h2 className={TITLE_CLASS}>Penyelenggara</h2>
                <div className="mt-3 flex items-center gap-3">
                  <FeedAuthorAvatar author={organizerAuthor} size={48} fallbackLogo={fallbackLogo} />
                  <p className="min-w-0 flex-1 truncate text-[15px] font-medium text-heading">{organizerName}</p>
                  {organizerHref && <EventLinkButton href={organizerHref} variant="soft">Lihat profil</EventLinkButton>}
                </div>
                {contacts.length > 0 && (
                  <div className="mt-4 border-t border-border pt-4">
                    <h3 className={TITLE_CLASS}>Narahubung</h3>
                    {contacts.map((contact) => (
                    <div key={contact.id} className="mt-3 flex flex-wrap items-center gap-3">
                      <Avatar src={contact.userId ? contact.avatar : undefined} name={contact.name} size={40} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-semibold text-heading">{contact.name}</p>
                        {contact.phone && <p className="truncate text-sm text-muted-foreground">{contact.phone}</p>}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {canChat && contact.userId && contact.userId !== viewer.userId &&
                          <SendMessageButton userId={contact.userId} fullName={contact.name} avatar={contact.avatar} />}
                        {contact.phone && <EventLinkButton href={whatsappHref(contact.phone)} newTab variant="soft"
                          aria-label={`Hubungi ${contact.name} lewat WhatsApp`} title="WhatsApp">
                          <IconBrandWhatsapp className="size-5" stroke={2} />
                        </EventLinkButton>}
                      </div>
                    </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </PageMargin>
      </main>
      <ImagePreviewOverlay images={previewImages} activeId={previewId} onActiveChange={setPreviewId}
        onClose={() => setPreviewId(null)} downloadName={`training-${training.id}`} />
      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} title="Bagikan Training" url={shareUrl} text={`Lihat ${training.name}, agenda ${training.level} dari HMI Connect`}
        onShareToFeed={() => {
          const { key, draft } = trainingComposeIntent(training);
          openFeedComposerWithAttachment(key, draft, router.push, Boolean(viewer.userId));
        }} />
    </TrainingPageShell>
  );
}
