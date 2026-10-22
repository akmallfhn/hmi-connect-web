"use client";

import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { ActivityEntry } from "@/apis/feeds";
import { loadMoreUserActivity } from "@/lib/actions";
import ActivityEntryCard from "./ActivityEntryCard";
import Button from "../buttons/Button";

interface ProfileActivityTimelineProps {
  username: string;
  owner: { name: string; avatar?: string };
  initialItems: ActivityEntry[];
  initialHasMore: boolean;
  initialLoaded?: boolean;
  viewerId?: string;
  isSignedIn: boolean;
}

export default function ProfileActivityTimeline({
  username,
  owner,
  initialItems,
  initialHasMore,
  initialLoaded = true,
  viewerId,
  isSignedIn,
}: ProfileActivityTimelineProps) {
  const query = useInfiniteQuery({
    queryKey: ["profile-activity", viewerId ?? "public", username],
    queryFn: ({ pageParam }) => loadMoreUserActivity(username, pageParam),
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
  }, [hasNextPage, isFetching, fetchNextPage]);

  return (
    <div className="flex flex-col gap-3">
      {query.isPending && (
        <p
          role="status"
          className="py-5 text-center text-sm text-muted-foreground"
        >
          Memuat...
        </p>
      )}
      {query.isError && (
        <div className="text-center text-sm text-muted-foreground">
          <p>Gagal memuat aktivitas.</p>
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
      {query.data?.pages.every((page) => page.list.length === 0) && (
        <p className="rounded-xl border border-dashed border-border-strong px-4 py-5 text-center text-sm text-muted-foreground">
          Belum ada aktivitas.
        </p>
      )}
      {query.data?.pages
        .flatMap((page) => page.list)
        .map((entry, index) => (
          <ActivityEntryCard
            key={`${entry.type}-${entry.feed.id}-${entry.comment?.id ?? index}`}
            entry={entry}
            variant="card"
            owner={owner}
            isSignedIn={isSignedIn}
          />
        ))}
      {hasNextPage && <div ref={sentinelRef} className="h-12" />}
      {query.isFetchingNextPage && (
        <p className="text-center text-xs text-muted-foreground">Memuat...</p>
      )}
    </div>
  );
}
