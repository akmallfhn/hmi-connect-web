"use client";

import { IconBellCheck, IconBellPlus } from "@tabler/icons-react";
import { CalendarDays, GraduationCap, Loader2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { FeedTrainingAttachment } from "@/apis/feeds";
import LogoHmi from "@/components/svg/LogoHmi";
import { useTrainingReminder } from "@/hooks/useTrainingReminder";
import { formatDateRangeWithWeekday } from "@/lib/time-manipulation";

function scheduleLabel(attachment: FeedTrainingAttachment) {
  const { reference_start_date: start, reference_end_date: end } = attachment;
  if (start && end) return formatDateRangeWithWeekday(start, end);
  if (start) return formatDateRangeWithWeekday(start, start);
  return null;
}

function trainingLabel(level: FeedTrainingAttachment["reference_level"]) {
  const levelNumber = level?.match(/\d+/)?.[0];
  return levelNumber ? `Latihan Kader ${levelNumber}` : "Latihan Kader";
}

interface TrainingAttachmentCardProps {
  attachment: FeedTrainingAttachment;
  isSignedIn: boolean;
  showReminder?: boolean;
  onRemove?: () => void;
  removeDisabled?: boolean;
}

// An image-led event card: the entire artwork opens the training, while its actions stay independent.
export default function TrainingAttachmentCard({
  attachment,
  isSignedIn,
  showReminder = true,
  onRemove,
  removeDisabled = false,
}: TrainingAttachmentCardProps) {
  const {
    active: reminded,
    saving: savingReminder,
    toggle: toggleReminder,
  } = useTrainingReminder({
    trainingId: attachment.reference_id,
    initialActive: attachment.reference_is_reminder_active,
    isSignedIn,
  });

  if (attachment.reference_is_deleted) {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-[#e6e9ef] bg-[#f5f7fb] px-3 py-4 text-sm text-[#5f6573]">
        <GraduationCap className="size-4 shrink-0" />
        Latihan kader yang dibagikan sudah dihapus
      </div>
    );
  }

  const schedule = scheduleLabel(attachment);
  const label = trainingLabel(attachment.reference_level);
  const organizerName =
    attachment.reference_organizer_entity_name?.trim() || "Penyelenggara HMI";

  return (
    <div className="relative mt-3 max-w-md overflow-hidden rounded-2xl bg-[#060505] shadow-[0_14px_30px_rgba(23,32,51,0.16)]">
      <Link
        href={`/trainings/${attachment.reference_id}`}
        className="group relative block aspect-[4/5] overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
      >
        {attachment.reference_image_url ? (
          <Image
            src={attachment.reference_image_url}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 640px"
            className="object-cover transition duration-700 group-hover:scale-[1.035]"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,#158184,transparent_42%),radial-gradient(circle_at_85%_100%,#d85c38,transparent_40%),#080a0c]" />
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/5" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#060505]/35 via-transparent to-transparent" />

        {!attachment.reference_image_url && (
          <GraduationCap className="absolute right-5 top-16 size-16 text-white/15" />
        )}

        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <div className="mb-2 flex items-center gap-1.5">
            <span className="rounded-full border border-white/15 bg-gradient-to-r from-[#222529] to-[#111214] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.13em] text-white shadow-[0_2px_8px_rgba(0,0,0,0.22)]">
              {label}
            </span>
          </div>
          <p className="font-stack-sans-headline line-clamp-2 max-w-[28rem] text-xl font-medium leading-[1.08] text-white sm:text-2xl">
            {attachment.reference_title ?? "Latihan Kader"}
          </p>
          <div className="mt-2 flex min-w-0 items-center gap-2 text-xs font-medium text-white/75 sm:text-sm">
            <span className="relative flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/90 ring-1 ring-white/30">
              {attachment.reference_organizer_entity_image_url ? (
                <Image
                  src={attachment.reference_organizer_entity_image_url}
                  alt=""
                  fill
                  sizes="20px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <LogoHmi className="h-3.5 w-auto" />
              )}
            </span>
            <p className="truncate">{organizerName}</p>
          </div>
          {attachment.reference_description && (
            <p className="mt-1.5 line-clamp-1 max-w-xl text-xs leading-4 text-white/60 sm:text-sm">
              {attachment.reference_description}
            </p>
          )}
          <div className="mt-3 text-xs text-white/75 sm:text-sm">
            {schedule ? (
              <span className="flex min-w-0 items-center gap-1.5 truncate">
                <CalendarDays className="size-3.5 shrink-0 text-secondary" />
                {schedule}
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      {(showReminder || onRemove) && (
        <div className="absolute right-3 top-3 flex items-start gap-1.5">
          {showReminder && (
            <button
              type="button"
              onClick={toggleReminder}
              disabled={savingReminder}
              aria-label={
                reminded
                  ? `Batalkan pengingat ${attachment.reference_title ?? "training"}`
                  : `Ingatkan saya tentang ${attachment.reference_title ?? "training"}`
              }
              aria-pressed={reminded}
              title={reminded ? "Batalkan pengingat" : "Ingatkan saya"}
              className={`flex size-9 cursor-pointer items-center justify-center rounded-full border backdrop-blur-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:cursor-not-allowed disabled:opacity-60 ${
                reminded
                  ? "border-primary bg-primary text-white"
                  : "border-white/20 bg-black/35 text-white hover:bg-white/20"
              }`}
            >
              {savingReminder ? (
                <Loader2 className="size-4 animate-spin" />
              ) : reminded ? (
                <IconBellCheck className="size-4" stroke={2} />
              ) : (
                <IconBellPlus className="size-4" stroke={2} />
              )}
            </button>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              disabled={removeDisabled}
              aria-label="Hapus training"
              title="Hapus training"
              className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-md transition hover:border-destructive hover:bg-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
