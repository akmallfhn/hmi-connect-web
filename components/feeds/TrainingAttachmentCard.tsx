"use client";

import { IconBellCheck, IconBellPlus } from "@tabler/icons-react";
import { ArrowRight, CalendarDays, GraduationCap, Loader2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { FeedTrainingAttachment } from "@/apis/feeds";
import Button from "@/components/buttons/Button";
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

// An image-led event preview with its actions in a separate footer.
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
      <div className="mt-3 flex items-center gap-2 rounded-xl bg-surface-muted px-3 py-4 text-sm text-muted-foreground">
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
    <div className="mt-3 overflow-hidden rounded-2xl border border-border-strong bg-surface transition-colors focus-within:border-primary">
      <Link
        href={`/trainings/${attachment.reference_id}`}
        className="group flex min-w-0 items-stretch gap-3 p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:gap-4 sm:p-4"
      >
        <div className="relative aspect-[4/5] w-[88px] shrink-0 overflow-hidden rounded-xl bg-primary-soft sm:w-28">
          {attachment.reference_image_url ? (
            <Image
              src={attachment.reference_image_url}
              alt=""
              fill
              sizes="(max-width: 639px) 88px, 112px"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
              unoptimized
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-linear-to-br from-primary-soft to-surface-muted text-primary-foreground">
              <GraduationCap className="size-8" />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-start gap-2 py-0.5">
          <Label variant="orange" size="sm">
            {label}
          </Label>
          <p className="line-clamp-2 font-stack-sans-headline text-[15px] font-medium leading-5 text-heading sm:text-base sm:leading-6">
            {attachment.reference_title ?? "Latihan Kader"}
          </p>

          <div className="mt-auto flex w-full min-w-0 flex-col gap-1.5">
            {mobileSchedule && (
              <span className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-secondary-foreground sm:text-[13px] lg:hidden">
                <CalendarDays className="size-3.5 shrink-0" />
                <span className="line-clamp-2">{mobileSchedule}</span>
              </span>
            )}
            {desktopSchedule && (
              <span className="hidden min-w-0 items-center gap-1.5 text-[13px] font-medium text-secondary-foreground lg:flex">
                <CalendarDays className="size-3.5 shrink-0" />
                <span className="line-clamp-2">{desktopSchedule}</span>
              </span>
            )}
            <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground sm:text-[13px]">
              <span className="relative flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-soft ring-1 ring-border">
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
              <span className="truncate">{organizerName}</span>
            </div>
          </div>
        </div>
      </Link>

      <div className="flex items-center justify-between gap-2 border-t border-divider bg-surface-subtle px-3 py-2.5 sm:px-4">
        <Link
          href={`/trainings/${attachment.reference_id}`}
          className="inline-flex min-h-9 items-center gap-1.5 text-xs font-semibold text-primary-foreground focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:text-sm"
        >
          Lihat detail
          <ArrowRight className="size-3.5" />
        </Link>
        {(showReminder || onRemove) && (
          <div className="flex shrink-0 items-center gap-2">
            {showReminder && (
              <Button
                variant="primary"
                onClick={toggleReminder}
                disabled={savingReminder}
                aria-label={
                  reminded
                    ? `Batalkan pengingat ${attachment.reference_title ?? "training"}`
                    : `Ingatkan saya tentang ${attachment.reference_title ?? "training"}`
                }
                aria-pressed={reminded}
                title={reminded ? "Batalkan pengingat" : "Ingatkan saya"}
              >
                {savingReminder ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : reminded ? (
                  <IconBellCheck className="size-4" stroke={2} />
                ) : (
                  <IconBellPlus className="size-4" stroke={2} />
                )}
                <span>{reminded ? "Pengingat aktif" : "Ingatkan saya"}</span>
              </Button>
            )}
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                disabled={removeDisabled}
                aria-label="Hapus training"
                title="Hapus training"
                className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-border-strong bg-surface text-muted-foreground transition hover:bg-destructive-soft hover:text-destructive-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
