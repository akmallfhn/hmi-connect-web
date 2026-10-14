"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ActivityEntry } from "@/apis/feeds";
import ActivityEntryCard from "./ActivityEntryCard";

interface ActivityInfiniteListProps {
  initialItems: ActivityEntry[];
  initialHasMore: boolean;
  // Owned by the caller so a user page and an entity page can hit their own activity endpoint.
  loadMore: (page: number) => Promise<{
    list: ActivityEntry[];
    hasMore: boolean;
  }>;
  emptyMessage: string;
  itemVariant?: "flat" | "card";
  owner?: { name: string; avatar?: string };
  isSignedIn?: boolean;
}

export default function ActivityInfiniteList({
  initialItems,
  initialHasMore,
  loadMore,
  emptyMessage,
  itemVariant = "flat",
  owner,
  isSignedIn = false,
}: ActivityInfiniteListProps) {
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
      const result = await loadMore(nextPage);
      setItems((prev) => [...prev, ...result.list]);
      setHasMore(result.hasMore);
      pageRef.current = nextPage;
    } finally {
      loadingRef.current = false;
      setLoadingMore(false);
    }
  }, [hasMore, loadMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadNextPage();
        }
      },
      { rootMargin: "600px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadNextPage]);

  return (
    <div className={itemVariant === "card" ? "flex flex-col gap-3" : "flex flex-col gap-4"}>
      {items.length === 0 && (
        <p className="rounded-xl border border-dashed border-border-strong px-4 py-5 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      )}

      {items.map((entry, index) => (
        <div
          key={`${entry.type}-${entry.feed.id}-${entry.comment?.id ?? index}`}
          className={
            itemVariant === "card"
              ? ""
              : "border-t border-border pt-4 first:border-t-0 first:pt-0"
          }
        >
          <ActivityEntryCard
            entry={entry}
            variant={itemVariant}
            owner={owner}
            isSignedIn={isSignedIn}
          />
        </div>
      ))}

      {(hasMore || loadingMore) && (
        <div
          ref={sentinelRef}
          className="flex h-12 items-center justify-center text-xs font-medium text-muted-foreground"
        >
          {loadingMore ? "Memuat..." : null}
        </div>
      )}
    </div>
  );
}
