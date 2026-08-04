"use client";

import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { TrainingDetail } from "@/apis/trainings";
import { formatOrganizerName } from "@/lib/organizer";
import { formatDateRange } from "@/lib/time-manipulation";
import {
  Calendar,
  CalendarDays,
  ExternalLink,
  ImageOff,
  MapPin,
  UserPlus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Button from "../buttons/Button";
import PageMargin from "../common/PageMargin";
import LogoHmi from "../svg/LogoHmi";
import {
  TrainingLevelLabel,
  TrainingRegistrationLabel,
} from "../trainings/TrainingLabels";
import TrainingPageShell, {
  type TrainingViewer,
} from "../trainings/TrainingPageShell";

interface PublicTrainingDetailPageProps {
  viewer: TrainingViewer;
  training: TrainingDetail;
}

const ORGANIZER_LABEL = {
  chapter: "Komisariat",
  branch: "Cabang",
  coordinating_body: "Badko",
  organization: "Organisasi",
};

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
}: {
  training: TrainingDetail;
  className?: string;
}) {
  if (!training.contact_person_name) return null;

  return (
    <section className={className}>
      <h2 className="text-sm font-semibold text-[#7b8190] xl:text-[15px]">
        Contact Person
      </h2>
      <div className="mt-3 flex items-center gap-3 rounded-lg border border-[#e4e8ef] bg-[#f8f9fb] p-3">
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
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white transition hover:opacity-90"
          >
            <FontAwesomeIcon icon={faWhatsapp} />
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

          <div className="px-4 pb-24 pt-5 flex flex-col gap-2">
            <div className="flex flex-col">
              <h1 className="text-xl font-bold leading-tight text-[#172033]">
                {training.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <TrainingLevelLabel level={training.level} />
                <TrainingRegistrationLabel
                  isOpen={training.is_registration_open}
                />
              </div>
            </div>

            <p className="mt-3 flex items-center gap-2 text-base text-[#172033]">
              <Calendar className="size-5 shrink-0" />
              {formatDateRange(training.start_date, training.end_date)}
            </p>

            <p className="mt-1 flex items-center gap-2 text-base text-[#172033]">
              <MapPin className="size-5 shrink-0" />
              {training.location_name ?? "Lokasi belum ditentukan"}
            </p>

            <ContactPersonSection training={training} className="mt-3" />

            <section className="mt-6 border-t border-[#edf0f4] pt-5">
              <h2 className="text-sm font-semibold text-[#7b8190]">
                Deskripsi
              </h2>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-[#41474e]">
                {training.description || "Deskripsi training belum tersedia."}
              </p>
            </section>

            <section className="mt-6 border-t border-[#edf0f4] pt-5">
              <h2 className="text-sm font-semibold text-[#7b8190]">
                Penyelenggara
              </h2>
              <div className="mt-4 flex items-center gap-2.5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft border border-primary/15">
                  <LogoHmi className="h-7 w-auto" />
                </div>
                <p className="min-w-0 truncate text-[#172033]">
                  {formatOrganizerName(training)}
                </p>
              </div>
            </section>

            <section className="mt-6 border-t border-[#edf0f4] pt-5">
              <h2 className="text-sm font-semibold text-[#7b8190]">Lokasi</h2>
              <div className="mt-4 flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#EFEDF9] text-[#42359B]">
                  <MapPin className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-[#172033]">
                    {training.location_name ?? "Lokasi belum ditentukan"}
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
              </div>
            </section>
          </div>

          {/* Floating register button, pinned to the viewport bottom (no BottomNav on this page). */}
          <div
            className="fixed inset-x-0 bottom-0 z-30 border-t border-[#e6e9ef] bg-white px-4 py-3"
            style={{
              paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
            }}
          >
            {training.is_registration_open ? (
              <Link href={`/trainings/${training.id}/register`}>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full rounded-full"
                >
                  <UserPlus className="size-5" />
                  Daftar Training
                </Button>
              </Link>
            ) : (
              <Button
                variant="primary"
                size="lg"
                className="w-full rounded-full"
                disabled
              >
                <UserPlus className="size-5" />
                Daftar Training
              </Button>
            )}
          </div>
        </div>

        {/* Desktop-only: fixed blur band with a sticky poster column. */}
        <div className="hidden min-h-[calc(100vh-4rem)] bg-white lg:block">
          <div className="relative h-[280px] overflow-hidden bg-[#dce7e8] xl:h-[320px]">
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

          <PageMargin className="relative -mt-52 pb-16 xl:-mt-60">
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)] xl:gap-8">
              <aside className="sticky top-24 min-w-0 self-start">
                <div className="relative mx-auto aspect-[4/5] w-full max-w-[340px] overflow-hidden rounded-lg bg-[#edf1f6] shadow-[0_18px_50px_rgba(23,32,51,0.18)]">
                  {training.image_url ? (
                    <Image
                      src={training.image_url}
                      alt={`Poster ${training.name}`}
                      fill
                      priority
                      sizes="340px"
                      className="object-contain"
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

                <div className="mx-auto mt-6 w-full max-w-[340px]">
                  {training.is_registration_open ? (
                    <Link href={`/trainings/${training.id}/register`}>
                      <Button
                        variant="primary"
                        size="lg"
                        className="w-full rounded-full"
                      >
                        <UserPlus className="size-5" />
                        Daftar Training
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full rounded-full"
                      disabled
                    >
                      <UserPlus className="size-5" />
                      Daftar Training
                    </Button>
                  )}
                </div>
              </aside>

              <article className="min-w-0 self-start rounded-lg bg-white/95 p-6 backdrop-blur-sm xl:p-8">
                <h1 className="text-4xl font-bold leading-tight text-[#172033]">
                  {training.name}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <TrainingLevelLabel
                    level={training.level}
                    className="xl:text-[13px]"
                  />
                  <TrainingRegistrationLabel
                    isOpen={training.is_registration_open}
                    className="xl:text-[13px]"
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#41474e] xl:text-[15px]">
                  <p className="flex items-center gap-2">
                    <CalendarDays className="size-4 shrink-0" />
                    {formatDateRange(training.start_date, training.end_date)}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="size-4 shrink-0" />
                    {training.location_name ?? "Lokasi belum ditentukan"}
                  </p>
                </div>

                <ContactPersonSection training={training} className="mt-6" />

                <section className="mt-8 border-t border-[#edf0f4] pt-6">
                  <h2 className="text-sm font-semibold text-[#7b8190] xl:text-[15px]">
                    Deskripsi
                  </h2>
                  <p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-[#41474e]">
                    {training.description ||
                      "Deskripsi training belum tersedia."}
                  </p>
                </section>

                <section className="mt-8 border-t border-[#edf0f4] pt-6">
                  <h2 className="text-sm font-semibold text-[#7b8190] xl:text-[15px]">
                    Penyelenggara
                  </h2>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white xl:text-[15px]">
                      {getInitials(organizerName)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-[#172033]">
                        {organizerName}
                      </p>
                      <p className="mt-0.5 text-sm text-[#7b8190] xl:text-[15px]">
                        {ORGANIZER_LABEL[training.organizer_type]}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="mt-8 border-t border-[#edf0f4] pt-6">
                  <h2 className="text-sm font-semibold text-[#7b8190] xl:text-[15px]">
                    Lokasi
                  </h2>
                  <div className="mt-4 flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#EFEDF9] text-[#42359B]">
                      <MapPin className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[#172033]">
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
