"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Notification } from "@/apis/notifications";
import { loadMoreNotifications, markNotificationsAsRead } from "@/lib/actions";
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
  const [items, setItems] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef(1);
  const loadingRef = useRef(false);

  const unreadCount = items.filter((item) => !item.read_at).length;

  const loadNextPage = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;
    setLoadingMore(true);
    try {
      const nextPage = pageRef.current + 1;
      const result = await loadMoreNotifications(nextPage);
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

  function handleRead(id: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id && !item.read_at
          ? { ...item, read_at: new Date().toISOString() }
          : item
      )
    );
    markNotificationsAsRead([id]);
  }

  function handleMarkAllRead() {
    if (unreadCount === 0) return;
    setItems((prev) =>
      prev.map((item) =>
        item.read_at ? item : { ...item, read_at: new Date().toISOString() }
      )
    );
    markNotificationsAsRead();
  }

  return (
    <div className="min-h-screen bg-white pb-16 lg:pb-0">
      <Header
        fullName={viewer.fullName}
        avatar={viewer.avatar}
        userId={viewer.userId}
        username={viewer.username}
        verificationStatus={viewer.verificationStatus}
        mobileBackTitle="Notifikasi"
        mobileMenu={
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="flex w-full cursor-pointer items-center px-4 py-2.5 text-left text-sm font-medium text-[#172033] transition hover:bg-[#f5f7fb] disabled:cursor-not-allowed disabled:text-[#9aa1ad] disabled:hover:bg-transparent"
          >
            Tandai semua dibaca
          </button>
        }
        mobileMenuLabel="Menu notifikasi"
      />

      <PageMargin noMobilePadding className="pb-6 lg:pt-6">
        <main className="min-w-0">
          <div className="hidden items-center justify-between pb-5 lg:flex">
            <h1 className="font-stack-sans-headline text-2xl font-medium text-[#172033]">
              Notifikasi
            </h1>
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className="cursor-pointer text-sm font-medium text-primary transition hover:text-primary-dark disabled:cursor-not-allowed disabled:text-[#9aa1ad]"
            >
              Tandai semua dibaca
            </button>
          </div>
          <div className="flex flex-col divide-y divide-[#e6e9ef] bg-white">
            {items.length === 0 && (
              <p className="px-5 py-10 text-center text-sm text-[#5f6573]">
                Belum ada notifikasi.
              </p>
            )}

            {items.map((item) => (
              <NotificationRow
                key={item.id}
                notification={item}
                onRead={handleRead}
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
        </main>
      </PageMargin>

      <BottomNav userId={viewer.userId} username={viewer.username} />
    </div>
  );
}
