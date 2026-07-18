"use client";

import { Pause, Play } from "lucide-react";
import Link from "next/link";
import type { MouseEvent } from "react";
import type { QuranSurah } from "@/apis/quran";
import Button from "../buttons/Button";

interface SurahRowProps {
  surah: QuranSurah;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

function revelationLabel(place: QuranSurah["revelation_place"]) {
  return place === "madinah" ? "Madaniyah" : "Makkiyah";
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
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
        {surah.number}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#172033]">
          {surah.name_latin}
        </p>
        <p className="truncate text-xs text-[#5f6573]">
          {surah.total_verses} ayat • {revelationLabel(surah.revelation_place)} •{" "}
          {readingMinutesLabel(surah.estimated_reading_seconds)}
        </p>
      </div>

      <Button
        type="button"
        variant="primary"
        size="icon"
        onClick={handlePlayClick}
        aria-label={
          isPlaying ? `Jeda ${surah.name_latin}` : `Putar ${surah.name_latin}`
        }
        className="size-10 shrink-0 rounded-full"
      >
        {isPlaying ? (
          <Pause className="size-4" />
        ) : (
          <Play className="size-4 translate-x-0.5" />
        )}
      </Button>
    </Link>
  );
}
