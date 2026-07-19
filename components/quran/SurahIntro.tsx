import type { QuranSurah } from "@/apis/quran";

const BISMILLAH_ARABIC = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";

const SURAH_NUMBERS_WITHOUT_BISMILLAH = [1, 9];

interface SurahIntroProps {
  surah: QuranSurah;
}

export default function SurahIntro({ surah }: SurahIntroProps) {
  return (
    <div className="-mx-4 flex flex-col items-center gap-3 rounded-t-2xl border-b border-[#e6e9ef] bg-secondary-soft/25 py-6 text-center">
      {!SURAH_NUMBERS_WITHOUT_BISMILLAH.includes(surah.number) && (
        <p className="font-arabic-quran text-2xl leading-relaxed text-primary sm:text-3xl">
          {BISMILLAH_ARABIC}
        </p>
      )}

      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="h-px w-10 bg-secondary/40" />
        <span className="size-1.5 rotate-45 bg-secondary/60" />
        <span className="h-px w-10 bg-secondary/40" />
      </div>

      <div className="flex gap-3 items-center">
        <p className="text-base font-bold text-[#172033]">{surah.name_latin}</p>
        <p className="font-arabic-quran mt-0.5 text-xl text-[#172033]">
          {surah.name_arabic}
        </p>
      </div>
    </div>
  );
}
