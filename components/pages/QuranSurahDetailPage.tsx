"use client";

import { Play } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { QuranSurahDetail } from "@/apis/quran";
import Button from "../buttons/Button";
import PageMargin from "../common/PageMargin";
import BottomNav from "../navigations/BottomNav";
import Header from "../navigations/Header";
import QuranMiniPlayer, { type QuranAudioTrack } from "../quran/QuranMiniPlayer";
import VerseCard from "../quran/VerseCard";

interface ViewerProps {
  fullName?: string;
  avatar?: string;
  userId?: string;
  username?: string;
  isVerified?: boolean;
}

interface QuranSurahDetailPageProps {
  viewer: ViewerProps;
  surah: QuranSurahDetail;
}

function revelationLabel(place: QuranSurahDetail["revelation_place"]) {
  return place === "madinah" ? "Madaniyah" : "Makkiyah";
}

function readingMinutesLabel(seconds: number) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes} menit baca`;
}

export default function QuranSurahDetailPage({
  viewer,
  surah,
}: QuranSurahDetailPageProps) {
  const [playingTrack, setPlayingTrack] = useState<QuranAudioTrack | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);

  function handleToggleTrack(track: QuranAudioTrack | null) {
    if (!track) {
      toast.error("Audio murottal belum tersedia.");
      return;
    }

    if (playingTrack?.id === track.id) {
      setIsPlaying((prev) => !prev);
      return;
    }

    setPlayingTrack(track);
    setIsPlaying(true);
  }

  function handleClosePlayer() {
    setPlayingTrack(null);
    setIsPlaying(false);
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-16 lg:pb-0">
      <Header
        fullName={viewer.fullName}
        avatar={viewer.avatar}
        userId={viewer.userId}
        username={viewer.username}
        isVerified={viewer.isVerified}
        mobileBackTitle={surah.name_latin}
      />

      <div className="bg-gradient-to-br from-primary to-[#0d5f63] pb-6 pt-6 text-white">
        <PageMargin>
          <p className="font-arabic-quran text-3xl">{surah.name_arabic}</p>
          <h1 className="mt-1 text-lg font-bold">{surah.name_latin}</h1>
          <p className="text-sm text-white/80">{surah.name_translation}</p>
          <p className="mt-2 text-xs text-white/70">
            {revelationLabel(surah.revelation_place)} • {surah.total_verses}{" "}
            ayat • {readingMinutesLabel(surah.estimated_reading_seconds)}
          </p>

          {surah.audio && (
            <Button
              type="button"
              variant="light"
              size="pillSm"
              onClick={() =>
                handleToggleTrack({
                  id: "surah",
                  title: surah.name_latin,
                  subtitle: "Murottal lengkap",
                  audioUrl: surah.audio!,
                })
              }
              className="mt-4 gap-2"
            >
              <Play
                className="size-4 translate-x-0.5 text-primary"
                fill="currentColor"
              />
              Putar Semua
            </Button>
          )}
        </PageMargin>
      </div>

      <PageMargin className={playingTrack ? "pb-24 pt-4" : "pb-6 pt-4"}>
        <div className="flex flex-col rounded-2xl border border-[#e6e9ef] bg-white px-4">
          {surah.verses.map((verse) => (
            <VerseCard
              key={verse.id}
              verse={verse}
              isPlaying={isPlaying && playingTrack?.id === `verse-${verse.id}`}
              onTogglePlay={() =>
                handleToggleTrack(
                  verse.audio
                    ? {
                        id: `verse-${verse.id}`,
                        title: `${surah.name_latin} Ayat ${verse.number}`,
                        subtitle: "Sedang diputar",
                        audioUrl: verse.audio,
                      }
                    : null
                )
              }
            />
          ))}
        </div>
      </PageMargin>

      {playingTrack && (
        <QuranMiniPlayer
          key={playingTrack.id}
          track={playingTrack}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying((prev) => !prev)}
          onClose={handleClosePlayer}
        />
      )}

      <BottomNav userId={viewer.userId} username={viewer.username} />
    </div>
  );
}
