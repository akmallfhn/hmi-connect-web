"use client";

import { BookOpen, Clock } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { QuranJuzDetail, QuranJuzVerse, QuranSurah } from "@/apis/quran";
import { readingMinutesLabel } from "@/lib/quranReadingTime";
import PageMargin from "../common/PageMargin";
import BottomNav from "../navigations/BottomNav";
import Header from "../navigations/Header";
import MetaPill from "../quran/MetaPill";
import QuranMiniPlayer, { type QuranAudioTrack } from "../quran/QuranMiniPlayer";
import SurahIntro from "../quran/SurahIntro";
import VerseCard from "../quran/VerseCard";

const HEADER_BACKGROUND_URL =
  "https://i.pinimg.com/1200x/4c/9e/c1/4c9ec1fc041bc95d95bcd738e597645d.jpg";

interface ViewerProps {
  fullName?: string;
  avatar?: string;
  userId?: string;
  username?: string;
  isVerified?: boolean;
}

interface QuranJuzDetailPageProps {
  viewer: ViewerProps;
  juz: QuranJuzDetail;
  surahs: QuranSurah[];
}

interface SurahGroup {
  surahId: number;
  surahName: string;
  verses: QuranJuzVerse[];
}

// Verses arrive ordered by surah then verse number (earliest surah first, matching normal
// reading order), so grouping consecutive runs by surah_id is enough — no sorting needed.
function groupBySurah(verses: QuranJuzVerse[]): SurahGroup[] {
  const groups: SurahGroup[] = [];
  for (const verse of verses) {
    const current = groups[groups.length - 1];
    if (current && current.surahId === verse.surah_id) {
      current.verses.push(verse);
    } else {
      groups.push({
        surahId: verse.surah_id,
        surahName: verse.surah_name_latin,
        verses: [verse],
      });
    }
  }
  return groups;
}

export default function QuranJuzDetailPage({
  viewer,
  juz,
  surahs,
}: QuranJuzDetailPageProps) {
  const [playingTrack, setPlayingTrack] = useState<QuranAudioTrack | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);

  const groups = groupBySurah(juz.verses);
  const surahById = useMemo(
    () => new Map(surahs.map((surah) => [surah.id, surah])),
    [surahs]
  );

  function handleToggleTrack(track: QuranAudioTrack | null) {
    if (!track) {
      toast.error("Audio murottal ayat ini belum tersedia.");
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
        mobileBackTitle={`Juz ${juz.number}`}
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
            <h1 className="text-2xl font-bold">Juz {juz.number}</h1>

            <div className="mt-3 flex flex-wrap gap-2">
              <MetaPill
                icon={<BookOpen className="size-3.5" />}
                label={`${juz.verses.length} ayat`}
              />
              <MetaPill
                icon={<Clock className="size-3.5" />}
                label={readingMinutesLabel(juz.estimated_reading_seconds)}
              />
            </div>
          </div>
        </div>
      </PageMargin>

      <PageMargin
        className={`flex flex-col gap-6 pt-4 ${playingTrack ? "pb-24" : "pb-6"}`}
      >
        {groups.map((group) => {
          const surah = surahById.get(group.surahId);

          return (
            <div
              key={group.surahId}
              className="flex flex-col rounded-2xl border border-[#e6e9ef] bg-white px-4"
            >
              {surah ? (
                <SurahIntro surah={surah} />
              ) : (
                <p className="border-b border-[#e6e9ef] py-3 text-sm font-semibold text-primary">
                  {group.surahName}
                </p>
              )}
              {group.verses.map((verse) => (
                <VerseCard
                  key={verse.id}
                  verse={verse}
                  isPlaying={
                    isPlaying && playingTrack?.id === `verse-${verse.id}`
                  }
                  onTogglePlay={() =>
                    handleToggleTrack(
                      verse.audio
                        ? {
                            id: `verse-${verse.id}`,
                            title: `${group.surahName} Ayat ${verse.number}`,
                            subtitle: "Sedang diputar",
                            audioUrl: verse.audio,
                          }
                        : null
                    )
                  }
                />
              ))}
            </div>
          );
        })}
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
