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
import { formatTrainingDateRange } from "@/lib/trainings/training-ui";
import { TrainingLevelLabel, TrainingStatusLabel } from "./TrainingLabels";

interface PublicTrainingCardProps {
  training: TrainingListEntry;
}

export default function PublicTrainingCard({
  training,
}: PublicTrainingCardProps) {
  return (
    <Link
      href={`/trainings/${training.id}`}
      className="group flex min-w-0 flex-col overflow-hidden rounded-lg border border-[#e1e5ec] bg-white transition hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-[0_12px_28px_rgba(23,32,51,0.09)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#edf1f6]">
        {training.image_url ? (
          <Image
            src={training.image_url}
            alt={`Poster ${training.name}`}
            fill
            sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
            className="object-contain"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-[#7b8190]">
            <ImageOff className="size-8" />
            <span className="text-xs font-medium">Poster belum tersedia</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-center gap-2">
          <TrainingLevelLabel level={training.level} />
          <TrainingStatusLabel
            startDate={training.start_date}
            endDate={training.end_date}
          />
        </div>

        <h2 className="mt-3 line-clamp-2 text-lg font-bold leading-6 text-[#172033]">
          {training.name}
        </h2>

        <div className="mt-4 flex flex-col gap-2.5 text-sm text-[#5f6573]">
          <span className="flex min-w-0 items-start gap-2">
            <Building2 className="mt-0.5 size-4 shrink-0 text-primary" />
            <span className="line-clamp-2">
              {training.organizer_name ?? "Penyelenggara belum tersedia"}
            </span>
          </span>
          <span className="flex items-start gap-2">
            <CalendarDays className="mt-0.5 size-4 shrink-0 text-secondary" />
            <span>
              {formatTrainingDateRange(
                training.start_date,
                training.end_date
              )}
            </span>
          </span>
          <span className="flex min-w-0 items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-[#42359B]" />
            <span className="line-clamp-2">
              {training.location_name ?? "Lokasi belum ditentukan"}
            </span>
          </span>
        </div>

        <span className="mt-5 flex items-center justify-between border-t border-[#edf0f4] pt-3 text-sm font-semibold text-primary">
          Lihat detail
          <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
