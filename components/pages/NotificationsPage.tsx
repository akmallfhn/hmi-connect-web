"use client";

import { useCallback, useEffect, useRef } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import type { Notification } from "@/apis/notifications";
import { useNotificationRead } from "@/hooks/useNotificationRead";
import {
  activityKeys,
  mapActivity,
  notificationsQueryOptions,
  uniqueActivityItems,
  type ActivityData,
} from "@/lib/activity-query";
import type { VerificationStatusEnum } from "@/lib/types";
import PageMargin from "../common/PageMargin";
import BottomNav from "../navigations/BottomNav";
import Header from "../navigations/Header";
import NotificationRow from "../notifications/NotificationRow";

interface ViewerProps {
  fullName?: string;
  avatar?: string;
  userId?: string;
  username?: string;
  verificationStatus?: VerificationStatusEnum;
}

interface NotificationsPageProps {
  viewer: ViewerProps;
  initialItems: Notification[];
  initialHasMore: boolean;
}

export default function NotificationsPage({
  viewer,
  initialItems,
  initialHasMore,
}: NotificationsPageProps) {
  const client = useQueryClient();
  const query = useInfiniteQuery(
    notificationsQueryOptions(viewer.userId, {
      list: initialItems,
      hasMore: initialHasMore,
    }),
  );
  const { mutate: markRead } = useNotificationRead(viewer.userId, {
    pages: [{ list: initialItems, hasMore: initialHasMore }],
    pageParams: [1],
  });
  const items = uniqueActivityItems(query.data);
  const hasMore = query.hasNextPage;
  const loadingMore = query.isFetchingNextPage;
  const { fetchNextPage, isFetching } = query;
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadNextPage = useCallback(async () => {
    if (hasMore && !isFetching) await fetchNextPage();
  }, [hasMore, isFetching, fetchNextPage]);

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

  function handleRead(id: string) {
    markRead([id]);
  }

  // Update every badge through the shared cache before the server responds.
  const markedAllRef = useRef(false);
  useEffect(() => {
    if (markedAllRef.current) return;
    markedAllRef.current = true;
    markRead(undefined);
  }, [markRead]);

  return (
    <div className="min-h-screen bg-surface pb-16 lg:pb-0">
      <Header
        fullName={viewer.fullName}
        avatar={viewer.avatar}
        userId={viewer.userId}
        username={viewer.username}
        verificationStatus={viewer.verificationStatus}
        mobileBackTitle="Notifikasi"
      />

      <PageMargin noMobilePadding className="pb-6 lg:pt-6">
        <main className="min-w-0">
          <h1 className="hidden pb-5 font-stack-sans-headline text-2xl font-medium text-heading lg:block">
            Notifikasi
          </h1>
          <div className="flex flex-col divide-y divide-divider bg-surface">
            {items.length === 0 && (
              <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                Belum ada notifikasi.
              </p>
            )}

            {items.map((item) => (
              <NotificationRow
                key={item.id}
                notification={item}
                onRead={handleRead}
                onUpdate={(id, patch) =>
                  client.setQueryData<ActivityData<Notification>>(
                    activityKeys.notifications(viewer.userId),
                    (data) =>
                      mapActivity(data, (item) =>
                        item.id === id ? { ...item, ...patch } : item,
                      ),
                  )
                }
              />
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
        </main>
      </PageMargin>

      <BottomNav userId={viewer.userId} username={viewer.username} />
    </div>
  );
}
