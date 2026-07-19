"use client";

import { Pause, Play } from "lucide-react";
import Link from "next/link";
import type { MouseEvent } from "react";
import type { QuranSurah } from "@/apis/quran";
import { toArabicNumerals } from "@/lib/arabicNumerals";
import Button from "../buttons/Button";

interface SurahRowProps {
  surah: QuranSurah;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

function readingMinutesLabel(seconds: number) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes} menit baca`;
}

export default function SurahRow({
  surah,
  isPlaying,
  onTogglePlay,
}: SurahRowProps) {
  function handlePlayClick(event: MouseEvent) {
    // The row itself links to the surah detail page — stop that navigation, this button
    // does something else (toggle playback in place).
    event.preventDefault();
    event.stopPropagation();
    onTogglePlay();
  }

  return (
    <Link
      href={`/quran/${surah.slug}`}
      className="flex items-center gap-3 py-3"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-sm font-semibold text-secondary">
        {toArabicNumerals(surah.number)}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#172033]">
          {surah.name_latin}
        </p>
        <p className="truncate text-xs text-[#5f6573]">
          {surah.total_verses} ayat •{" "}
          {readingMinutesLabel(surah.estimated_reading_seconds)}
        </p>
      </div>

      <p className="font-arabic-quran shrink-0 text-xl text-secondary">
        {surah.name_arabic}
      </p>

      <Button
        type="button"
        variant="primary"
        size="iconSm"
        onClick={handlePlayClick}
        aria-label={
          isPlaying ? `Jeda ${surah.name_latin}` : `Putar ${surah.name_latin}`
        }
        className="shrink-0"
      >
        {isPlaying ? (
          <Pause className="size-3.5" fill="currentColor" />
        ) : (
          <Play className="size-3.5" fill="currentColor" />
        )}
      </Button>
    </Link>
  );
}
