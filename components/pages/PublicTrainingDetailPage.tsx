"use client";

import {
  IconBellCheck,
  IconBellPlus,
  IconBrandWhatsapp,
  IconCalendarStar,
  IconShare,
} from "@tabler/icons-react";
import type { TrainingDetail } from "@/apis/trainings";
import { useTrainingReminder } from "@/hooks/useTrainingReminder";
import { deleteTraining } from "@/lib/actions";
import { formatOrganizerName } from "@/lib/organizer";
import { formatDateRangeWithWeekday } from "@/lib/time-manipulation";
import { ExternalLink, ImageOff, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import Dropdown from "../common/Dropdown";
import PageMargin from "../common/PageMargin";
import AlertConfirmation from "../modals/AlertConfirmation";
import ShareModal from "../modals/ShareModal";
import LogoHmi from "../svg/LogoHmi";
import TrainingPageShell, {
  type TrainingViewer,
} from "../trainings/TrainingPageShell";
import RepostTrainingToFeedButton from "../trainings/RepostTrainingToFeedButton";

interface PublicTrainingDetailPageProps {
  viewer: TrainingViewer;
  training: TrainingDetail;
}

const EVENT_MENU_ITEM_CLASS =
  "flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-heading transition hover:bg-surface-muted";

function buildWhatsAppUrl(phoneNumber: string) {
  const digits = phoneNumber.replace(/\D/g, "");
  const normalized = digits.startsWith("62")
    ? digits
    : `62${digits.replace(/^0+/, "")}`;
  return `https://wa.me/${normalized}`;
}

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function ContactPersonSection({
  training,
  className,
  variant = "card",
}: {
  training: TrainingDetail;
  className?: string;
  variant?: "card" | "plain";
}) {
  if (!training.contact_person_name) return null;

  return (
    <section className={className}>
      <h2 className="font-stack-sans-headline text-sm font-medium text-heading xl:text-[15px]">
        Contact Person
      </h2>
      <div
        className={
          variant === "plain"
            ? "mt-3 flex items-center gap-3"
            : "mt-3 flex items-center gap-3 rounded-lg border border-border bg-surface p-3"
        }
      >
        <div className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-xs font-bold text-on-primary xl:text-[13px]">
          {training.contact_person_avatar ? (
            <Image
              src={training.contact_person_avatar}
              alt={training.contact_person_name}
              fill
              sizes="36px"
              className="object-cover"
            />
          ) : (
            getInitials(training.contact_person_name)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-heading">
            {training.contact_person_name}
          </p>
          {training.contact_person_phone_number && (
            <p className="truncate text-sm text-subtle-foreground xl:text-[15px]">
              {training.contact_person_phone_number}
            </p>
          )}
        </div>
        {training.contact_person_phone_number && (
          <a
            href={buildWhatsAppUrl(training.contact_person_phone_number)}
            target="_blank"
            rel="noreferrer"
            aria-label={`Hubungi ${training.contact_person_name} via WhatsApp`}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary-action transition hover:bg-primary-hover"
          >
            <IconBrandWhatsapp className="size-5" stroke={2} />
          </a>
        )}
      </div>
    </section>
  );
}

export default function PublicTrainingDetailPage({
  viewer,
  training,
}: PublicTrainingDetailPageProps) {
  const organizerName = training.organizer_name ?? "Penyelenggara HMI";
  const [shareOpen, setShareOpen] = useState(false);
  const shareUrl =
    typeof window === "undefined"
      ? ""
      : `${window.location.origin}/trainings/${training.id}`;
  const router = useRouter();
  const {
    active: reminded,
    saving: savingReminder,
    toggle: toggleReminder,
  } = useTrainingReminder({
    trainingId: training.id,
    initialActive: training.is_reminder_active,
    isSignedIn: Boolean(viewer.userId),
  });
  const canEditTraining =
    Boolean(viewer.userId) && training.contact_person_id === viewer.userId;
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDeleteTraining() {
    if (!canEditTraining) return;

    setDeleting(true);
    try {
      const result = await deleteTraining(training.id);
      if (!isSuccessStatus(result.status)) throw new Error(result.message);

      toast.success("Event berhasil dihapus.");
      router.replace("/trainings");
    } catch {
      toast.error("Gagal menghapus event. Coba lagi.");
      setDeleting(false);
    }
  }

  return (
    <TrainingPageShell
      viewer={viewer}
      mobileBackTitle={training.name}
      hideBottomNav
    >
      <main>
        {/* Mobile-only: hero image, then title, then detail sections stacked below. */}
        <div className="bg-surface lg:hidden">
          <div className="relative overflow-hidden">
            {/* Blur band is half the poster's own height (275px at max-w-220px * 4:5). */}
            <div className="relative h-[138px] w-full overflow-hidden bg-surface-muted">
              {training.image_url && (
                <Image
                  src={training.image_url}
                  alt=""
                  fill
                  priority
                  aria-hidden="true"
                  sizes="100vw"
                  className="scale-110 object-cover opacity-50 blur-sm"
                />
              )}
            </div>
            <div className="relative -mt-20 mb-2">
              <div className="relative mx-auto aspect-[4/5] w-full max-w-[220px] overflow-hidden rounded-lg bg-surface-muted">
                {training.image_url ? (
                  <Image
                    src={training.image_url}
                    alt={`Poster ${training.name}`}
                    fill
                    priority
                    sizes="220px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex size-full flex-col items-center justify-center gap-3 text-subtle-foreground">
                    <ImageOff className="size-11" />
                    <span className="text-sm font-medium">
                      Poster belum tersedia
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-surface px-4 pb-5 pt-5">
            <div className="flex flex-col items-center text-center">
              <h1 className="font-stack-sans-headline text-2xl font-medium leading-tight text-heading">
                {training.name}
              </h1>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2">
              <Button
                variant={reminded ? "outline" : "secondary"}
                size="default"
                onClick={toggleReminder}
                disabled={savingReminder}
                aria-pressed={reminded}
              >
                {reminded ? (
                  <IconBellCheck className="size-5" stroke={2} />
                ) : (
                  <IconBellPlus className="size-5" stroke={2} />
                )}
                {reminded ? "Reminded" : "Remind me!"}
              </Button>
              <RepostTrainingToFeedButton
                training={training}
                isSignedIn={Boolean(viewer.userId)}
                iconOnly
                variant="outline"
                size="icon"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShareOpen(true)}
                aria-label={`Bagikan ${training.name}`}
              >
                <IconShare className="size-5" stroke={2} />
              </Button>
              {canEditTraining && (
                <Dropdown
                  align="right"
                  panelClassName="w-48 rounded-xl"
                  trigger={({ open, toggle }) => (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={toggle}
                      aria-label={`Opsi ${training.name}`}
                      aria-expanded={open}
                    >
                      <MoreHorizontal className="size-5" />
                    </Button>
                  )}
                >
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => router.push(`/trainings/${training.id}/edit`)}
                      className={EVENT_MENU_ITEM_CLASS}
                    >
                      <Pencil className="size-4 text-muted-foreground" />
                      Edit event
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteOpen(true)}
                      className={`${EVENT_MENU_ITEM_CLASS} text-destructive-foreground hover:bg-destructive-soft`}
                    >
                      <Trash2 className="size-4" />
                      Hapus event
                    </button>
                  </div>
                </Dropdown>
              )}
            </div>
            <p className="mt-3 flex items-center justify-center gap-2 text-center text-base text-heading">
              <IconCalendarStar className="size-5 shrink-0" stroke={2} />
              {formatDateRangeWithWeekday(
                training.start_date,
                training.end_date,
              )}
            </p>
          </div>

          <div className="flex flex-col gap-1.5 bg-surface pb-6">
            <section className="border border-x-0 border-border bg-surface p-5">
              <h2 className="font-stack-sans-headline text-sm font-medium text-heading">
                Deskripsi
              </h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                {training.description || "Deskripsi training belum tersedia."}
              </p>
            </section>

            <section className="border border-x-0 border-border bg-surface p-5">
              <h2 className="font-stack-sans-headline text-sm font-medium text-heading">
                Penyelenggara
              </h2>
              <div className="mt-3 flex items-center gap-2.5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-primary-soft">
                  <LogoHmi className="h-7 w-auto" />
                </div>
                <p className="min-w-0 truncate text-sm text-heading">
                  {formatOrganizerName(training)}
                </p>
              </div>
            </section>

            <ContactPersonSection
              training={training}
              className="border border-x-0 border-border bg-surface p-5"
              variant="plain"
            />

            <section className="border border-x-0 border-border bg-surface p-5">
              <h2 className="font-stack-sans-headline text-sm font-medium text-heading">
                Lokasi
              </h2>
              <div className="mt-3 min-w-0">
                <p className="text-sm text-muted-foreground">
                  {training.location_name ?? "Lokasi training belum tersedia."}
                </p>
                {training.location_url && (
                  <a
                    href={training.location_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-primary-foreground hover:underline"
                  >
                    Buka lokasi
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Desktop-only: fixed blur band with a sticky poster column. */}
        <div className="hidden min-h-[calc(100vh-4rem)] bg-surface lg:block">
          <div className="relative h-[220px] overflow-hidden bg-surface-muted xl:h-[250px]">
            {training.image_url && (
              <Image
                src={training.image_url}
                alt=""
                fill
                priority
                aria-hidden="true"
                sizes="100vw"
                className="scale-110 object-cover opacity-50 blur-lg"
              />
            )}
          </div>

          <PageMargin className="relative -mt-40 pb-16 xl:-mt-44">
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)] xl:gap-8">
              <aside className="sticky top-6 min-w-0 self-start">
                <div className="relative mx-auto aspect-[4/5] w-full max-w-[340px] overflow-hidden rounded-xl border border-border bg-surface-muted shadow-[0_18px_50px_var(--shadow-card)]">
                  {training.image_url ? (
                    <Image
                      src={training.image_url}
                      alt={`Poster ${training.name}`}
                      fill
                      priority
                      sizes="340px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex size-full flex-col items-center justify-center gap-3 text-subtle-foreground">
                      <ImageOff className="size-11" />
                      <span className="text-sm font-medium xl:text-[15px]">
                        Poster belum tersedia
                      </span>
                    </div>
                  )}
                </div>

                <div className="mx-auto mt-4 flex w-full max-w-[340px] items-center gap-2">
                  <Button
                    variant={reminded ? "outline" : "secondary"}
                    size="default"
                    onClick={toggleReminder}
                    disabled={savingReminder}
                    aria-pressed={reminded}
                    className="h-10 flex-1"
                  >
                    {reminded ? (
                      <IconBellCheck className="size-5" stroke={2} />
                    ) : (
                      <IconBellPlus className="size-5" stroke={2} />
                    )}
                    {reminded ? "Reminded" : "Remind me!"}
                  </Button>
                  <RepostTrainingToFeedButton
                    training={training}
                    isSignedIn={Boolean(viewer.userId)}
                    iconOnly
                    variant="outline"
                    size="icon"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShareOpen(true)}
                    aria-label={`Bagikan ${training.name}`}
                  >
                    <IconShare className="size-5" stroke={2} />
                  </Button>
                  {canEditTraining && (
                    <Dropdown
                      align="right"
                      panelClassName="w-48 rounded-xl"
                      trigger={({ open, toggle }) => (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={toggle}
                          aria-label={`Opsi ${training.name}`}
                          aria-expanded={open}
                        >
                          <MoreHorizontal className="size-5" />
                        </Button>
                      )}
                    >
                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/trainings/${training.id}/edit`)
                          }
                          className={EVENT_MENU_ITEM_CLASS}
                        >
                          <Pencil className="size-4 text-muted-foreground" />
                          Edit event
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteOpen(true)}
                          className={`${EVENT_MENU_ITEM_CLASS} text-destructive-foreground hover:bg-destructive-soft`}
                        >
                          <Trash2 className="size-4" />
                          Hapus event
                        </button>
                      </div>
                    </Dropdown>
                  )}
                </div>
              </aside>

              <article className="min-w-0 self-start rounded-xl border border-border bg-surface p-6 xl:p-8">
                <h1 className="font-stack-sans-headline text-3xl font-medium leading-tight text-heading xl:text-[32px]">
                  {training.name}
                </h1>

                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground xl:text-[15px]">
                  <p className="flex items-center gap-2">
                    <IconCalendarStar className="size-4 shrink-0" stroke={2} />
                    {formatDateRangeWithWeekday(
                      training.start_date,
                      training.end_date,
                    )}
                  </p>
                </div>

                <section className="mt-8 border-t border-border pt-6">
                  <h2 className="font-stack-sans-headline text-sm font-medium text-heading xl:text-[15px]">
                    Penyelenggara
                  </h2>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-primary-soft">
                      <LogoHmi className="h-8 w-auto" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] text-heading">
                        {organizerName}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="mt-8 border-t border-border pt-6">
                  <h2 className="font-stack-sans-headline text-sm font-medium text-heading xl:text-[15px]">
                    Deskripsi
                  </h2>
                  <p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-foreground">
                    {training.description ||
                      "Deskripsi training belum tersedia."}
                  </p>
                </section>

                <ContactPersonSection
                  training={training}
                  className="mt-8 border-t border-border pt-6"
                />

                <section className="mt-8 border-t border-border pt-6">
                  <h2 className="font-stack-sans-headline text-sm font-medium text-heading xl:text-[15px]">
                    Lokasi
                  </h2>
                  <div className="mt-4 min-w-0">
                    <p className="text-[15px] leading-7 text-foreground">
                      {training.location_name ?? "Lokasi belum ditentukan"}
                    </p>
                    {training.location_url && (
                      <a
                        href={training.location_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-primary-foreground hover:underline xl:text-[15px]"
                      >
                        Buka lokasi
                        <ExternalLink className="size-3.5" />
                      </a>
                    )}
                  </div>
                </section>
              </article>
            </div>
          </PageMargin>
        </div>
      </main>
      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        url={shareUrl}
        text={`Lihat ${training.name}, agenda ${training.level} dari HMI Connect`}
      />
      <AlertConfirmation
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteTraining}
        title="Hapus event?"
        message={`Event “${training.name}” akan dihapus dan tidak dapat dipulihkan.`}
        confirmLabel="Hapus event"
        loading={deleting}
      />
    </TrainingPageShell>
  );
}
