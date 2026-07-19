"use client";

import { Search } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { QuranJuz, QuranSurah } from "@/apis/quran";
import PageMargin from "../common/PageMargin";
import BottomNav from "../navigations/BottomNav";
import Header from "../navigations/Header";
import JuzRow from "../quran/JuzRow";
import QuranMiniPlayer from "../quran/QuranMiniPlayer";
import SurahRow from "../quran/SurahRow";

const BANNER_ILLUSTRATION_URL =
  "https://fkzvvwtrwpjsclpthqex.supabase.co/storage/v1/object/public/hmi-connect/wallpaper-alquran.webp";

interface ViewerProps {
  fullName?: string;
  avatar?: string;
  userId?: string;
  username?: string;
  isVerified?: boolean;
}

interface QuranPageProps {
  viewer: ViewerProps;
  surahs: QuranSurah[];
  juz: QuranJuz[];
}

type QuranTab = "surah" | "juz";

const SURAH_SEARCH_DEBOUNCE_MS = 400;

function tabClassName(active: boolean): string {
  return [
    "flex-1 min-w-[96px] rounded-full py-2 px-4 text-sm font-semibold transition lg:flex-none",
    active ? "bg-primary text-white" : "text-[#5f6573]",
  ].join(" ");
}

export default function QuranPage({ viewer, surahs, juz }: QuranPageProps) {
  const [tab, setTab] = useState<QuranTab>("surah");
  const [query, setQuery] = useState("");
  const [searchedSurahs, setSearchedSurahs] = useState(surahs);
  const [isSearchingSurahs, setIsSearchingSurahs] = useState(false);
  const [playingSurah, setPlayingSurah] = useState<QuranSurah | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const requestIdRef = useRef(0);

  // Surah search hits the backend (its regex normalizes punctuation, e.g. "yasin" still
  // matches "Ya-Sin") — debounced + guarded by requestIdRef so a slow earlier response can't
  // clobber a faster later one. Juz has no name to search (just a number), so filtering it
  // stays client-side over the already-fetched full list. Every setState is deferred into the
  // setTimeout callback (0ms for the empty-query case) rather than called synchronously in the
  // effect body — same reason SearchableSelect defers its own immediate load.
  useEffect(() => {
    const trimmed = query.trim();
    const requestId = ++requestIdRef.current;
    clearTimeout(debounceRef.current);

    if (!trimmed) {
      debounceRef.current = setTimeout(() => {
        if (requestId !== requestIdRef.current) return;
        setSearchedSurahs(surahs);
        setIsSearchingSurahs(false);
      }, 0);
      return () => clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      if (requestId !== requestIdRef.current) return;
      setIsSearchingSurahs(true);
      try {
        const params = new URLSearchParams({ q: trimmed });
        const response = await fetch(`/api/quran-surahs/search?${params}`);
        const json = await response.json();
        if (requestId !== requestIdRef.current) return;
        setSearchedSurahs(json.data ?? []);
      } catch (error) {
        if (requestId === requestIdRef.current) {
          console.error("[QuranPage] surah search failed:", error);
        }
      } finally {
        if (requestId === requestIdRef.current) setIsSearchingSurahs(false);
      }
    }, SURAH_SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [query, surahs]);

  const filteredSurahs = searchedSurahs;

  const filteredJuz = useMemo(() => {
    const q = query.trim();
    if (!q) return juz;
    return juz.filter((item) => String(item.number) === q);
  }, [juz, query]);

  function handleTogglePlay(surah: QuranSurah) {
    if (!surah.audio) {
      toast.error("Audio murottal surah ini belum tersedia.");
      return;
    }

    if (playingSurah?.id === surah.id) {
      setIsPlaying((prev) => !prev);
      return;
    }

    setPlayingSurah(surah);
    setIsPlaying(true);
  }

  function handleClosePlayer() {
    setPlayingSurah(null);
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
        mobileBackTitle="Al-Qur'an"
      />

      <PageMargin className="lg:pb-10 lg:pt-6">
        <div className="flex flex-col gap-3 lg:mx-auto lg:grid lg:max-w-[988px] lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start lg:gap-6">
          <div className="lg:sticky lg:top-20 lg:flex lg:flex-col lg:gap-4">
            <div className="pt-4 lg:pt-0">
              <div className="relative overflow-hidden rounded-2xl bg-[#013334] p-5 text-white lg:min-h-[300px]">
                <div className="relative z-10 max-w-[60%]">
                  <h1 className="text-xl font-bold leading-snug">
                    Yuk, luangkan waktu membaca{" "}
                    <span className="text-secondary">Al-Quran</span>
                  </h1>
                  <p className="mt-2 text-sm text-white/70">
                    Jadikan Al-Quran sebagai penuntun hidup.
                  </p>
                </div>
                <div className="pointer-events-none absolute bottom-0 right-0">
                  <div className="relative inline-flex">
                    <Image
                      src={BANNER_ILLUSTRATION_URL}
                      alt="Ilustrasi Al-Qur'an"
                      width={1417}
                      height={1110}
                      className="block h-36 w-auto lg:h-44"
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#013334]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={playingSurah ? "pb-24 lg:pb-0" : "pb-6 lg:pb-0"}>
            <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
              <label className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#7b8190]" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Cari surah atau juz..."
                  className="h-11 w-full rounded-full border border-[#dbe3ef] bg-white pl-10 pr-4 text-sm text-[#172033] outline-none transition placeholder:text-[#7b8190] focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </label>

              <div className="flex gap-1 rounded-full border border-[#e6e9ef] bg-white p-1">
                <button
                  type="button"
                  onClick={() => setTab("surah")}
                  className={tabClassName(tab === "surah")}
                >
                  Surah
                </button>
                <button
                  type="button"
                  onClick={() => setTab("juz")}
                  className={tabClassName(tab === "juz")}
                >
                  Juz
                </button>
              </div>
            </div>

            <div className="flex flex-col divide-y divide-[#e6e9ef] rounded-2xl border border-[#e6e9ef] bg-white px-4">
              {tab === "surah" ? (
                isSearchingSurahs ? (
                  <p className="py-10 text-center text-sm text-[#5f6573]">
                    Mencari...
                  </p>
                ) : filteredSurahs.length === 0 ? (
                  <p className="py-10 text-center text-sm text-[#5f6573]">
                    Surah tidak ditemukan.
                  </p>
                ) : (
                  filteredSurahs.map((surah) => (
                    <SurahRow
                      key={surah.id}
                      surah={surah}
                      isPlaying={isPlaying && playingSurah?.id === surah.id}
                      onTogglePlay={() => handleTogglePlay(surah)}
                    />
                  ))
                )
              ) : filteredJuz.length === 0 ? (
                <p className="py-10 text-center text-sm text-[#5f6573]">
                  Juz tidak ditemukan.
                </p>
              ) : (
                filteredJuz.map((item) => <JuzRow key={item.id} juz={item} />)
              )}
            </div>
          </div>
        </div>
      </PageMargin>

      {playingSurah && (
        <QuranMiniPlayer
          key={playingSurah.id}
          track={{
            id: `surah-${playingSurah.id}`,
            title: playingSurah.name_latin,
            subtitle: "Sedang diputar",
            audioUrl: playingSurah.audio!,
          }}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying((prev) => !prev)}
          onClose={handleClosePlayer}
        />
      )}

      <BottomNav userId={viewer.userId} username={viewer.username} />
    </div>
  );
}
