"use client";

import type { QuranSurahDetail } from "@/apis/quran";
import { faKaaba, faMosque } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BookOpen, Pause, Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import Button from "../buttons/Button";
import PageMargin from "../common/PageMargin";
import BottomNav from "../navigations/BottomNav";
import Header from "../navigations/Header";
import MetaPill from "../quran/MetaPill";
import QuranMiniPlayer, {
  type QuranAudioTrack,
} from "../quran/QuranMiniPlayer";
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

const HEADER_BACKGROUND_URL =
  "https://i.pinimg.com/1200x/4c/9e/c1/4c9ec1fc041bc95d95bcd738e597645d.jpg";

function revelationLabel(place: QuranSurahDetail["revelation_place"]) {
  return place === "madinah" ? "Madaniyah" : "Makkiyah";
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

  const isSurahPlaying = isPlaying && playingTrack?.id === "surah";

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

      <PageMargin className="pt-4">
        <div className="relative overflow-hidden rounded-2xl bg-white text-white">
          <div className="absolute inset-0 h-full w-full">
            <Image
              src={HEADER_BACKGROUND_URL}
              alt="Header Al-Quran Detail"
              fill
              className="object-cover"
            />
          </div>

          <div className="relative z-10 p-5">
            <p className="font-arabic-quran text-4xl">{surah.name_arabic}</p>
            <h1 className="mt-2 text-2xl font-bold">{surah.name_latin}</h1>
            <p className="mt-1 text-sm text-white/80">
              {surah.name_translation}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <MetaPill
                icon={
                  <FontAwesomeIcon
                    icon={
                      surah.revelation_place === "madinah" ? faMosque : faKaaba
                    }
                    className="size-3"
                  />
                }
                label={revelationLabel(surah.revelation_place)}
              />
              <MetaPill
                icon={<BookOpen className="size-3.5" />}
                label={`${surah.total_verses} ayat`}
              />
            </div>

            {surah.audio && (
              <Button
                type="button"
                size="pillSm"
                variant="secondary"
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
                {isSurahPlaying ? (
                  <Pause className="size-4" fill="currentColor" />
                ) : (
                  <Play
                    className="size-4 translate-x-0.5"
                    fill="currentColor"
                  />
                )}
                {isSurahPlaying ? "Jeda Murottal" : "Putar Murottal"}
              </Button>
            )}
          </div>
        </div>
      </PageMargin>

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
