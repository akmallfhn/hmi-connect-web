"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query";
import type { Feed } from "@/apis/feeds";
import type { ComposerAuthorEntity } from "@/components/forms/CreateFeedForms";
import type { UserStatusEnum, VerificationStatusEnum } from "@/lib/types";
import FeedItemCard from "./FeedItemCard";
import Button from "../buttons/Button";

type PostItem = { feed: Feed };
type FeedPage<Item extends PostItem> = { list: Item[]; hasMore: boolean };

export type PostTimelineViewer = {
  id?: string;
  name?: string;
  avatar?: string;
  status?: UserStatusEnum;
  verificationStatus?: VerificationStatusEnum;
};

interface FeedPostTimelineProps<Item extends PostItem> {
  queryKey: QueryKey;
  loadPage: (page: number) => Promise<FeedPage<Item>>;
  initialItems: Item[];
  initialHasMore: boolean;
  viewer: PostTimelineViewer;
  actingEntity?: ComposerAuthorEntity | null;
  // Set when the viewer may delete these posts, so a deleted card leaves the list.
  canRemove?: boolean;
}

// The infinite list of full feed cards behind every profile's Post tab.
export default function FeedPostTimeline<Item extends PostItem>({
  queryKey,
  loadPage,
  initialItems,
  initialHasMore,
  viewer,
  actingEntity,
  canRemove = false,
}: FeedPostTimelineProps<Item>) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => loadPage(pageParam),
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
    queryClient.setQueryData<InfiniteData<FeedPage<Item>, number>>(queryKey, (data) =>
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
              onDeleted={canRemove ? removeFeed : undefined}
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
