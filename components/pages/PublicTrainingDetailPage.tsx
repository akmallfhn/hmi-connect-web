"use client";

import { IconAlarm, IconBrandWhatsapp, IconShare3 } from "@tabler/icons-react";
import type { TrainingDetail } from "@/apis/trainings";
import { formatOrganizerName } from "@/lib/organizer";
import { formatDateRange } from "@/lib/time-manipulation";
import { Calendar, CalendarDays, ExternalLink, ImageOff } from "lucide-react";
import Image from "next/image";
import { useCallback, useState, useSyncExternalStore } from "react";
import Button from "../buttons/Button";
import PageMargin from "../common/PageMargin";
import LogoHmi from "../svg/LogoHmi";
import TrainingPageShell, {
  type TrainingViewer,
} from "../trainings/TrainingPageShell";

interface PublicTrainingDetailPageProps {
  viewer: TrainingViewer;
  training: TrainingDetail;
}

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
      <h2 className="font-stack-sans-headline text-sm font-medium text-[#172033] xl:text-[15px]">
        Contact Person
      </h2>
      <div
        className={
          variant === "plain"
            ? "mt-3 flex items-center gap-3"
            : "mt-3 flex items-center gap-3 rounded-lg border border-[#e6e9ef] bg-white p-3"
        }
      >
        <div className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-xs font-bold text-white xl:text-[13px]">
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
          <p className="truncate font-bold text-[#172033]">
            {training.contact_person_name}
          </p>
          {training.contact_person_phone_number && (
            <p className="truncate text-sm text-[#7b8190] xl:text-[15px]">
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
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-white transition hover:bg-[#128488]"
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
  const [shareFeedback, setShareFeedback] = useState("");
  const reminderKey = `hmi-connect:training-reminder:${training.id}`;
  const subscribeToReminder = useCallback((callback: () => void) => {
    window.addEventListener("storage", callback);
    window.addEventListener("hmi-training-reminder", callback);
    return () => {
      window.removeEventListener("storage", callback);
      window.removeEventListener("hmi-training-reminder", callback);
    };
  }, []);
  const getReminderSnapshot = useCallback(
    () => window.localStorage.getItem(reminderKey) === "saved",
    [reminderKey]
  );
  const reminded = useSyncExternalStore(
    subscribeToReminder,
    getReminderSnapshot,
    () => false
  );

  function toggleReminder() {
    if (reminded) window.localStorage.removeItem(reminderKey);
    else window.localStorage.setItem(reminderKey, "saved");
    window.dispatchEvent(new Event("hmi-training-reminder"));
  }

  async function shareTraining() {
    const url = `${window.location.origin}/trainings/${training.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: training.name,
          text: `Lihat ${training.name}, agenda ${training.level} dari HMI.`,
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareFeedback("Tautan disalin");
    } catch {
      setShareFeedback("Belum bisa membagikan training");
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
        <div className="bg-white lg:hidden">
          <div className="relative overflow-hidden">
            {/* Blur band is half the poster's own height (275px at max-w-220px * 4:5). */}
            <div className="relative h-[138px] w-full overflow-hidden bg-[#dce7e8]">
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
              <div className="relative mx-auto aspect-[4/5] w-full max-w-[220px] overflow-hidden rounded-lg bg-[#dce7e8]">
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
                  <div className="flex size-full flex-col items-center justify-center gap-3 text-[#7b8190]">
                    <ImageOff className="size-11" />
                    <span className="text-sm font-medium">
                      Poster belum tersedia
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white px-4 pb-5 pt-5">
            <div className="flex flex-col items-center text-center">
              <h1 className="font-stack-sans-headline text-2xl font-medium leading-tight text-[#172033]">
                {training.name}
              </h1>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2">
              <Button
                variant={reminded ? "soft" : "primary"}
                size="default"
                onClick={toggleReminder}
                aria-pressed={reminded}
              >
                <IconAlarm className="size-5" stroke={2} />
                {reminded ? "Diingatkan" : "Ingatkan saya"}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => void shareTraining()}
                aria-label={`Bagikan ${training.name}`}
              >
                <IconShare3 className="size-5" stroke={2} />
              </Button>
            </div>
            <p
              aria-live="polite"
              className="mt-2 text-center text-xs font-medium text-primary"
            >
              {shareFeedback}
            </p>

            <p className="mt-3 flex items-center justify-center gap-2 text-center text-base text-[#172033]">
              <Calendar className="size-5 shrink-0" />
              {formatDateRange(training.start_date, training.end_date)}
            </p>
          </div>

          <div className="flex flex-col gap-1.5 bg-white pb-6">
            <section className="border border-x-0 border-[#e6e9ef] bg-white p-5">
              <h2 className="font-stack-sans-headline text-sm font-medium text-[#172033]">
                Deskripsi
              </h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#5f6573]">
                {training.description || "Deskripsi training belum tersedia."}
              </p>
            </section>

            <section className="border border-x-0 border-[#e6e9ef] bg-white p-5">
              <h2 className="font-stack-sans-headline text-sm font-medium text-[#172033]">
                Penyelenggara
              </h2>
              <div className="mt-3 flex items-center gap-2.5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-primary-soft">
                  <LogoHmi className="h-7 w-auto" />
                </div>
                <p className="min-w-0 truncate text-sm text-[#172033]">
                  {formatOrganizerName(training)}
                </p>
              </div>
            </section>

            <ContactPersonSection
              training={training}
              className="border border-x-0 border-[#e6e9ef] bg-white p-5"
              variant="plain"
            />

            <section className="border border-x-0 border-[#e6e9ef] bg-white p-5">
              <h2 className="font-stack-sans-headline text-sm font-medium text-[#172033]">
                Lokasi
              </h2>
              <div className="mt-3 min-w-0">
                <p className="text-sm text-[#5f6573]">
                  {training.location_name ?? "Lokasi training belum tersedia."}
                </p>
                {training.location_url && (
                  <a
                    href={training.location_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
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
        <div className="hidden min-h-[calc(100vh-4rem)] bg-white lg:block">
          <div className="relative h-[220px] overflow-hidden bg-[#dce7e8] xl:h-[250px]">
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
                <div className="relative mx-auto aspect-[4/5] w-full max-w-[340px] overflow-hidden rounded-xl border border-[#e6e9ef] bg-[#edf1f6] shadow-[0_18px_50px_rgba(23,32,51,0.18)]">
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
                    <div className="flex size-full flex-col items-center justify-center gap-3 text-[#7b8190]">
                      <ImageOff className="size-11" />
                      <span className="text-sm font-medium xl:text-[15px]">
                        Poster belum tersedia
                      </span>
                    </div>
                  )}
                </div>

                <div className="mx-auto mt-4 flex w-full max-w-[340px] items-center gap-2">
                  <Button
                    variant={reminded ? "soft" : "primary"}
                    size="default"
                    onClick={toggleReminder}
                    aria-pressed={reminded}
                    className="h-10 flex-1"
                  >
                    <IconAlarm className="size-5" stroke={2} />
                    {reminded ? "Diingatkan" : "Ingatkan saya"}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => void shareTraining()}
                    aria-label={`Bagikan ${training.name}`}
                  >
                    <IconShare3 className="size-5" stroke={2} />
                  </Button>
                </div>
                <p
                  aria-live="polite"
                  className="mx-auto mt-2 max-w-[340px] text-center text-xs font-medium text-primary"
                >
                  {shareFeedback}
                </p>
              </aside>

              <article className="min-w-0 self-start rounded-xl border border-[#e6e9ef] bg-white p-6 xl:p-8">
                <h1 className="font-stack-sans-headline text-3xl font-medium leading-tight text-[#172033] xl:text-[32px]">
                  {training.name}
                </h1>

                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#41474e] xl:text-[15px]">
                  <p className="flex items-center gap-2">
                    <CalendarDays className="size-4 shrink-0" />
                    {formatDateRange(training.start_date, training.end_date)}
                  </p>
                </div>

                <section className="mt-8 border-t border-[#e6e9ef] pt-6">
                  <h2 className="font-stack-sans-headline text-sm font-medium text-[#172033] xl:text-[15px]">
                    Penyelenggara
                  </h2>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[#e6e9ef] bg-primary-soft">
                      <LogoHmi className="h-8 w-auto" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] text-[#172033]">
                        {organizerName}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="mt-8 border-t border-[#e6e9ef] pt-6">
                  <h2 className="font-stack-sans-headline text-sm font-medium text-[#172033] xl:text-[15px]">
                    Deskripsi
                  </h2>
                  <p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-[#41474e]">
                    {training.description ||
                      "Deskripsi training belum tersedia."}
                  </p>
                </section>

                <ContactPersonSection
                  training={training}
                  className="mt-8 border-t border-[#e6e9ef] pt-6"
                />

                <section className="mt-8 border-t border-[#e6e9ef] pt-6">
                  <h2 className="font-stack-sans-headline text-sm font-medium text-[#172033] xl:text-[15px]">
                    Lokasi
                  </h2>
                  <div className="mt-4 min-w-0">
                    <p className="text-[15px] leading-7 text-[#41474e]">
                      {training.location_name ?? "Lokasi belum ditentukan"}
                    </p>
                    {training.location_url && (
                      <a
                        href={training.location_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline xl:text-[15px]"
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
    </TrainingPageShell>
  );
}
