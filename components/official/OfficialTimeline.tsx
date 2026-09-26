"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Feed, FeedTimelineItem } from "@/apis/feeds";
import CreateFeedForms, {
  type ComposerAuthorEntity,
} from "../forms/CreateFeedForms";
import FeedItemCard from "../feeds/FeedItemCard";
import { loadMoreFeeds } from "@/lib/actions";
import type { UserStatusEnum, VerificationStatusEnum } from "@/lib/types";

interface OfficialTimelineProps {
  authorEntity: ComposerAuthorEntity;
  initialItems: FeedTimelineItem[];
  initialHasMore: boolean;
  currentUserId?: string;
  currentUserName?: string;
  currentUserAvatar?: string;
  userStatus?: UserStatusEnum;
  verificationStatus?: VerificationStatusEnum;
}

export default function OfficialTimeline({
  authorEntity,
  initialItems,
  initialHasMore,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  userStatus,
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
      { rootMargin: "600px 0px" },
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
          <div className="rounded-2xl border border-[#e6e9ef] bg-white p-8 text-center text-sm text-[#5f6573]">
            Belum ada postingan. Bagikan kabar pertama dari akun resmi ini!
          </div>
        )}

        {items.map((item, index) => (
          <FeedItemCard
            key={`${item.type}-${item.feed.id}-${index}`}
            feed={item.feed}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            currentUserAvatar={currentUserAvatar}
            userStatus={userStatus}
            verificationStatus={verificationStatus}
            authorEntity={authorEntity}
            repostedBy={
              item.type === "repost"
                ? {
                    fullName: item.reposter_full_name,
                    avatar: item.reposter_avatar,
                  }
                : undefined
            }
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
