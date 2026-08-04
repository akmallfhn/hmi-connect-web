import { CalendarDays, ImageOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { TrainingListEntry } from "@/apis/trainings";
import { formatDate } from "@/lib/time-manipulation";
import type { TrainingOrganizerTypeEnum } from "@/lib/types";
import {
  TrainingLevelLabel,
  TrainingRegistrationLabel,
} from "./TrainingLabels";

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
      sizes="(max-width: 1023px) 25vw, 15vw"
      className="object-cover"
    />
  ) : (
    <div className="flex size-full items-center justify-center text-[#7b8190]">
      <ImageOff className="size-5 lg:size-6" />
    </div>
  );
}

export default function PublicTrainingCard({
  training,
}: PublicTrainingCardProps) {
  return (
    <Link
      href={`/trainings/${training.id}`}
      className="group flex min-w-0 gap-3 bg-white px-4 py-3 transition hover:bg-[#f5f7fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 lg:gap-4 lg:rounded-lg lg:border lg:border-[#e1e5ec] lg:p-4 lg:hover:-translate-y-0.5 lg:hover:border-primary/45 lg:hover:bg-white lg:hover:shadow-[0_12px_28px_rgba(23,32,51,0.09)]"
    >
      <div className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden rounded-lg bg-[#edf1f6] lg:w-28">
        <TrainingPoster training={training} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex flex-wrap items-center gap-1.5 lg:gap-2">
          <TrainingLevelLabel level={training.level} />
          <TrainingRegistrationLabel
            isOpen={training.is_registration_open}
          />
        </div>

        <h2 className="mt-1.5 line-clamp-2 text-sm font-bold leading-5 text-[#172033] lg:mt-2 lg:text-base lg:leading-6">
          {training.name}
        </h2>

        <p className="mt-1 truncate text-[13px] text-[#5f6573] lg:text-sm">
          oleh {organizerLine(training)}
        </p>

        <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-[#5f6573] lg:text-sm">
          <CalendarDays className="size-4 shrink-0 text-secondary" />
          <span className="truncate">
            {formatDate(training.start_date)}
            {training.location_name ? ` • ${training.location_name}` : ""}
          </span>
        </div>
      </div>
    </Link>
  );
}
