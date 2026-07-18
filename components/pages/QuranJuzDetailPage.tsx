"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { QuranJuzDetail, QuranJuzVerse } from "@/apis/quran";
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

interface QuranJuzDetailPageProps {
  viewer: ViewerProps;
  juz: QuranJuzDetail;
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

function coverageLabel(groups: SurahGroup[]): string {
  return groups
    .map((group) => {
      const first = group.verses[0].number;
      const last = group.verses[group.verses.length - 1].number;
      return `${group.surahName} ${first}${first === last ? "" : `-${last}`}`;
    })
    .join(", ");
}

export default function QuranJuzDetailPage({
  viewer,
  juz,
}: QuranJuzDetailPageProps) {
  const [playingTrack, setPlayingTrack] = useState<QuranAudioTrack | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);

  const groups = groupBySurah(juz.verses);

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

      <div className="bg-gradient-to-br from-primary to-[#0d5f63] pb-6 pt-6 text-white">
        <PageMargin>
          <h1 className="text-lg font-bold">Juz {juz.number}</h1>
          <p className="mt-1 text-sm text-white/80">{juz.verses.length} ayat</p>
          <p className="mt-2 text-xs text-white/70">{coverageLabel(groups)}</p>
        </PageMargin>
      </div>

      <PageMargin
        className={`flex flex-col gap-6 pt-4 ${playingTrack ? "pb-24" : "pb-6"}`}
      >
        {groups.map((group) => (
          <div
            key={group.surahId}
            className="flex flex-col rounded-2xl border border-[#e6e9ef] bg-white px-4"
          >
            <p className="border-b border-[#e6e9ef] py-3 text-sm font-semibold text-primary">
              {group.surahName}
            </p>
            {group.verses.map((verse) => (
              <VerseCard
                key={verse.id}
                verse={verse}
                isPlaying={isPlaying && playingTrack?.id === `verse-${verse.id}`}
                onTogglePlay={() =>
                  handleToggleTrack(
                    verse.audio
                      ? {
                          id: `verse-${verse.id}`,
                          badge: verse.number,
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
        ))}
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
