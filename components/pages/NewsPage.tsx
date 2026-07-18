"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import type { NewsArticle, NewsCategory } from "@/apis/news";
import { loadMoreNewsArticles } from "@/lib/actions";
import PageMargin from "../common/PageMargin";
import NewsArticleCard from "../news/NewsArticleCard";
import NewsCategoryPreview from "../news/NewsCategoryPreview";
import BottomNav from "../navigations/BottomNav";
import Header from "../navigations/Header";

interface ViewerProps {
  fullName?: string;
  avatar?: string;
  email?: string;
  userId?: string;
  username?: string;
  isVerified?: boolean;
}

interface CategoryPreviewData {
  category: NewsCategory;
  articles: NewsArticle[];
}

interface NewsPageProps {
  viewer: ViewerProps;
  categories: NewsCategory[];
  activeCategorySlug?: string;
  initialItems: NewsArticle[];
  initialHasMore: boolean;
  categoryPreviews?: CategoryPreviewData[];
}

const GRID_ROWS_PER_PREVIEW = 2;
const GRID_COLUMNS = 4;
const ITEMS_PER_PREVIEW = GRID_ROWS_PER_PREVIEW * GRID_COLUMNS;

function pillClassName(active: boolean): string {
  return [
    "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition",
    active
      ? "border-primary bg-primary text-white"
      : "border-[#dbe3ef] bg-white text-[#172033] hover:border-primary/50 hover:text-primary",
  ].join(" ");
}

function CategoryPills({
  categories,
  activeCategorySlug,
}: {
  categories: NewsCategory[];
  activeCategorySlug?: string;
}) {
  return (
    <>
      <Link href="/news" className={pillClassName(!activeCategorySlug)}>
        Semua
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/news/${category.slug}`}
          className={pillClassName(activeCategorySlug === category.slug)}
        >
          {category.name}
        </Link>
      ))}
    </>
  );
}

function chunk<T>(items: T[], size: number): T[][] {
  const groups: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    groups.push(items.slice(i, i + size));
  }
  return groups;
}

export default function NewsPage({
  viewer,
  categories,
  activeCategorySlug,
  initialItems,
  initialHasMore,
  categoryPreviews = [],
}: NewsPageProps) {
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
      const result = await loadMoreNewsArticles(nextPage, activeCategorySlug);
      setItems((prev) => [...prev, ...result.list]);
      setHasMore(result.hasMore);
      pageRef.current = nextPage;
    } finally {
      loadingRef.current = false;
      setLoadingMore(false);
    }
  }, [hasMore, activeCategorySlug]);

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

  const heroItems = items.slice(0, 4);
  const [heroMain, ...heroSide] = heroItems;
  const gridChunks = chunk(items.slice(4), ITEMS_PER_PREVIEW);

  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-16 lg:pb-0">
      <Header
        fullName={viewer.fullName}
        avatar={viewer.avatar}
        email={viewer.email}
        userId={viewer.userId}
        username={viewer.username}
        isVerified={viewer.isVerified}
        mobileBackTitle="HMI News"
        desktopFilterBar={
          <>
            <div className="flex shrink-0 items-center gap-2">
              <Newspaper className="size-4 text-primary" />
              <h1 className="text-sm font-semibold text-[#172033]">HMI News</h1>
            </div>
            <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <CategoryPills
                categories={categories}
                activeCategorySlug={activeCategorySlug}
              />
            </div>
          </>
        }
      />

      {/* Mobile-only: category filter lives at page level, not pinned to the navbar. */}
      <div className="border-b border-[#e6e9ef] lg:hidden">
        <PageMargin className="flex items-center gap-2 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <CategoryPills
            categories={categories}
            activeCategorySlug={activeCategorySlug}
          />
        </PageMargin>
      </div>

      <PageMargin className="py-6">
        {items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#dbe3ef] bg-white px-4 py-10 text-center text-sm text-[#5f6573]">
            Belum ada berita untuk kategori ini.
          </p>
        ) : (
          <div className="flex flex-col gap-10">
            {/* Mobile: Google News-style mixed list — big thumbnail every 4th item, list rows otherwise. */}
            <div className="flex flex-col divide-y divide-[#e6e9ef] lg:hidden">
              {items.map((article, index) => (
                <div key={article.id} className="py-4 first:pt-0">
                  <NewsArticleCard
                    article={article}
                    variant={index % 4 === 0 ? "mobileBig" : "mobileList"}
                  />
                </div>
              ))}
            </div>

            {/* Desktop: top 4 as a hero (1 big + 3 side rows), then a 4-col grid with a category preview every 2 rows. */}
            <div className="hidden flex-col gap-10 lg:flex">
              {heroMain && (
                <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                  <NewsArticleCard article={heroMain} variant="heroMain" />
                  {heroSide.length > 0 && (
                    <div className="flex flex-col gap-4 divide-y divide-[#e6e9ef]">
                      {heroSide.map((article) => (
                        <div key={article.id} className="pt-4 first:pt-0">
                          <NewsArticleCard
                            article={article}
                            variant="heroSide"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {gridChunks.map((group, groupIndex) => (
                <div key={groupIndex} className="flex flex-col gap-10">
                  <div className="grid grid-cols-4 gap-6">
                    {group.map((article) => (
                      <NewsArticleCard
                        key={article.id}
                        article={article}
                        variant="grid"
                      />
                    ))}
                  </div>

                  {groupIndex < categoryPreviews.length && (
                    <NewsCategoryPreview
                      category={categoryPreviews[groupIndex].category}
                      articles={categoryPreviews[groupIndex].articles}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {(hasMore || loadingMore) && (
          <div
            ref={sentinelRef}
            className="flex h-12 items-center justify-center text-xs font-medium text-[#5f6573]"
          >
            {loadingMore ? "Memuat..." : null}
          </div>
        )}
      </PageMargin>

      <BottomNav userId={viewer.userId} username={viewer.username} />
    </div>
  );
}
