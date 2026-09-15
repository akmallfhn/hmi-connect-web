import { CalendarDays, GraduationCap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Label from "@/components/common/Label";
import { formatDate, formatDateRange } from "@/lib/time-manipulation";
import type { FeedTrainingAttachment } from "@/apis/feeds";

function scheduleLabel(attachment: FeedTrainingAttachment) {
  const { reference_start_date: start, reference_end_date: end } = attachment;
  if (start && end) return formatDateRange(start, end);
  if (start) return formatDate(start);
  return null;
}

// Opens in-app on reference_id — a training attachment carries no url, unlike news.
export default function TrainingAttachmentCard({
  attachment,
}: {
  attachment: FeedTrainingAttachment;
}) {
  if (attachment.reference_is_deleted) {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-[#e6e9ef] bg-[#f5f7fb] px-3 py-4 text-sm text-[#5f6573]">
        <GraduationCap className="size-4 shrink-0" />
        Latihan kader yang dibagikan sudah dihapus
      </div>
    );
  }

  const schedule = scheduleLabel(attachment);

  return (
    <Link
      href={`/trainings/${attachment.reference_id}`}
      className="mt-3 flex overflow-hidden rounded-xl border border-[#e6e9ef] transition hover:bg-[#f5f7fb]"
    >
      {attachment.reference_image_url ? (
        <div className="relative aspect-square w-16 shrink-0 bg-[#f5f7fb] sm:w-24">
          <Image
            src={attachment.reference_image_url}
            alt=""
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      ) : (
        <div className="flex aspect-square w-16 shrink-0 items-center justify-center bg-[#f5f7fb] text-[#5f6573] sm:w-24">
          <GraduationCap className="size-5" />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-3 py-2">
        <div className="flex items-center gap-2">
          {attachment.reference_level && (
            <Label variant="blue" size="sm">
              {attachment.reference_level}
            </Label>
          )}
          <p className="truncate text-[11px] uppercase tracking-wide text-[#5f6573]">
            Latihan Kader
          </p>
        </div>
        <p className="line-clamp-2 text-sm font-semibold text-[#172033]">
          {attachment.reference_title ?? "Latihan Kader"}
        </p>
        {schedule ? (
          <p className="flex items-center gap-1 text-xs text-[#5f6573]">
            <CalendarDays className="size-3.5 shrink-0" />
            {schedule}
          </p>
        ) : (
          attachment.reference_description && (
            <p className="line-clamp-2 text-xs text-[#5f6573]">
              {attachment.reference_description}
            </p>
          )
        )}
      </div>
    </Link>
  );
}
