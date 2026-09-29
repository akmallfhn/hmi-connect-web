"use client";

import {
  Bell,
  BellRing,
  CalendarDays,
  Ellipsis,
  ImageOff,
  MapPin,
  Share2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { TrainingListEntry } from "@/apis/trainings";
import { useTrainingReminder } from "@/hooks/useTrainingReminder";
import { formatDate, formatShortDate } from "@/lib/time-manipulation";
import type { TrainingOrganizerTypeEnum } from "@/lib/types";
import Dropdown from "../common/Dropdown";
import Button from "../buttons/Button";
import ShareModal from "../modals/ShareModal";
import RepostTrainingToFeedButton from "./RepostTrainingToFeedButton";
import {
  TrainingLevelLabel,
  TrainingRegistrationLabel,
  TrainingStatusLabel,
} from "./TrainingLabels";

interface PublicTrainingCardProps {
  training: TrainingListEntry;
  isSignedIn: boolean;
}

const ORGANIZER_TYPE_LABEL: Record<TrainingOrganizerTypeEnum, string> = {
  chapter: "Komisariat",
  branch: "Cabang",
  coordinating_body: "Badko",
  organization: "Organisasi",
};

function organizerLine(training: TrainingListEntry) {
  if (!training.organizer_name) return "Penyelenggara belum tersedia";
  if (!training.organizer_type) return training.organizer_name;
  return `${ORGANIZER_TYPE_LABEL[training.organizer_type]} ${training.organizer_name}`;
}

function TrainingPoster({ training }: { training: TrainingListEntry }) {
  return training.image_url ? (
    <Image
      src={training.image_url}
      alt={`Poster ${training.name}`}
      fill
      sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 390px"
      className="object-cover transition duration-500 group-hover:scale-105"
    />
  ) : (
    <div className="flex size-full items-center justify-center text-white/70">
      <ImageOff className="size-8" />
    </div>
  );
}

export default function PublicTrainingCard({
  training,
  isSignedIn,
}: PublicTrainingCardProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const {
    active: reminded,
    saving: savingReminder,
    toggle: toggleReminder,
  } = useTrainingReminder({
    trainingId: training.id,
    initialActive: training.is_reminder_active,
    isSignedIn,
  });

  const eventUrl =
    typeof window === "undefined"
      ? ""
      : `${window.location.origin}/trainings/${training.id}`;

  return (
    <>
      <article className="group overflow-hidden rounded-2xl border border-[#e1e6eb] bg-white shadow-[0_4px_14px_rgba(23,32,51,0.04)] transition hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_16px_32px_rgba(23,32,51,0.11)]">
      <Link
        href={`/trainings/${training.id}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-[linear-gradient(135deg,#0b6970,#159fa2)]">
          <TrainingPoster training={training} />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#071d24]/65 to-transparent" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            <TrainingLevelLabel level={training.level} />
            <TrainingStatusLabel
              startDate={training.start_date}
              endDate={training.end_date}
            />
          </div>
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-lg bg-white/94 px-2.5 py-1.5 text-xs font-bold text-[#172033] shadow-sm backdrop-blur-sm">
            <CalendarDays className="size-3.5 text-secondary" />
            {formatDate(training.start_date)}
          </div>
        </div>

        <div className="px-4 pb-3 pt-4">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-xs font-semibold text-primary">
              {organizerLine(training)}
            </p>
            <TrainingRegistrationLabel
              isOpen={training.is_registration_open}
              className="shrink-0"
            />
          </div>
          <h2 className="font-stack-sans-headline mt-2 line-clamp-2 min-h-12 text-lg font-medium leading-6 text-[#172033]">
            {training.name}
          </h2>
          <p className="mt-2 flex min-h-5 items-center gap-1.5 truncate text-sm text-[#667085]">
            <MapPin className="size-4 shrink-0 text-[#87919e]" />
            {training.location_name ?? "Lokasi akan diinformasikan"}
          </p>
        </div>
      </Link>

      <div className="flex items-center gap-1 border-t border-[#edf0f3] px-2 py-2">
        <button
          type="button"
          onClick={toggleReminder}
          disabled={savingReminder}
          aria-pressed={reminded}
          className={`inline-flex h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
            reminded
              ? "bg-primary-soft text-primary"
              : "text-[#596474] hover:bg-[#f3f6f8] hover:text-primary"
          }`}
        >
          {reminded ? <BellRing className="size-4" /> : <Bell className="size-4" />}
          {reminded ? "Diingatkan" : "Ingatkan"}
        </button>
        <RepostTrainingToFeedButton
          training={training}
          isSignedIn={isSignedIn}
          className="inline-flex h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-[#596474] transition hover:bg-[#f3f6f8] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShareOpen(true)}
          className="size-9 shrink-0 text-[#596474]"
          aria-label={`Bagikan ${training.name}`}
        >
          <Share2 className="size-4" />
        </Button>
        <Dropdown
          align="right"
          panelClassName="w-80 rounded-2xl"
          trigger={({ open, toggle }) => (
            <button
              type="button"
              onClick={toggle}
              aria-label={`Info ${training.name}`}
              aria-expanded={open}
              className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#596474] transition hover:bg-[#f3f6f8] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <Ellipsis className="size-5" />
            </button>
          )}
        >
          <div className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Info & pembaruan
            </p>
            <p className="mt-1 font-semibold text-[#172033]">{training.name}</p>
            <div className="mt-3 space-y-2 text-sm text-[#5f6573]">
              <p>
                <span className="font-medium text-[#172033]">Jadwal:</span>{" "}
                {formatDate(training.start_date)} – {formatDate(training.end_date)}
              </p>
              <p>
                <span className="font-medium text-[#172033]">Penyelenggara:</span>{" "}
                {organizerLine(training)}
              </p>
              <p>
                <span className="font-medium text-[#172033]">Dipublikasikan:</span>{" "}
                {formatShortDate(training.created_at)}
              </p>
            </div>
            <Link
              href={`/trainings/${training.id}`}
              className="mt-4 inline-flex h-9 items-center rounded-lg bg-primary px-3 text-sm font-semibold text-white transition hover:bg-[#128488]"
            >
              Lihat detail & pembaruan
            </Link>
          </div>
        </Dropdown>
      </div>
      </article>
      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        url={eventUrl}
        text={`Lihat ${training.name}, agenda ${training.level} dari HMI Connect`}
      />
    </>
  );
}
