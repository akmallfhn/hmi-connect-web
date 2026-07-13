"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import type { NewsArticle, NewsCategory } from "@/apis/news";
import { loadMoreNewsArticles } from "@/lib/actions";
import PageMargin from "../common/PageMargin";
import NewsArticleCard from "../news/NewsArticleCard";
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

interface NewsPageProps {
  viewer: ViewerProps;
  categories: NewsCategory[];
  activeCategorySlug?: string;
  initialItems: NewsArticle[];
  initialHasMore: boolean;
}

export default function NewsPage({
  viewer,
  categories,
  activeCategorySlug,
  initialItems,
  initialHasMore,
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

  const [featured, ...rest] = items;

  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-16 lg:pb-0">
      <Header
        fullName={viewer.fullName}
        avatar={viewer.avatar}
        email={viewer.email}
        userId={viewer.userId}
        username={viewer.username}
        isVerified={viewer.isVerified}
      />

      <div className="sticky top-16 z-30 bg-primary">
        <PageMargin className="flex items-center gap-4 py-3">
          <div className="flex shrink-0 items-center gap-2">
            <Newspaper className="size-3.5 text-white" />
            <h1 className="text-sm font-semibold text-white">Kabar HMI</h1>
          </div>

          <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link
              href="/news"
              className={[
                "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition",
                !activeCategorySlug
                  ? "border-white bg-white text-primary"
                  : "border-white/30 bg-white/10 text-white hover:bg-white/20",
              ].join(" ")}
            >
              Semua
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/news/${category.slug}`}
                className={[
                  "shrink-0 rounded-full border px-4 py-1.5 text-[13px] font-medium transition",
                  activeCategorySlug === category.slug
                    ? "border-white bg-white text-primary"
                    : "border-white/30 bg-white/10 text-white hover:bg-white/20",
                ].join(" ")}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </PageMargin>
      </div>

      <PageMargin className="py-6">
        {items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#dbe3ef] bg-white px-4 py-10 text-center text-sm text-[#5f6573]">
            Belum ada berita untuk kategori ini.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            <NewsArticleCard article={featured} variant="featured" />

            {rest.length > 0 && (
              <>
                {/* Mobile: Google News-style mixed list — big thumbnail every 4th item, list rows otherwise. */}
                <div className="flex flex-col divide-y divide-[#e6e9ef] sm:hidden">
                  {rest.map((article, index) => (
                    <div key={article.id} className="py-4 first:pt-0">
                      <NewsArticleCard
                        article={article}
                        variant={index % 4 === 0 ? "mobileBig" : "mobileList"}
                      />
                    </div>
                  ))}
                </div>

                <div className="hidden gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((article) => (
                    <NewsArticleCard
                      key={article.id}
                      article={article}
                      variant="grid"
                    />
                  ))}
                </div>
              </>
            )}
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

      <BottomNav
        username={viewer.username}
        avatar={viewer.avatar}
        fullName={viewer.fullName}
      />
    </div>
  );
}
