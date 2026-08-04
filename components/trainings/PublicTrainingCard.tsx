import {
  ArrowRight,
  Building2,
  CalendarDays,
  ImageOff,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { TrainingListEntry } from "@/apis/trainings";
import type { TrainingOrganizerTypeEnum } from "@/lib/types";
import {
  formatTrainingDate,
  formatTrainingDateRange,
} from "@/lib/trainings/training-ui";
import { TrainingLevelLabel, TrainingStatusLabel } from "./TrainingLabels";

interface PublicTrainingCardProps {
  training: TrainingListEntry;
}

const ORGANIZER_TYPE_LABEL: Record<TrainingOrganizerTypeEnum, string> = {
  chapter: "Komisariat",
  branch: "Cabang",
  coordinating_body: "Badko",
  organization: "Organisasi",
};

function organizerLine(training: TrainingListEntry) {
  if (!training.organizer_name) return "Penyelenggara belum tersedia";
  return `${ORGANIZER_TYPE_LABEL[training.organizer_type]} ${training.organizer_name}`;
}

function TrainingPoster({ training }: PublicTrainingCardProps) {
  return training.image_url ? (
    <Image
      src={training.image_url}
      alt={`Poster ${training.name}`}
      fill
      sizes="(max-width: 1023px) 25vw, (max-width: 1279px) 50vw, 33vw"
      className="object-cover"
    />
  ) : (
    <div className="flex size-full flex-col items-center justify-center gap-1.5 text-[#7b8190]">
      <ImageOff className="size-6 lg:size-8" />
      <span className="hidden text-xs font-medium lg:inline">
        Poster belum tersedia
      </span>
    </div>
  );
}

export default function PublicTrainingCard({
  training,
}: PublicTrainingCardProps) {
  return (
    <Link
      href={`/trainings/${training.id}`}
      className="group flex min-w-0 gap-3 bg-white px-4 py-3 transition hover:bg-[#f5f7fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 lg:flex-col lg:gap-0 lg:overflow-hidden lg:rounded-lg lg:border lg:border-[#e1e5ec] lg:p-0 lg:hover:-translate-y-0.5 lg:hover:border-primary/45 lg:hover:bg-white lg:hover:shadow-[0_12px_28px_rgba(23,32,51,0.09)]"
    >
      <div className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden rounded-lg bg-[#edf1f6] lg:w-full lg:rounded-none">
        <TrainingPoster training={training} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center lg:flex-none lg:justify-start lg:p-4">
        <div className="flex flex-wrap items-center gap-1.5 lg:gap-2">
          <TrainingLevelLabel level={training.level} />
          <TrainingStatusLabel
            startDate={training.start_date}
            endDate={training.end_date}
          />
        </div>

        <h2 className="mt-1.5 line-clamp-2 text-sm font-bold leading-5 text-[#172033] lg:mt-3 lg:text-lg lg:leading-6">
          {training.name}
        </h2>

        <p className="mt-1 truncate text-[13px] text-[#5f6573] lg:hidden">
          oleh {organizerLine(training)}
        </p>

        <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-[#5f6573] lg:hidden">
          <CalendarDays className="size-4 shrink-0 text-secondary" />
          <span className="truncate">
            {formatTrainingDate(training.start_date)}
            {training.location_name ? ` • ${training.location_name}` : ""}
          </span>
        </div>

        <div className="mt-4 hidden flex-col gap-2.5 text-sm text-[#5f6573] lg:flex">
          <span className="flex min-w-0 items-start gap-2">
            <Building2 className="mt-0.5 size-4 shrink-0 text-primary" />
            <span className="line-clamp-2">Oleh {organizerLine(training)}</span>
          </span>
          <span className="flex items-start gap-2">
            <CalendarDays className="mt-0.5 size-4 shrink-0 text-secondary" />
            <span>
              {formatTrainingDateRange(training.start_date, training.end_date)}
            </span>
          </span>
          <span className="flex min-w-0 items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-[#42359B]" />
            <span className="line-clamp-2">
              {training.location_name ?? "Lokasi belum ditentukan"}
            </span>
          </span>
        </div>

        <span className="mt-5 hidden items-center justify-between border-t border-[#edf0f4] pt-3 text-sm font-semibold text-primary lg:flex">
          Lihat detail
          <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
