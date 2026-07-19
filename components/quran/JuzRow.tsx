import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { QuranJuz } from "@/apis/quran";
import { toArabicNumerals } from "@/lib/arabicNumerals";
import { readingMinutesLabel } from "@/lib/quranReadingTime";

interface JuzRowProps {
  juz: QuranJuz;
}

export default function JuzRow({ juz }: JuzRowProps) {
  return (
    <Link href={`/quran/juz/${juz.id}`} className="flex items-center gap-3 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-sm font-semibold text-secondary">
        {toArabicNumerals(juz.number)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#172033]">
          Juz {juz.number}
        </p>
        <p className="truncate text-xs text-[#5f6573]">
          {readingMinutesLabel(juz.estimated_reading_seconds)}
        </p>
      </div>
      <ChevronRight className="size-4 shrink-0 text-[#7b8190]" />
    </Link>
  );
}
