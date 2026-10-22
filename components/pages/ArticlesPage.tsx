"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import type { ArticleFeedTab, ArticleListEntry } from "@/apis/articles";
import type { NewsArticle } from "@/apis/news";
import {
  articleFeedQueryOptions,
  type ArticlesTab,
  type ArticleFeedPage,
} from "@/lib/article-query";
import type { VerificationStatusEnum } from "@/lib/types";
import ArticleListRow from "../articles/ArticleListRow";
import Button from "../buttons/Button";
import PageMargin from "../common/PageMargin";
import Tabs from "../common/Tabs";
import NewsArticleCard from "../news/NewsArticleCard";
import BottomNav from "../navigations/BottomNav";
import Header from "../navigations/Header";

const TABS: {
  value: ArticlesTab;
  label: string;
  empty: string;
  href: string;
}[] = [
  {
    value: "all",
    label: "Semua",
    empty: "Belum ada artikel yang terbit.",
    href: "/articles",
  },
  {
    value: "news",
    label: "News",
    empty: "Belum ada berita.",
    href: "/articles?tab=news",
  },
  {
    value: "following",
    label: "Mengikuti",
    empty: "Belum ada artikel dari orang yang kamu ikuti.",
    href: "/articles?tab=following",
  },
  {
    value: "me",
    label: "Tulisan Saya",
    empty: "Kamu belum menulis artikel.",
    href: "/articles?tab=me",
  },
];

interface ViewerProps {
  fullName?: string;
  avatar?: string;
  userId?: string;
  username?: string;
  verificationStatus?: VerificationStatusEnum;
}

type ArticlesPageProps = { viewer: ViewerProps; showPrivateTabs: boolean } & (
  | {
      activeTab: ArticleFeedTab;
      initialItems: ArticleListEntry[];
      initialHasMore: boolean;
    }
  | { activeTab: "news"; initialItems: NewsArticle[]; initialHasMore: boolean }
);

export default function ArticlesPage(props: ArticlesPageProps) {
  const { viewer, showPrivateTabs } = props;
  const searchParams = useSearchParams();
  const client = useQueryClient();
  const requestedTab = searchParams.get("tab");
  const activeTab = showPrivateTabs
    ? (TABS.find((item) => item.value === requestedTab)?.value ?? "all")
    : "all";
  const initial: ArticleFeedPage | undefined =
    activeTab !== props.activeTab
      ? undefined
      : props.activeTab === "news"
        ? {
            kind: "news",
            list: props.initialItems,
            hasMore: props.initialHasMore,
          }
        : {
            kind: "articles",
            list: props.initialItems,
            hasMore: props.initialHasMore,
          };
  const query = useInfiniteQuery(
    articleFeedQueryOptions(activeTab, viewer.userId, initial),
  );
  const { fetchNextPage, hasNextPage, isFetching } = query;
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

  function selectTab(tab: ArticlesTab) {
    if (tab === activeTab) return;
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "all") params.delete("tab");
    else params.set("tab", tab);
    const queryString = params.toString();
    window.history.pushState(
      null,
      "",
      queryString ? `?${queryString}` : "/articles",
    );
  }

  const empty = query.data?.pages.every((page) => page.list.length === 0);
  const seen = new Set<string>();
  return (
    <div className="min-h-screen bg-surface pb-16 lg:pb-0">
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
          <h1 className="font-stack-sans-headline hidden pb-4 text-2xl font-medium text-heading lg:block">
            Artikel
          </h1>
          {showPrivateTabs && (
            <Tabs
              ariaLabel="Konten artikel"
              items={TABS}
              activeValue={activeTab}
              onChange={selectTab}
              onPrefetch={(tab) => {
                void client.prefetchInfiniteQuery(
                  articleFeedQueryOptions(tab, viewer.userId),
                );
              }}
              className="w-full lg:w-fit"
            />
          )}
          <div
            aria-busy={query.isPending}
            className="mt-2 flex flex-col divide-y divide-divider"
          >
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
                <p>Gagal memuat konten.</p>
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
              <p className="py-12 text-center text-sm text-muted-foreground">
                {TABS.find((item) => item.value === activeTab)?.empty}
              </p>
            )}
            {query.data?.pages.map((page) =>
              page.kind === "news"
                ? page.list.map((article) => {
                    if (seen.has(article.id)) return null;
                    seen.add(article.id);
                    return (
                      <NewsArticleCard
                        key={article.id}
                        article={article}
                        variant="list"
                      />
                    );
                  })
                : page.list.map((article) => {
                    if (seen.has(article.id)) return null;
                    seen.add(article.id);
                    return (
                      <ArticleListRow
                        key={article.id}
                        article={article}
                        viewerId={viewer.userId}
                      />
                    );
                  }),
            )}
          </div>
          {hasNextPage && <div ref={sentinelRef} className="h-4" />}
          {query.isFetchingNextPage && (
            <p className="py-4 text-center text-sm text-disabled-foreground">
              Memuat...
            </p>
          )}
        </main>
      </PageMargin>
      <BottomNav userId={viewer.userId} username={viewer.username} />
    </div>
  );
}
