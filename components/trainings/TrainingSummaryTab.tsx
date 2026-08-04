import {
  BookOpen,
  Building2,
  CalendarDays,
  Clock3,
  ExternalLink,
  ImageOff,
  MapPin,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import type { TrainingDetail } from "@/apis/trainings";
import { formatOrganizerName } from "@/lib/organizer";
import {
  COLOR_STYLES,
  type ColorName,
} from "@/lib/trainings/color-styles";
import { formatDateRange } from "@/lib/time-manipulation";
import Lk2StatCard from "./Lk2StatCard";

interface TrainingSummaryTabProps {
  training: TrainingDetail;
  materialCount: number;
  participantCount: number;
}

function InformationItem({
  icon: Icon,
  color,
  label,
  children,
}: {
  icon: LucideIcon;
  color: ColorName;
  label: string;
  children: ReactNode;
}) {
  const style = COLOR_STYLES[color];

  return (
    <div className="flex items-start gap-3">
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${style.bg}`}
      >
        <Icon className={`size-5 ${style.text}`} />
      </span>
      <div className="min-w-0 pt-0.5">
        <dt className="text-xs font-semibold uppercase text-[#5f6573]">
          {label}
        </dt>
        <dd className="mt-1 text-sm text-[#172033]">{children}</dd>
      </div>
    </div>
  );
}

export default function TrainingSummaryTab({
  training,
  materialCount,
  participantCount,
}: TrainingSummaryTabProps) {
  return (
    <div className="grid items-start gap-4 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="flex min-w-0 flex-col gap-4">
        <section className="hidden rounded-lg border border-[#e6e9ef] bg-white p-3 lg:block">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-[#f5f7fb]">
            {training.image_url ? (
              <Image
                src={training.image_url}
                alt={`Poster ${training.name}`}
                fill
                sizes="(max-width: 1279px) 280px, 320px"
                className="object-cover"
              />
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-2 text-[#7b8190]">
                <ImageOff className="size-9" />
                <span className="text-sm font-medium">
                  Poster belum tersedia
                </span>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-[#e6e9ef] bg-white p-4">
          <h2 className="text-sm font-bold text-[#172033]">Contact Person</h2>
          <div className="mt-4 flex items-center gap-3">
            <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-soft text-primary">
              {training.contact_person_avatar ? (
                <Image
                  src={training.contact_person_avatar}
                  alt={training.contact_person_name ?? "Contact Person"}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              ) : (
                <UserRound className="size-5" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#172033]">
                {training.contact_person_name ?? "Belum ditentukan"}
              </p>
              <p className="mt-0.5 truncate text-xs text-[#5f6573]">
                {training.contact_person_phone_number ??
                  "Nomor HP belum tersedia"}
              </p>
            </div>
          </div>
        </section>
      </aside>

      <div className="flex min-w-0 flex-col gap-4">
        <section className="rounded-lg border border-[#e6e9ef] bg-white p-5">
          <h2 className="text-sm font-bold text-[#172033]">
            Informasi Pelaksanaan
          </h2>
          <dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
            <InformationItem
              icon={Building2}
              color="green"
              label="Penyelenggara"
            >
              {formatOrganizerName(training)}
            </InformationItem>
            <InformationItem icon={CalendarDays} color="blue" label="Tanggal">
              {formatDateRange(training.start_date, training.end_date)}
            </InformationItem>
            <InformationItem icon={MapPin} color="purple" label="Lokasi">
              <span className="flex items-center gap-2">
                <span>{training.location_name || "Belum ditentukan"}</span>
                {training.location_url && (
                  <a
                    href={training.location_url}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-primary hover:underline"
                    aria-label="Buka lokasi"
                  >
                    <ExternalLink className="size-4" />
                  </a>
                )}
              </span>
            </InformationItem>
            <InformationItem
              icon={Clock3}
              color="orange"
              label="Terakhir Diperbarui"
            >
              {new Date(training.updated_at).toLocaleString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Asia/Jakarta",
              })}
            </InformationItem>
          </dl>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <Lk2StatCard
            icon={BookOpen}
            color="purple"
            label="Total Sesi Materi"
            value={materialCount}
          />
          <Lk2StatCard
            icon={Users}
            color="green"
            label="Total Peserta Terdaftar"
            value={participantCount}
          />
        </div>

        <section className="rounded-lg border border-[#e6e9ef] bg-white p-5">
          <h2 className="text-sm font-bold text-[#172033]">Deskripsi</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#5f6573]">
            {training.description ||
              "Belum ada deskripsi untuk pelaksanaan ini."}
          </p>
        </section>
      </div>
    </div>
  );
}
