"use client";

import { Pause, Play } from "lucide-react";
import type { QuranVerse } from "@/apis/quran";
import Button from "../buttons/Button";

interface VerseCardProps {
  verse: QuranVerse;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export default function VerseCard({
  verse,
  isPlaying,
  onTogglePlay,
}: VerseCardProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-[#e6e9ef] py-5 last:border-b-0">
      <div className="flex items-center justify-between">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
          {verse.number}
        </span>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onTogglePlay}
          aria-label={
            isPlaying ? `Jeda ayat ${verse.number}` : `Putar ayat ${verse.number}`
          }
          className="size-8 shrink-0 rounded-full text-primary hover:bg-primary-soft"
        >
          {isPlaying ? (
            <Pause className="size-4" />
          ) : (
            <Play className="size-4 translate-x-0.5" />
          )}
        </Button>
      </div>

      <p
        dir="rtl"
        lang="ar"
        className="font-arabic-quran text-right text-3xl leading-[2.6] text-[#172033]"
      >
        {verse.text_arabic}
      </p>

      <p className="text-sm italic text-[#5f6573]">{verse.text_latin}</p>
      <p className="text-sm text-[#172033]">{verse.translation_id}</p>
    </div>
  );
}
