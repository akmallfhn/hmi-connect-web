"use client";

import { Pause, Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Button from "../buttons/Button";

// A track is either a whole-surah recitation (QuranPage) or a single verse (surah detail
// page) — both just need a badge/title/subtitle/audio URL to drive this player.
export interface QuranAudioTrack {
  id: string;
  badge: string | number;
  title: string;
  subtitle: string;
  audioUrl: string;
}

interface QuranMiniPlayerProps {
  track: QuranAudioTrack;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onClose: () => void;
}

// Spotify-style floating mini player, mobile-only — scoped to this page's own local state,
// not a global/cross-page player, so it stops as soon as the user navigates away.
// The caller remounts this via key={track.id} on every track change, so `progress` seeding
// at 0 on mount is enough — no extra effect needed just to reset it when the track changes.
export default function QuranMiniPlayer({
  track,
  isPlaying,
  onTogglePlay,
  onClose,
}: QuranMiniPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  function handleTimeUpdate() {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    setProgress((audio.currentTime / audio.duration) * 100);
  }

  return (
    <div className="fixed inset-x-0 bottom-16 z-40 px-3 lg:hidden">
      <div className="mx-auto max-w-sm overflow-hidden rounded-2xl bg-[#172033] text-white shadow-lg">
        <div className="h-1 bg-white/10">
          <div
            className="h-full bg-primary transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center gap-3 px-3 py-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold">
            {track.badge}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{track.title}</p>
            <p className="truncate text-xs text-white/60">{track.subtitle}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onTogglePlay}
            aria-label={isPlaying ? "Jeda" : "Putar"}
            className="size-9 shrink-0 rounded-full text-white hover:bg-white/10"
          >
            {isPlaying ? (
              <Pause className="size-4" />
            ) : (
              <Play className="size-4 translate-x-0.5" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Tutup pemutar"
            className="size-9 shrink-0 rounded-full text-white/70 hover:bg-white/10"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
      <audio
        ref={audioRef}
        src={track.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={onClose}
      />
    </div>
  );
}
