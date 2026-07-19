"use client";

import { BookText, Pause, Play } from "lucide-react";
import { toast } from "sonner";
import type { QuranVerse } from "@/apis/quran";
import { toArabicNumerals } from "@/lib/arabicNumerals";
import Button from "../buttons/Button";

interface VerseCardProps {
  verse: QuranVerse;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

function handleTafsirClick() {
  toast.info("Fitur tafsir akan segera hadir.");
}

export default function VerseCard({
  verse,
  isPlaying,
  onTogglePlay,
}: VerseCardProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-[#e6e9ef] py-5 last:border-b-0">
      <p
        dir="rtl"
        lang="ar"
        className="font-arabic-quran text-right text-3xl leading-[2.8] text-[#172033]"
      >
        {verse.text_arabic}
        <span className="mx-1.5 inline-flex size-7 items-center justify-center rounded-full bg-secondary-soft/50 align-middle text-sm font-bold text-secondary">
          {toArabicNumerals(verse.number)}
        </span>
      </p>

      <p className="text-sm italic text-[#5f6573]">{verse.text_latin}</p>
      <p className="text-sm text-[#172033]">{verse.translation_id}</p>

      <div className="mt-1 flex items-center gap-2">
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={onTogglePlay}
        >
          {isPlaying ? (
            <Pause className="size-3.5" fill="currentColor" />
          ) : (
            <Play className="size-3.5 translate-x-0.5" fill="currentColor" />
          )}
          {isPlaying ? "Jeda" : "Putar"}
        </Button>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleTafsirClick}
        >
          <BookText className="size-3.5" />
          Tafsir
        </Button>
      </div>
    </div>
  );
}
