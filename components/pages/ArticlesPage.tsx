"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ArticleFeedTab, ArticleListEntry } from "@/apis/articles";
import { loadMoreArticles } from "@/lib/actions";
import type { VerificationStatusEnum } from "@/lib/types";
import ArticleListRow from "../articles/ArticleListRow";
import PageMargin from "../common/PageMargin";
import BottomNav from "../navigations/BottomNav";
import Header from "../navigations/Header";

const TABS: { tab: ArticleFeedTab; label: string; empty: string }[] = [
  {
    tab: "all",
    label: "Semua",
    empty: "Belum ada artikel yang terbit.",
  },
  {
    tab: "following",
    label: "Mengikuti",
    empty: "Belum ada artikel dari orang yang kamu ikuti.",
  },
  {
    tab: "me",
    label: "Saya",
    empty: "Kamu belum menulis artikel.",
  },
];

interface ViewerProps {
  fullName?: string;
  avatar?: string;
  userId?: string;
  username?: string;
  verificationStatus?: VerificationStatusEnum;
}

interface ArticlesPageProps {
  viewer: ViewerProps;
  activeTab: ArticleFeedTab;
  showTabs: boolean;
  initialItems: ArticleListEntry[];
  initialHasMore: boolean;
}

export default function ArticlesPage({
  viewer,
  activeTab,
  showTabs,
  initialItems,
  initialHasMore,
}: ArticlesPageProps) {
  const [items, setItems] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef(1);
  const loadingRef = useRef(false);

  const emptyMessage =
    TABS.find((item) => item.tab === activeTab)?.empty ?? "Belum ada artikel.";

  const loadNextPage = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;
    setLoadingMore(true);
    try {
      const nextPage = pageRef.current + 1;
      const result = await loadMoreArticles(activeTab, nextPage);
      setItems((prev) => [...prev, ...result.list]);
      setHasMore(result.hasMore);
      pageRef.current = nextPage;
    } finally {
      loadingRef.current = false;
      setLoadingMore(false);
    }
  }, [activeTab, hasMore]);

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

  return (
    <div className="min-h-screen bg-white pb-16 lg:pb-0">
      <Header
        fullName={viewer.fullName}
        avatar={viewer.avatar}
        userId={viewer.userId}
        username={viewer.username}
        verificationStatus={viewer.verificationStatus}
        mobileBackTitle="Artikel"
      />

      <PageMargin className="pt-4 pb-6 lg:pt-6">
        <main className="min-w-0">
          <h1 className="font-stack-sans-headline hidden pb-4 text-2xl font-medium text-[#172033] lg:block">
            Artikel
          </h1>

          {showTabs && (
            <div
              role="tablist"
              aria-label="Filter artikel"
              className="flex gap-1 rounded-full border border-[#e6e9ef] bg-white p-1 lg:w-fit"
            >
              {TABS.map(({ tab, label }) => {
                const active = tab === activeTab;
                return (
                  <Link
                    key={tab}
                    href={tab === "all" ? "/articles" : `/articles?tab=${tab}`}
                    role="tab"
                    aria-selected={active}
                    scroll={false}
                    className={`min-w-[96px] flex-1 rounded-full px-4 py-2 text-center text-sm font-semibold transition lg:flex-none ${
                      active ? "bg-primary text-white" : "text-[#5f6573]"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          )}

          <div className="mt-2 flex flex-col divide-y divide-[#e6e9ef]">
            {items.length === 0 && (
              <p className="py-12 text-center text-sm text-[#5f6573] lg:text-[15px]">
                {emptyMessage}
              </p>
            )}

            {items.map((article) => (
              <ArticleListRow
                key={article.id}
                article={article}
                viewerId={viewer.userId}
              />
            ))}
          </div>

          {hasMore && <div ref={sentinelRef} className="h-4" />}
          {loadingMore && (
            <p className="py-4 text-center text-sm text-[#8a909d]">Memuat...</p>
          )}
        </main>
      </PageMargin>

      <BottomNav userId={viewer.userId} username={viewer.username} />
    </div>
  );
}
