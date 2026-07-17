"use client";

import { Search as SearchIconLucide } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { EducationHistoryEntry, TrainingHistoryEntry } from "@/apis/users";
import type { SearchPersonResult, SearchPostingResult } from "@/apis/search";
import { loadMoreSearchPeople, loadMoreSearchPostings } from "@/lib/actions";
import PageMargin from "../common/PageMargin";
import ProfileSidebar from "../feeds/ProfileSidebar";
import BottomNav from "../navigations/BottomNav";
import Header from "../navigations/Header";
import SearchPersonRow from "../search/SearchPersonRow";
import SearchPostingRow from "../search/SearchPostingRow";

interface ViewerProps {
  fullName?: string;
  avatar?: string;
  userId?: string;
  username?: string;
  isVerified?: boolean;
}

interface ProfileSummary {
  userId?: string;
  fullName?: string;
  avatar?: string;
  headline?: string;
  isVerified?: boolean;
  followingCount?: number;
  followersCount?: number;
  feedCount?: number;
  educationHistories: EducationHistoryEntry[];
  trainingHistories: TrainingHistoryEntry[];
}

interface SearchResult<T> {
  list: T[];
  hasMore: boolean;
}

interface SearchPageProps {
  viewer: ViewerProps;
  initialQuery: string;
  initialPeople: SearchResult<SearchPersonResult>;
  initialPostings: SearchResult<SearchPostingResult>;
  profile: ProfileSummary;
}

