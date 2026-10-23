"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { FollowRecommendationEntry } from "@/apis/users";
import { loadMoreFollowRecommendations } from "@/lib/actions";
import type { VerificationStatusEnum } from "@/lib/types";
import Button from "../buttons/Button";
import PageMargin from "../common/PageMargin";
import FollowRecommendationRow from "../feeds/FollowRecommendationRow";
import BottomNav from "../navigations/BottomNav";
import Header from "../navigations/Header";

interface PeopleRecommendationPageProps {
  viewer: {
    fullName?: string;
    avatar?: string;
    userId?: string;
    username?: string;
    verificationStatus?: VerificationStatusEnum;
  };
  initialItems: FollowRecommendationEntry[];
  initialHasMore: boolean;
}

export default function PeopleRecommendationPage({
  viewer,
  initialItems,
  initialHasMore,
}: PeopleRecommendationPageProps) {
  const query = useInfiniteQuery({
    queryKey: ["follow-recommendations", viewer.userId],
    queryFn: ({ pageParam }) => loadMoreFollowRecommendations(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + 1 : undefined,
    initialData: {
      pages: [{ list: initialItems, hasMore: initialHasMore }],
      pageParams: [1],
    },
  });
  const { fetchNextPage, hasNextPage, isFetching } = query;
  const sentinelRef = useRef<HTMLDivElement>(null);
  const recommendations = useMemo(() => {
    const seen = new Set<string>();
    return (
      query.data?.pages.flatMap((page) =>
        page.list.filter((person) => {
          if (seen.has(person.id)) return false;
          seen.add(person.id);
          return true;
        }),
      ) ?? []
    );
  }, [query.data]);

  const loadNextPage = useCallback(async () => {
    if (hasNextPage && !isFetching) await fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetching]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadNextPage();
        }
      },
      { rootMargin: "600px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, loadNextPage]);

  return (
    <div className="min-h-screen bg-surface pb-16 lg:pb-0">
      <Header
        fullName={viewer.fullName}
        avatar={viewer.avatar}
        userId={viewer.userId}
        username={viewer.username}
        verificationStatus={viewer.verificationStatus}
        mobileBackTitle="Mungkin Kamu Kenal"
      />

      <PageMargin noMobilePadding className="pb-6 pt-4 lg:pt-6">
        <main className="min-w-0">
          <h1 className="hidden px-3 pb-5 font-stack-sans-headline text-2xl font-medium text-heading lg:block">
            Mungkin Kamu Kenal
          </h1>

          <section aria-label="Rekomendasi orang untuk diikuti">
            {query.isError ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                <p>Gagal memuat rekomendasi.</p>
                <Button
                  variant="outline"
                  className="mt-3"
                  onClick={() => void query.refetch()}
                >
                  Coba lagi
                </Button>
              </div>
            ) : recommendations.length === 0 ? (
              <p className="px-5 py-12 text-center text-sm text-muted-foreground">
                Belum ada rekomendasi orang untukmu.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 px-3 sm:grid-cols-3 lg:grid-cols-4 lg:px-0 xl:grid-cols-5">
                {recommendations.map((connection) => (
                  <FollowRecommendationRow
                    key={connection.id}
                    connection={connection}
                    variant="card"
                  />
                ))}
              </div>
            )}

            {hasNextPage && <div ref={sentinelRef} className="h-12" />}
            {query.isFetchingNextPage && (
              <p className="py-4 text-center text-xs text-muted-foreground">
                Memuat...
              </p>
            )}
          </section>
        </main>
      </PageMargin>

      <BottomNav userId={viewer.userId} username={viewer.username} />
    </div>
  );
}
