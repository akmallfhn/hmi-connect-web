"use client";

import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { ArticleListEntry } from "@/apis/articles";
import { loadMoreUserArticles } from "@/lib/actions";
import ArticleListRow from "../articles/ArticleListRow";
import Button from "../buttons/Button";

interface ProfileArticlesTimelineProps {
  username: string;
  initialItems: ArticleListEntry[];
  initialHasMore: boolean;
  initialLoaded?: boolean;
  viewerId?: string;
}

export default function ProfileArticlesTimeline({
  username,
  initialItems,
  initialHasMore,
  initialLoaded = true,
  viewerId,
}: ProfileArticlesTimelineProps) {
  const query = useInfiniteQuery({
    queryKey: ["profile-articles", viewerId ?? "public", username],
    queryFn: ({ pageParam }) => loadMoreUserArticles(username, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + 1 : undefined,
    initialData: initialLoaded
      ? {
          pages: [{ list: initialItems, hasMore: initialHasMore }],
          pageParams: [1],
        }
      : undefined,
  });
  const { hasNextPage, isFetching, fetchNextPage } = query;
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage || isFetching) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void fetchNextPage();
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetching]);

  const empty = query.data?.pages.every((page) => page.list.length === 0);
  const seen = new Set<string>();

  return (
    <div className="flex flex-col divide-y divide-divider">
      {query.isPending && (
        <p
          role="status"
          className="py-12 text-center text-sm text-muted-foreground"
        >
          Memuat...
        </p>
      )}
      {query.isError && (
        <div className="py-8 text-center text-sm text-muted-foreground">
          <p>Gagal memuat artikel.</p>
          <Button
            variant="outline"
            onClick={() => {
              void query.refetch();
            }}
          >
            Coba lagi
          </Button>
        </div>
      )}
      {empty && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Belum ada artikel yang terbit.
        </p>
      )}
      {query.data?.pages.flatMap((page) =>
        page.list.map((article) => {
          if (seen.has(article.id)) return null;
          seen.add(article.id);
          return (
            <ArticleListRow
              key={article.id}
              article={article}
              viewerId={viewerId}
            />
          );
        }),
      )}
      {hasNextPage && <div ref={sentinelRef} className="h-4" />}
      {query.isFetchingNextPage && (
        <p className="py-4 text-center text-xs text-muted-foreground">
          Memuat...
        </p>
      )}
    </div>
  );
}
