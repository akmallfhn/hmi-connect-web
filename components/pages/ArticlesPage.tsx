"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ArticleFeedTab, ArticleListEntry } from "@/apis/articles";
import type { NewsArticle } from "@/apis/news";
import { loadMoreArticles, loadMoreNewsArticles } from "@/lib/actions";
import type { VerificationStatusEnum } from "@/lib/types";
import ArticleListRow from "../articles/ArticleListRow";
import PageMargin from "../common/PageMargin";
import Tabs from "../common/Tabs";
import NewsArticleCard from "../news/NewsArticleCard";
import BottomNav from "../navigations/BottomNav";
import Header from "../navigations/Header";

type ArticlesTab = ArticleFeedTab | "news";

const TABS: { tab: ArticlesTab; label: string; empty: string }[] = [
  { tab: "all", label: "Semua", empty: "Belum ada artikel yang terbit." },
  { tab: "news", label: "News", empty: "Belum ada berita." },
  { tab: "following", label: "Mengikuti", empty: "Belum ada artikel dari orang yang kamu ikuti." },
  { tab: "me", label: "Tulisan Saya", empty: "Kamu belum menulis artikel." },
];

const TAB_ITEMS = TABS.map(({ tab, label }) => ({
  value: tab,
  label,
  href: tab === "all" ? "/articles" : `/articles?tab=${tab}`,
}));

interface ViewerProps {
  fullName?: string;
  avatar?: string;
  userId?: string;
  username?: string;
  verificationStatus?: VerificationStatusEnum;
}

type ArticlesPageProps = {
  viewer: ViewerProps;
  showPrivateTabs: boolean;
} & (
  | {
      activeTab: ArticleFeedTab;
      initialItems: ArticleListEntry[];
      initialHasMore: boolean;
    }
  | {
      activeTab: "news";
      initialItems: NewsArticle[];
      initialHasMore: boolean;
    }
);

function ArticleFeed({
  activeTab,
  initialItems,
  initialHasMore,
  viewerId,
}: {
  activeTab: ArticleFeedTab;
  initialItems: ArticleListEntry[];
  initialHasMore: boolean;
  viewerId?: string;
}) {
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
        if (entries.some((entry) => entry.isIntersecting)) loadNextPage();
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadNextPage]);

  return (
    <>
      <div className="mt-2 flex flex-col divide-y divide-[#e6e9ef]">
        {items.length === 0 && (
          <p className="py-12 text-center text-sm text-[#5f6573] lg:text-[15px]">
            {TABS.find((item) => item.tab === activeTab)?.empty}
          </p>
        )}
        {items.map((article) => (
          <ArticleListRow key={article.id} article={article} viewerId={viewerId} />
        ))}
      </div>
      {hasMore && <div ref={sentinelRef} className="h-4" />}
      {loadingMore && <p className="py-4 text-center text-sm text-[#8a909d]">Memuat...</p>}
    </>
  );
}

function NewsFeed({
  initialItems,
  initialHasMore,
}: {
  initialItems: NewsArticle[];
  initialHasMore: boolean;
}) {
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
      const result = await loadMoreNewsArticles(nextPage);
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
        if (entries.some((entry) => entry.isIntersecting)) loadNextPage();
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadNextPage]);

  return (
    <>
      <div className="mt-2 flex flex-col divide-y divide-[#e6e9ef]">
        {items.length === 0 && (
          <p className="py-12 text-center text-sm text-[#5f6573]">
            Belum ada berita.
          </p>
        )}
        {items.map((article) => (
          <NewsArticleCard key={article.id} article={article} variant="list" />
        ))}
      </div>
      {hasMore && <div ref={sentinelRef} className="h-4" />}
      {loadingMore && <p className="py-4 text-center text-sm text-[#8a909d]">Memuat...</p>}
    </>
  );
}

export default function ArticlesPage(props: ArticlesPageProps) {
  const { viewer, activeTab, showPrivateTabs } = props;

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
          {showPrivateTabs && (
            <Tabs
              ariaLabel="Konten artikel"
              items={TAB_ITEMS}
              activeValue={activeTab}
              className="w-full lg:w-fit"
            />
          )}
          {props.activeTab === "news" ? (
            <NewsFeed
              initialItems={props.initialItems}
              initialHasMore={props.initialHasMore}
            />
          ) : (
            <ArticleFeed
              activeTab={props.activeTab}
              initialItems={props.initialItems}
              initialHasMore={props.initialHasMore}
              viewerId={viewer.userId}
            />
          )}
        </main>
      </PageMargin>
      <BottomNav userId={viewer.userId} username={viewer.username} />
    </div>
  );
}
