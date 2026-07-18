import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { QuranJuz } from "@/apis/quran";

interface JuzRowProps {
  juz: QuranJuz;
}

export default function JuzRow({ juz }: JuzRowProps) {
  return (
    <Link href={`/quran/juz/${juz.id}`} className="flex items-center gap-3 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
        {juz.number}
      </span>
      <p className="flex-1 text-sm font-semibold text-[#172033]">
        Juz {juz.number}
      </p>
      <ChevronRight className="size-4 shrink-0 text-[#7b8190]" />
    </Link>
  );
}
