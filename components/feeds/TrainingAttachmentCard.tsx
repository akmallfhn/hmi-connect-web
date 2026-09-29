"use client";

import { IconBellCheck, IconBellPlus } from "@tabler/icons-react";
import { CalendarDays, GraduationCap, Loader2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { FeedTrainingAttachment } from "@/apis/feeds";
import Label from "@/components/common/Label";
import LogoHmi from "@/components/svg/LogoHmi";
import { useTrainingReminder } from "@/hooks/useTrainingReminder";
import {
  formatDateRange,
  formatDateRangeWithWeekday,
} from "@/lib/time-manipulation";

function scheduleLabel(
  attachment: FeedTrainingAttachment,
  includeWeekday: boolean
) {
  const { reference_start_date: start, reference_end_date: end } = attachment;
  const format = includeWeekday ? formatDateRangeWithWeekday : formatDateRange;
  if (start && end) return format(start, end);
  if (start) return format(start, start);
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

// A compact horizontal event card: its action stays beside, rather than over, the training details.
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
      <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#f5f7fb] px-3 py-4 text-sm text-[#5f6573]">
        <GraduationCap className="size-4 shrink-0" />
        Latihan kader yang dibagikan sudah dihapus
      </div>
    );
  }

  const mobileSchedule = scheduleLabel(attachment, false);
  const desktopSchedule = scheduleLabel(attachment, true);
  const label = trainingLabel(attachment.reference_level);
  const organizerName =
    attachment.reference_organizer_entity_name?.trim() || "Penyelenggara HMI";

  return (
    <div className="mt-3 flex overflow-hidden rounded-xl border border-[#dbe3ef] bg-primary-soft text-[#172033]">
      <Link
        href={`/trainings/${attachment.reference_id}`}
        className="group flex min-w-0 flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
      >
        <div className="flex shrink-0 items-center py-3 pl-3 sm:py-4 sm:pl-4">
          <div className="relative aspect-[4/5] w-24 overflow-hidden rounded-lg bg-[#dfe4e8] sm:w-28">
            {attachment.reference_image_url ? (
              <Image
                src={attachment.reference_image_url}
                alt=""
                fill
                sizes="112px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-[linear-gradient(145deg,#d7e4e4,#d9d4cf)] text-[#6f7986]">
                <GraduationCap className="size-7" />
              </div>
            )}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 px-3 py-3 sm:px-4">
          <div className="hidden lg:block">
            <Label variant="orange" size="sm">
              {label}
            </Label>
          </div>
          <p className="line-clamp-2 font-stack-sans-headline text-sm font-medium leading-5 text-[#172033] sm:text-base">
            {attachment.reference_title ?? "Latihan Kader"}
          </p>

          <div className="flex min-w-0 items-center gap-1.5 text-xs text-[#5f6573] lg:text-[13px]">
            <span className="relative flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-[#d9dde3]">
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
            <p className="truncate line-clamp-1">{organizerName}</p>
          </div>

          {mobileSchedule && (
            <span className="flex min-w-0 items-center gap-1.5 truncate text-xs text-[#5f6573] lg:hidden">
              <CalendarDays className="size-3.5 shrink-0 text-secondary" />
              {mobileSchedule}
            </span>
          )}
          {desktopSchedule && (
            <span className="hidden min-w-0 items-center gap-1.5 truncate text-[13px] text-[#5f6573] lg:flex">
              <CalendarDays className="size-3.5 shrink-0 text-secondary" />
              {desktopSchedule}
            </span>
          )}
        </div>
      </Link>

      {(showReminder || onRemove) && (
        <div className="flex shrink-0 items-center gap-1 px-3 sm:px-4">
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
              className={`flex size-9 cursor-pointer items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:cursor-not-allowed disabled:opacity-60 ${
                reminded
                  ? "border border-secondary/20 bg-secondary-soft text-secondary"
                  : "bg-secondary text-white hover:bg-primary-soft hover:text-primary"
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
              className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-white text-[#5f6573] transition hover:bg-destructive-soft hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
