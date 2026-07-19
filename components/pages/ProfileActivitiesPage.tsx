"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ActivityEntry, EducationHistoryEntry } from "@/apis/users";
import { loadMoreUserActivity } from "@/lib/actions";
import PageMargin from "../common/PageMargin";
import ActivityEntryCard from "../profile/ActivityEntryCard";
import ProfileSidebar from "../feeds/ProfileSidebar";
import BottomNav from "../navigations/BottomNav";
import Header from "../navigations/Header";

interface ViewerProps {
  fullName?: string;
  avatar?: string;
  userId?: string;
  username?: string;
  isVerified?: boolean;
}

interface ProfileSummary {
  userId: string;
  fullName: string;
  avatar?: string;
  headline?: string;
  isVerified: boolean;
  followingCount: number;
  followersCount: number;
  educationHistories: EducationHistoryEntry[];
}

interface ProfileActivitiesPageProps {
  username: string;
  initialItems: ActivityEntry[];
  initialHasMore: boolean;
  profile: ProfileSummary;
  viewer: ViewerProps;
}

export default function ProfileActivitiesPage({
  username,
  initialItems,
  initialHasMore,
  profile,
  viewer,
}: ProfileActivitiesPageProps) {
  const [items, setItems] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef(1);
  const loadingRef = useRef(false);

  const loadNextPage = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;
    setLoadingMore(true);
    try {
      const nextPage = pageRef.current + 1;
      const result = await loadMoreUserActivity(username, nextPage);
      setItems((prev) => [...prev, ...result.list]);
      setHasMore(result.hasMore);
      pageRef.current = nextPage;
    } finally {
      loadingRef.current = false;
      setLoadingMore(false);
    }
  }, [hasMore, username]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadNextPage();
        }
      },
      { rootMargin: "600px 0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadNextPage]);

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
              username={username}
              isVerified={profile.isVerified}
              followingCount={profile.followingCount}
              followersCount={profile.followersCount}
              educationHistories={profile.educationHistories}
            />
          </aside>

          <main className="min-w-0">
            <div className="border border-x-0 border-[#e6e9ef] bg-white p-5 lg:rounded-2xl lg:border-x lg:shadow-sm">
              <div className="flex flex-col gap-4">
                {items.length === 0 && (
                  <p className="rounded-xl border border-dashed border-[#dbe3ef] px-4 py-5 text-center text-sm text-[#5f6573]">
                    Belum ada aktivitas.
                  </p>
                )}

                {items.map((entry, index) => (
                  <div
                    key={`${entry.type}-${entry.feed.id}-${entry.comment?.id ?? index}`}
                    className="border-t border-[#e6e9ef] pt-4 first:border-t-0 first:pt-0"
                  >
                    <ActivityEntryCard entry={entry} />
                  </div>
                ))}

                {(hasMore || loadingMore) && (
                  <div
                    ref={sentinelRef}
                    className="flex h-12 items-center justify-center text-xs font-medium text-[#5f6573]"
                  >
                    {loadingMore ? "Memuat..." : null}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </PageMargin>

      <BottomNav userId={viewer.userId} username={viewer.username} />
    </div>
  );
}
