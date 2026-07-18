import type { QuranJuz } from "@/apis/quran";

interface JuzRowProps {
  juz: QuranJuz;
}

// No juz detail page (and no whole-juz audio) exists yet, so this is a plain, non-interactive
// row — not a placeholder href="#" link, since it's a list item rather than a nav destination.
export default function JuzRow({ juz }: JuzRowProps) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
        {juz.number}
      </span>
      <p className="text-sm font-semibold text-[#172033]">Juz {juz.number}</p>
    </div>
  );
}
