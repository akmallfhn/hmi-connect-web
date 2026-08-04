import {
  BookOpen,
  CalendarDays,
  Clock3,
  ExternalLink,
  MapPin,
  Users,
} from "lucide-react";
import type { TrainingDetail } from "@/apis/trainings";
import { formatDate, formatDateRange } from "@/lib/time-manipulation";
import { getTrainingDisplayStatus } from "@/lib/trainings/training-ui";
import Lk2StatCard from "./Lk2StatCard";

interface TrainingSummaryTabProps {
  training: TrainingDetail;
  materialCount: number;
  participantCount: number;
}

const STATUS_TEXT = {
  upcoming: "Akan Datang",
  ongoing: "Berlangsung",
  completed: "Selesai",
};

function getDuration(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00`).getTime();
  const end = new Date(`${endDate}T00:00:00`).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return "-";
  return Math.floor((end - start) / 86_400_000) + 1;
}

export default function TrainingSummaryTab({
  training,
  materialCount,
  participantCount,
}: TrainingSummaryTabProps) {
  const status = getTrainingDisplayStatus(
    training.start_date,
    training.end_date
  );
  const duration = getDuration(training.start_date, training.end_date);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Lk2StatCard
          icon={CalendarDays}
          color="blue"
          label="Status"
          value={STATUS_TEXT[status]}
        />
        <Lk2StatCard
          icon={Clock3}
          color="yellow"
          label="Durasi"
          value={duration === "-" ? duration : `${duration} hari`}
        />
        <Lk2StatCard
          icon={BookOpen}
          color="purple"
          label="Materi"
          value={materialCount}
        />
        <Lk2StatCard
          icon={Users}
          color="green"
          label="Peserta"
          value={participantCount}
        />
      </div>

      <section className="rounded-xl border border-[#e6e9ef] bg-white p-5">
        <h2 className="text-sm font-bold text-[#172033]">Informasi Pelaksanaan</h2>
        <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase text-[#5f6573]">
              Penyelenggara
            </dt>
            <dd className="mt-1 text-sm text-[#172033]">
              {training.organizer_name ?? "Cabang"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-[#5f6573]">
              Tanggal
            </dt>
            <dd className="mt-1 text-sm text-[#172033]">
              {formatDateRange(training.start_date, training.end_date)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-[#5f6573]">
              Lokasi
            </dt>
            <dd className="mt-1 flex items-center gap-2 text-sm text-[#172033]">
              <MapPin className="size-4 shrink-0 text-[#5f6573]" />
              <span>{training.location_name || "Belum ditentukan"}</span>
              {training.location_url && (
                <a
                  href={training.location_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                  aria-label="Buka lokasi"
                >
                  <ExternalLink className="size-4" />
                </a>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-[#5f6573]">
              Terakhir Diperbarui
            </dt>
            <dd className="mt-1 text-sm text-[#172033]">
              {new Date(training.updated_at).toLocaleString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Asia/Jakarta",
              })}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-[#e6e9ef] bg-white p-5">
        <h2 className="text-sm font-bold text-[#172033]">Deskripsi</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#5f6573]">
          {training.description || "Belum ada deskripsi untuk pelaksanaan ini."}
        </p>
        <p className="mt-4 text-xs text-[#5f6573]">
          Dibuat pada {formatDate(training.created_at.slice(0, 10))}
        </p>
      </section>
    </div>
  );
}
