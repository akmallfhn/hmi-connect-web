"use client";

import { Repeat2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Avatar from "../common/Avatar";
import FeedItemCard from "./FeedItemCard";
import CreateFeedForms from "../forms/CreateFeedForms";
import type { Feed, FeedTimelineItem } from "@/apis/feeds";
import { loadMoreFeeds } from "@/lib/actions";

interface FeedTimelineProps {
  initialItems: FeedTimelineItem[];
  initialHasMore: boolean;
  currentUserId?: string;
  currentUserName?: string;
  currentUserAvatar?: string;
  isVerified?: boolean;
}

export default function FeedTimeline({
  initialItems,
  initialHasMore,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  isVerified,
}: FeedTimelineProps) {
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
      const result = await loadMoreFeeds(nextPage);
      setItems((prev) => [...prev, ...result.list]);
      setHasMore(result.hasMore);
      pageRef.current = nextPage;
    } finally {
      loadingRef.current = false;
      setLoadingMore(false);
    }
  }, [hasMore]);

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

  function handleFeedDeleted(feedId: string) {
    setItems((prev) => prev.filter((item) => item.feed.id !== feedId));
  }

  function handleFeedCreated(feed: Feed) {
    setItems((prev) => [
      { type: "feed", created_at: feed.created_at, feed },
      ...prev,
    ]);
  }

  const repostedFeedIds = new Set(
    items
      .filter((item) => item.type === "repost" && item.reposter_id === currentUserId)
      .map((item) => item.feed.id)
  );

  return (
    <div className="flex flex-col gap-4">
      <CreateFeedForms
        fullName={currentUserName}
        avatar={currentUserAvatar}
        userId={currentUserId}
        onCreated={handleFeedCreated}
      />

      <div className="flex flex-col gap-1.5 lg:gap-4">
        {items.length === 0 && (
          <div className="rounded-2xl border border-[#e6e9ef] bg-white p-8 text-center text-sm text-[#5f6573] shadow-sm">
            Belum ada postingan. Jadilah yang pertama membagikan sesuatu!
          </div>
        )}

        {items.map((item, index) => (
          <div
            key={`${item.type}-${item.feed.id}-${index}`}
            className="flex flex-col gap-2"
          >
            {item.type === "repost" && (
              <div className="flex items-center gap-2 px-1 text-xs font-medium text-[#5f6573]">
                <Repeat2 className="size-3.5" />
                <Avatar
                  src={item.reposter_avatar}
                  name={item.reposter_full_name}
                  size={18}
                />
                <span>{item.reposter_full_name} membagikan ulang</span>
              </div>
            )}
            <FeedItemCard
              feed={item.feed}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              currentUserAvatar={currentUserAvatar}
              isVerified={isVerified}
              initialReposted={repostedFeedIds.has(item.feed.id)}
              onDeleted={handleFeedDeleted}
              onFeedCreated={handleFeedCreated}
            />
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
  );
}