export default function SearchPage({
  viewer,
  initialQuery,
  initialPeople,
  initialPostings,
  profile,
}: SearchPageProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState(initialQuery);

  const [peopleItems, setPeopleItems] = useState(initialPeople.list);
  const [peopleHasMore, setPeopleHasMore] = useState(initialPeople.hasMore);
  const [loadingMorePeople, setLoadingMorePeople] = useState(false);
  const [peoplePage, setPeoplePage] = useState(1);

  const [postingItems, setPostingItems] = useState(initialPostings.list);
  const [postingHasMore, setPostingHasMore] = useState(initialPostings.hasMore);
  const [loadingMorePostings, setLoadingMorePostings] = useState(false);
  const [postingPage, setPostingPage] = useState(1);
  const postingSentinelRef = useRef<HTMLDivElement>(null);

  // Server sent fresh results for a new query (typed into Header's desktop box, a shared
  // link, or back/forward) — reset local pagination state and the mobile input to match.
  const [seenQuery, setSeenQuery] = useState(initialQuery);
  if (initialQuery !== seenQuery) {
    setSeenQuery(initialQuery);
    setKeyword(initialQuery);
    setPeopleItems(initialPeople.list);
    setPeopleHasMore(initialPeople.hasMore);
    setPeoplePage(1);
    setPostingItems(initialPostings.list);
    setPostingHasMore(initialPostings.hasMore);
    setPostingPage(1);
  }

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const handle = setTimeout(() => {
      const params = new URLSearchParams();
      if (keyword.trim()) params.set("q", keyword.trim());
      router.replace(`/search${params.toString() ? `?${params}` : ""}`);
    }, 400);
    return () => clearTimeout(handle);
  }, [keyword, router]);

  async function loadMorePeople() {
    if (loadingMorePeople || !peopleHasMore) return;
    setLoadingMorePeople(true);
    try {
      const nextPage = peoplePage + 1;
      const result = await loadMoreSearchPeople(seenQuery, nextPage);
      setPeopleItems((prev) => [...prev, ...result.list]);
      setPeopleHasMore(result.hasMore);
      setPeoplePage(nextPage);
    } finally {
      setLoadingMorePeople(false);
    }
  }

  const loadMorePostings = useCallback(async () => {
    if (loadingMorePostings || !postingHasMore) return;
    setLoadingMorePostings(true);
    try {
      const nextPage = postingPage + 1;
      const result = await loadMoreSearchPostings(seenQuery, nextPage);
      setPostingItems((prev) => [...prev, ...result.list]);
      setPostingHasMore(result.hasMore);
      setPostingPage(nextPage);
    } finally {
      setLoadingMorePostings(false);
    }
  }, [loadingMorePostings, postingHasMore, postingPage, seenQuery]);

  useEffect(() => {
    const sentinel = postingSentinelRef.current;
    if (!sentinel || !postingHasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMorePostings();
      },
      { rootMargin: "600px 0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [postingHasMore, loadMorePostings]);

  const hasKeyword = keyword.trim().length > 0;

  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-16 lg:pb-0">
      <Header
        fullName={viewer.fullName}
        avatar={viewer.avatar}
        userId={viewer.userId}
        username={viewer.username}
        isVerified={viewer.isVerified}
      />

      <PageMargin noMobilePadding className="pb-6 lg:pt-6">
        <div className="mx-auto grid grid-cols-1 gap-1.5 lg:max-w-[900px] lg:grid-cols-[280px_minmax(0,600px)] lg:gap-4">
          <aside className="hidden lg:sticky lg:top-20 lg:block lg:self-start">
            <ProfileSidebar
              userId={profile.userId}
              fullName={profile.fullName}
              avatar={profile.avatar}
              headline={profile.headline}
              username={viewer.username}
              isVerified={profile.isVerified}
              followingCount={profile.followingCount}
              followersCount={profile.followersCount}
              feedCount={profile.feedCount}
              educationHistories={profile.educationHistories}
              trainingHistories={profile.trainingHistories}
            />
          </aside>

          <main className="min-w-0">
            {/* Desktop typing lives in Header's navbar search box instead — see Header.tsx. */}
            <div className="border border-x-0 border-[#e6e9ef] bg-white px-5 py-4 lg:hidden">
              <label className="relative block">
                <span className="sr-only">Cari</span>
                <SearchIconLucide className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#7b8190]" />
                <input
                  type="search"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Cari orang atau postingan..."
                  autoFocus
                  className="h-11 w-full rounded-full border border-[#dbe3ef] bg-[#f5f7fb] pl-10 pr-4 text-sm text-[#172033] outline-none transition placeholder:text-[#7b8190] focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"
                />
              </label>
            </div>

            {!hasKeyword ? (
              <div className="mt-1.5 border border-x-0 border-[#e6e9ef] bg-white lg:mt-0 lg:rounded-2xl lg:border-x lg:shadow-sm">
                <p className="px-5 py-10 text-center text-sm text-[#5f6573]">
                  Ketik kata kunci untuk mencari orang atau postingan.
                </p>
              </div>
            ) : (
              <>
                <section className="mt-1.5 border border-x-0 border-[#e6e9ef] bg-white lg:mt-0 lg:rounded-2xl lg:border-x lg:shadow-sm">
                  <h2 className="px-5 pt-4 text-sm font-semibold text-[#172033]">Orang</h2>
                  {peopleItems.length === 0 ? (
                    <p className="px-5 py-6 text-center text-sm text-[#5f6573]">
                      Tidak ada orang yang cocok dengan &ldquo;{seenQuery}&rdquo;.
                    </p>
                  ) : (
                    <div className="mt-2 flex flex-col divide-y divide-[#e6e9ef]">
                      {peopleItems.map((person) => (
                        <SearchPersonRow key={person.id} person={person} />
                      ))}
                    </div>
                  )}
                  {peopleHasMore && (
                    <div className="px-5 py-3">
                      <button
                        type="button"
                        onClick={loadMorePeople}
                        disabled={loadingMorePeople}
                        className="w-full cursor-pointer py-1.5 text-center text-sm font-semibold text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loadingMorePeople ? "Memuat..." : "Muat lebih banyak"}
                      </button>
                    </div>
                  )}
                </section>

                <section className="mt-1.5 border border-x-0 border-[#e6e9ef] bg-white lg:mt-4 lg:rounded-2xl lg:border-x lg:shadow-sm">
                  <h2 className="px-5 pt-4 text-sm font-semibold text-[#172033]">Postingan</h2>
                  {postingItems.length === 0 ? (
                    <p className="px-5 py-6 text-center text-sm text-[#5f6573]">
                      Tidak ada postingan yang cocok dengan &ldquo;{seenQuery}&rdquo;.
                    </p>
                  ) : (
                    <div className="mt-2 flex flex-col divide-y divide-[#e6e9ef]">
                      {postingItems.map((posting) => (
                        <SearchPostingRow key={posting.id} posting={posting} />
                      ))}
                    </div>
                  )}
                  {(postingHasMore || loadingMorePostings) && (
                    <div
                      ref={postingSentinelRef}
                      className="flex h-12 items-center justify-center text-xs font-medium text-[#5f6573]"
                    >
                      {loadingMorePostings ? "Memuat..." : null}
                    </div>
                  )}
                </section>
              </>
            )}
          </main>
        </div>
      </PageMargin>

      <BottomNav username={viewer.username} />
    </div>
  );
}
