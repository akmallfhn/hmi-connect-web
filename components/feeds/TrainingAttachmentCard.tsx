"use client";

import {
  IconArrowRight,
  IconBellCheck,
  IconBellPlus,
  IconBuildingCommunity,
  IconCalendarEvent,
  IconLoader2,
  IconMapPin,
  IconSchool,
  IconX,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import type { FeedTrainingAttachment } from "@/apis/feeds";
import Button from "@/components/buttons/Button";
import { useTrainingReminder } from "@/hooks/useTrainingReminder";
import { formatOrganizerName } from "@/lib/organizer";
import { formatDateRangeWithWeekday } from "@/lib/time-manipulation";
import type { TrainingStatusEnum } from "@/lib/types";

const TRAINING_TITLES: Record<TrainingStatusEnum, string> = {
  LK1: "Latihan Kader 1 (Basic Training)",
  LK2: "Latihan Kader 2 (Intermediate Training)",
  LK3: "Latihan Kader 3 (Advanced Training)",
  SC: "Senior Course",
  LKK: "Latihan Khusus Kohati",
  LKSG: "Latihan Kepemimpinan dan Sensitivitas Gender",
};

function scheduleLabel(attachment: FeedTrainingAttachment) {
  const start = attachment.reference_start_date;
  const end = attachment.reference_end_date ?? start;
  return start && end ? formatDateRangeWithWeekday(start, end) : null;
}

interface TrainingAttachmentCardProps {
  attachment: FeedTrainingAttachment;
  isSignedIn: boolean;
  showReminder?: boolean;
  onRemove?: () => void;
  removeDisabled?: boolean;
}

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
        <IconSchool className="size-4 shrink-0" stroke={2} />
        Latihan kader yang dibagikan sudah dihapus
      </div>
    );
  }

  const title = attachment.reference_level
    ? TRAINING_TITLES[attachment.reference_level]
    : attachment.reference_title || "Training HMI";
  const schedule = scheduleLabel(attachment);
  const location = attachment.reference_location_name?.trim() || "Lokasi menyusul";
  const organizer = formatOrganizerName({
    organizer_type: attachment.reference_organizer_entity_type,
    organizer_name: attachment.reference_organizer_entity_name,
    level: attachment.reference_level,
  });
  const href = `/trainings/${attachment.reference_id}`;

  const renderActions = () => (
    <>
      <Link href={href}>
        <Button variant="secondary">
          Lihat training <IconArrowRight className="size-4 shrink-0" stroke={2} />
        </Button>
      </Link>
      {showReminder && (
        <Button
          variant={reminded ? "soft" : "outline"}
          onClick={toggleReminder}
          disabled={savingReminder}
          aria-label={reminded ? `Batalkan pengingat ${title}` : `Ingatkan saya tentang ${title}`}
          aria-pressed={reminded}
          title={reminded ? "Batalkan pengingat" : "Ingatkan saya"}
        >
          {savingReminder ? (
            <IconLoader2 className="size-5 animate-spin motion-reduce:animate-none" stroke={2} />
          ) : reminded ? (
            <IconBellCheck className="size-5" stroke={2} />
          ) : (
            <IconBellPlus className="size-5" stroke={2} />
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
          className="ml-auto flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-black/5 text-muted-foreground transition-colors hover:bg-black/10 hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60 dark:bg-on-dark/10 dark:hover:bg-on-dark/20"
        >
          <IconX className="size-4" stroke={2} />
        </button>
      )}
    </>
  );

  return (
    <div className="mt-3 w-full min-w-0 overflow-hidden rounded-2xl border border-border bg-[#f5f7fb] dark:bg-[#1e1e1e]">
      <div className="flex min-w-0 items-start gap-4 p-4 pb-0 sm:p-5">
        <Link href={href} className="relative block aspect-[4/5] w-[112px] shrink-0 overflow-hidden rounded-xl bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:w-36">
          {attachment.reference_image_url ? (
            <Image
              src={attachment.reference_image_url}
              alt=""
              fill
              sizes="(max-width: 639px) 112px, 144px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <IconSchool className="size-9" stroke={1.5} />
            </div>
          )}
        </Link>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <Link href={href} className="block min-w-0 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <p className="line-clamp-3 min-w-0 break-words font-stack-sans-headline text-[17px] font-medium leading-6 text-heading sm:text-xl sm:leading-7">
              {title}
            </p>
            <div className="mt-3 flex min-w-0 flex-col gap-1.5">
              <span className="flex min-w-0 items-center gap-1.5 text-[13px] leading-5 text-muted-foreground sm:text-sm">
                <IconBuildingCommunity className="size-4 shrink-0" stroke={1.8} />
                <span className="line-clamp-1 min-w-0">{organizer}</span>
              </span>
              {schedule && (
                <span className="flex min-w-0 items-center gap-1.5 text-[13px] leading-5 text-muted-foreground sm:text-sm">
                  <IconCalendarEvent className="size-4 shrink-0" stroke={1.8} />
                  <span className="line-clamp-1 min-w-0">{schedule}</span>
                </span>
              )}
              <span className="flex min-w-0 items-center gap-1.5 text-[13px] leading-5 text-muted-foreground sm:text-sm">
                <IconMapPin className="size-4 shrink-0" stroke={1.8} />
                <span className="line-clamp-1 min-w-0">{location}</span>
              </span>
            </div>
          </Link>
          <div className="hidden flex-wrap items-center gap-2 sm:flex">
            {renderActions()}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-4 pb-4 pt-4 sm:hidden">
        {renderActions()}
      </div>
    </div>
  );
}
