"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ActivityEntry, Feed } from "@/apis/feeds";
import CreateFeedForms, {
  type ComposerAuthorEntity,
} from "../forms/CreateFeedForms";
import FeedItemCard from "../feeds/FeedItemCard";
import { loadMoreEntityActivity } from "@/lib/actions";
import type { VerificationStatusEnum } from "@/lib/types";

interface OfficialTimelineProps {
  authorEntity: ComposerAuthorEntity;
  initialItems: ActivityEntry[];
  initialHasMore: boolean;
  currentUserId?: string;
  currentUserName?: string;
  currentUserAvatar?: string;
  verificationStatus?: VerificationStatusEnum;
}

export default function OfficialTimeline({
  authorEntity,
  initialItems,
  initialHasMore,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  verificationStatus,
}: OfficialTimelineProps) {
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
      const result = await loadMoreEntityActivity(
        authorEntity.type,
        authorEntity.id,
        nextPage,
      );
      setItems((prev) => [...prev, ...result.list]);
      setHasMore(result.hasMore);
      pageRef.current = nextPage;
    } finally {
      loadingRef.current = false;
      setLoadingMore(false);
    }
  }, [authorEntity.id, authorEntity.type, hasMore]);

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

  function handleFeedDeleted(feedId: string) {
    setItems((prev) => prev.filter((item) => item.feed.id !== feedId));
  }

  // A quote repost posted from here lands under the entity too, so it belongs at the top of this list.
  function handleFeedCreated(feed: Feed) {
    setItems((prev) => [
      { type: "post", created_at: feed.created_at, feed, comment: null },
      ...prev,
    ]);
  }

  return (
    <div className="flex flex-col gap-1.5 lg:gap-4">
      <CreateFeedForms
        fullName={currentUserName}
        avatar={currentUserAvatar}
        userId={currentUserId}
        authorEntity={authorEntity}
        onCreated={handleFeedCreated}
      />

      <div className="flex flex-col gap-1.5 lg:gap-4">
        {items.length === 0 && (
          <div className="rounded-2xl border border-[#e6e9ef] bg-white p-8 text-center text-sm text-[#5f6573] shadow-sm">
            Belum ada postingan. Bagikan kabar pertama dari akun resmi ini!
          </div>
        )}

        {items.map((item, index) => (
          <FeedItemCard
            key={`${item.feed.id}-${index}`}
            feed={item.feed}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            currentUserAvatar={currentUserAvatar}
            verificationStatus={verificationStatus}
            onDeleted={handleFeedDeleted}
            onFeedCreated={handleFeedCreated}
          />
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
