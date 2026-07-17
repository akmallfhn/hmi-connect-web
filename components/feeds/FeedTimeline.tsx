"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import FeedItemCard from "./FeedItemCard";
import CreateFeedForms from "../forms/CreateFeedForms";
import type { Feed, FeedTimelineItem } from "@/apis/feeds";
import { loadMoreFeeds } from "@/lib/actions";
import { COMPOSE_INTENT_KEY } from "@/lib/constants";

interface FeedTimelineProps {
  initialItems: FeedTimelineItem[];
  initialHasMore: boolean;
  currentUserId?: string;
  currentUserName?: string;
  currentUserAvatar?: string;
  isVerified?: boolean;
  newsCard?: ReactNode;
  suggestedConnectionsCard?: ReactNode;
  quickMenu?: ReactNode;
}

// Index (0-based) after which each inline card is inserted into the feed — after the 3rd and 6th posts.
// Mobile-only (lg:hidden): at lg+ these same cards render as a persistent sidebar via RightSidebar instead.
const NEWS_CARD_AFTER_INDEX = 2;
const SUGGESTED_CONNECTIONS_AFTER_INDEX = 5;

export default function FeedTimeline({
  initialItems,
  initialHasMore,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  isVerified,
  newsCard,
  suggestedConnectionsCard,
  quickMenu,
}: FeedTimelineProps) {
  const [items, setItems] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef(1);
  const loadingRef = useRef(false);
  const [composerSignal, setComposerSignal] = useState(0);

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

  useEffect(() => {
    function consumeComposeIntent() {
      if (!window.sessionStorage.getItem(COMPOSE_INTENT_KEY)) return;
      window.sessionStorage.removeItem(COMPOSE_INTENT_KEY);
      setComposerSignal((prev) => prev + 1);
    }

    consumeComposeIntent();
    window.addEventListener(COMPOSE_INTENT_KEY, consumeComposeIntent);
    return () => window.removeEventListener(COMPOSE_INTENT_KEY, consumeComposeIntent);
  }, []);

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
      .filter(
        (item) => item.type === "repost" && item.reposter_id === currentUserId
      )
      .map((item) => item.feed.id)
  );

  return (
    <div className="flex flex-col gap-1.5 lg:gap-4">
      <CreateFeedForms
        fullName={currentUserName}
        avatar={currentUserAvatar}
        userId={currentUserId}
        onCreated={handleFeedCreated}
        forceOpenSignal={composerSignal}
      />

      {quickMenu && <div className="lg:hidden">{quickMenu}</div>}

      <div className="flex flex-col gap-1.5 lg:gap-4">
        {items.length === 0 && (
          <div className="rounded-2xl border border-[#e6e9ef] bg-white p-8 text-center text-sm text-[#5f6573] shadow-sm">
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
              isVerified={isVerified}
              initialReposted={repostedFeedIds.has(item.feed.id)}
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
            {index === NEWS_CARD_AFTER_INDEX && newsCard && (
              <div className="lg:hidden">{newsCard}</div>
            )}
            {index === SUGGESTED_CONNECTIONS_AFTER_INDEX &&
              suggestedConnectionsCard && (
                <div className="lg:hidden">{suggestedConnectionsCard}</div>
              )}
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
