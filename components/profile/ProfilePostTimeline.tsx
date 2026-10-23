"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import type { FeedTimelineItem } from "@/apis/feeds";
import type { ComposerAuthorEntity } from "@/components/forms/CreateFeedForms";
import { loadMoreUserFeeds } from "@/lib/actions";
import type { UserStatusEnum, VerificationStatusEnum } from "@/lib/types";
import FeedItemCard from "../feeds/FeedItemCard";
import Button from "../buttons/Button";

type FeedPage = { list: FeedTimelineItem[]; hasMore: boolean };
type FeedData = InfiniteData<FeedPage, number>;

interface ProfilePostTimelineProps {
  username: string;
  profileUserId?: string;
  initialItems: FeedTimelineItem[];
  initialHasMore: boolean;
  viewer: {
    id?: string;
    name?: string;
    avatar?: string;
    status?: UserStatusEnum;
    verificationStatus?: VerificationStatusEnum;
  };
  actingEntity?: ComposerAuthorEntity | null;
}

export default function ProfilePostTimeline({
  username,
  profileUserId,
  initialItems,
  initialHasMore,
  viewer,
  actingEntity,
}: ProfilePostTimelineProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const queryKey = ["profile-posts", viewer.id ?? "public", username] as const;
  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => loadMoreUserFeeds(username, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + 1 : undefined,
    initialData: {
      pages: [{ list: initialItems, hasMore: initialHasMore }],
      pageParams: [1],
    },
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

  function removeFeed(feedId: string) {
    queryClient.setQueryData<FeedData>(queryKey, (data) =>
      data
        ? {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              list: page.list.filter((item) => item.feed.id !== feedId),
            })),
          }
        : data,
    );
    router.refresh();
  }

  const seen = new Set<string>();
  const empty = query.data?.pages.every((page) => page.list.length === 0);

  return (
    <div className="flex flex-col gap-1.5 lg:gap-4">
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
          <p>Gagal memuat post.</p>
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
        <p className="rounded-xl border border-dashed border-border-strong px-4 py-5 text-center text-sm text-muted-foreground">
          Belum ada post.
        </p>
      )}
      {query.data?.pages.flatMap((page) =>
        page.list.map((item) => {
          if (seen.has(item.feed.id)) return null;
          seen.add(item.feed.id);
          return (
            <FeedItemCard
              key={item.feed.id}
              feed={item.feed}
              currentUserId={viewer.id}
              currentUserName={viewer.name}
              currentUserAvatar={viewer.avatar}
              userStatus={viewer.status}
              verificationStatus={viewer.verificationStatus}
              authorEntity={actingEntity ?? undefined}
              onDeleted={
                viewer.id === profileUserId && !actingEntity
                  ? removeFeed
                  : undefined
              }
            />
          );
        }),
      )}
      {hasNextPage && <div ref={sentinelRef} className="h-12" />}
      {query.isFetchingNextPage && (
        <p className="text-center text-xs text-muted-foreground">Memuat...</p>
      )}
    </div>
  );
}
