"use client";

import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  ImageOff,
  MapPin,
  UserPlus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { TrainingDetail } from "@/apis/trainings";
import { formatTrainingDateRange } from "@/lib/trainings/training-ui";
import Button from "../buttons/Button";
import PageMargin from "../common/PageMargin";
import {
  TrainingLevelLabel,
  TrainingStatusLabel,
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

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export default function PublicTrainingDetailPage({
  viewer,
  training,
}: PublicTrainingDetailPageProps) {
  const organizerName = training.organizer_name ?? "Penyelenggara HMI";

  return (
    <TrainingPageShell viewer={viewer}>
      <main className="min-h-[calc(100vh-4rem)] bg-white">
        <div className="relative h-60 overflow-hidden bg-[#dce7e8] sm:h-72 lg:h-80">
          {training.image_url && (
            <Image
              src={training.image_url}
              alt=""
              fill
              priority
              aria-hidden="true"
              sizes="100vw"
              className="scale-110 object-cover opacity-50 blur-2xl"
            />
          )}
          <div className="absolute inset-0 bg-white/30 backdrop-blur-sm" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-white" />

          <PageMargin className="relative pt-5 lg:pt-7">
            <Link
              href="/trainings"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-white/70 bg-white/90 px-4 text-sm font-semibold text-[#172033] shadow-sm backdrop-blur transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <ArrowLeft className="size-4" />
              Kembali
            </Link>
          </PageMargin>
        </div>

        <PageMargin className="relative -mt-28 pb-10 sm:-mt-36 lg:-mt-40 lg:pb-16">
          <div className="mx-auto grid max-w-[980px] items-start gap-8 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-12">
            <aside className="min-w-0">
              <div className="relative mx-auto aspect-[4/5] w-full max-w-[340px] overflow-hidden rounded-lg border border-white/80 bg-[#edf1f6] shadow-[0_18px_50px_rgba(23,32,51,0.18)]">
                {training.image_url ? (
                  <Image
                    src={training.image_url}
                    alt={`Poster ${training.name}`}
                    fill
                    priority
                    sizes="(max-width: 1023px) 90vw, 340px"
                    className="object-contain"
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

              <Link
                href={`/trainings/${training.id}/register`}
                className="mx-auto mt-4 block w-full max-w-[340px]"
              >
                <Button variant="dark" size="lg" className="w-full rounded-full">
                  <UserPlus className="size-5" />
                  Daftar Training
                </Button>
              </Link>
            </aside>

            <article className="min-w-0 bg-white lg:pt-36">
              <div className="flex flex-wrap items-center gap-2">
                <TrainingLevelLabel level={training.level} />
                <TrainingStatusLabel
                  startDate={training.start_date}
                  endDate={training.end_date}
                />
              </div>

              <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-primary">
                <CalendarDays className="size-4 shrink-0" />
                {formatTrainingDateRange(
                  training.start_date,
                  training.end_date
                )}
              </p>

              <h1 className="mt-2 text-2xl font-bold leading-tight text-[#172033] sm:text-3xl lg:text-4xl">
                {training.name}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-[#5f6573]">
                <span>{ORGANIZER_LABEL[training.organizer_type]}</span>
                <span aria-hidden="true" className="size-1 rounded-full bg-[#b7bdc8]" />
                <span>{organizerName}</span>
                {training.location_name && (
                  <>
                    <span aria-hidden="true" className="size-1 rounded-full bg-[#b7bdc8]" />
                    <span>{training.location_name}</span>
                  </>
                )}
              </div>

              <section className="mt-8 border-t border-[#edf0f4] pt-6">
                <h2 className="text-sm font-semibold text-[#7b8190]">
                  Deskripsi
                </h2>
                <p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-[#41474e]">
                  {training.description || "Deskripsi training belum tersedia."}
                </p>
              </section>

              <section className="mt-8 border-t border-[#edf0f4] pt-6">
                <h2 className="text-sm font-semibold text-[#7b8190]">
                  Penyelenggara
                </h2>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {getInitials(organizerName)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-[#172033]">
                      {organizerName}
                    </p>
                    <p className="mt-0.5 text-sm text-[#7b8190]">
                      {ORGANIZER_LABEL[training.organizer_type]}
                    </p>
                  </div>
                </div>
              </section>

              <section className="mt-8 border-t border-[#edf0f4] pt-6">
                <h2 className="text-sm font-semibold text-[#7b8190]">
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
                        className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
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
      </main>
    </TrainingPageShell>
  );
}
