"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import FeedItemCard from "./FeedItemCard";
import CreateFeedForms from "../forms/CreateFeedForms";
import type { Feed, FeedTimelineItem } from "@/apis/feeds";
import { loadMoreFeeds } from "@/lib/actions";
import { useFeedComposeIntent } from "@/hooks/useFeedComposeIntent";
import type { UserStatusEnum, VerificationStatusEnum } from "@/lib/types";

interface FeedTimelineProps {
  initialItems: FeedTimelineItem[];
  initialHasMore: boolean;
  currentUserId?: string;
  currentUserName?: string;
  currentUserAvatar?: string;
  userStatus?: UserStatusEnum;
  verificationStatus?: VerificationStatusEnum;
  insertions?: TimelineInsertion[];
  quickMenu?: ReactNode;
}

// One ordered pass, never a modulo — the pool is finite, so a cycle would replay old rows.
export type TimelineInsertion = {
  // 0-based feed index this card is rendered after, counting posts only.
  after: number;
  node: ReactNode;
  // For a card the lg+ RightSidebar already shows permanently.
  mobileOnly?: boolean;
};

export default function FeedTimeline({
  initialItems,
  initialHasMore,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  userStatus,
  verificationStatus,
  insertions = [],
  quickMenu,
}: FeedTimelineProps) {
  const [items, setItems] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef(1);
  const loadingRef = useRef(false);
  const composeIntent = useFeedComposeIntent();

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
      {
        type: feed.repost_of_id ? "quote_repost" : "post",
        created_at: feed.created_at,
        feed,
      },
      ...prev,
    ]);
  }

  const insertionsByIndex = new Map(
    insertions.map((insertion) => [insertion.after, insertion])
  );
  // A thin timeline never reaches the later slots, so they land after the last post instead.
  const trailingInsertions = insertions.filter(
    (insertion) => insertion.after >= items.length
  );

  return (
    <div className="flex flex-col gap-1.5 lg:gap-4">
      <CreateFeedForms
        fullName={currentUserName}
        avatar={currentUserAvatar}
        userId={currentUserId}
        onCreated={handleFeedCreated}
        {...composeIntent}
      />

      {quickMenu && <div className="lg:hidden">{quickMenu}</div>}

      <div className="flex flex-col gap-1.5 lg:gap-4">
        {items.length === 0 && (
          <div className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-muted-foreground">
            Belum ada postingan. Jadilah yang pertama membagikan sesuatu!
          </div>
        )}

        {items.map((item, index) => (
          <div
            key={`${item.type}-${item.feed.id}-${index}`}
            className="contents"
          >
            <FeedItemCard
              feed={item.feed}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              currentUserAvatar={currentUserAvatar}
              userStatus={userStatus}
              verificationStatus={verificationStatus}
              onDeleted={handleFeedDeleted}
              onFeedCreated={handleFeedCreated}
            />
            {renderInsertion(insertionsByIndex.get(index))}
          </div>
        ))}

        {!hasMore &&
          trailingInsertions.map((insertion) => (
            <div key={`trailing-${insertion.after}`} className="contents">
              {renderInsertion(insertion)}
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
    </div>
  );
}

function renderInsertion(insertion: TimelineInsertion | undefined) {
  if (!insertion) return null;
  if (!insertion.mobileOnly) return insertion.node;
  return <div className="lg:hidden">{insertion.node}</div>;
}
