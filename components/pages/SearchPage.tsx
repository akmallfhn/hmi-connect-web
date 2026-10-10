"use client";

import { IconSearch } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useCallback, useEffect, useRef, useState, useTransition } from "react";
import type { ArticleListEntry } from "@/apis/articles";
import type {
  PagedSearchResult,
  SearchCategory,
  SearchEntityResult,
  SearchFeedResult,
  SearchPersonResult,
  SearchResultItem,
} from "@/apis/search";
import { fetchSearchResults } from "@/lib/actions";
import type { UserStatusEnum, VerificationStatusEnum } from "@/lib/types";
import PageMargin from "../common/PageMargin";
import FeedItemCard from "../feeds/FeedItemCard";
import Input from "../fields/Input";
import BottomNav from "../navigations/BottomNav";
import Header from "../navigations/Header";
import SearchArticleRow from "../search/SearchArticleRow";
import SearchEntityRow from "../search/SearchEntityRow";
import SearchPersonRow from "../search/SearchPersonRow";

interface ViewerProps {
  fullName?: string;
  avatar?: string;
  userId?: string;
  username?: string;
  userStatus?: UserStatusEnum;
  verificationStatus?: VerificationStatusEnum;
}

interface SearchPageProps {
  viewer: ViewerProps;
  initialQuery: string;
  activeCategory: SearchCategory;
  initialResults: PagedSearchResult<SearchResultItem>;
  aside: ReactNode;
}

const CATEGORIES: { value: SearchCategory; label: string; noun: string }[] = [
  { value: "user", label: "People", noun: "orang" },
  { value: "feed", label: "Feed", noun: "postingan" },
  { value: "entity", label: "Official", noun: "akun resmi" },
  { value: "article", label: "Artikel", noun: "artikel" },
];
const SEARCH_DEBOUNCE_MS = 400;

function searchHref(query: string, category: SearchCategory) {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (category !== "user") params.set("tab", category);
  return `/search${params.size ? `?${params}` : ""}`;
}

export default function SearchPage({
  viewer,
  initialQuery,
  activeCategory,
  initialResults,
  aside,
}: SearchPageProps) {
  const router = useRouter();
  const [, startNavigation] = useTransition();
  const [keyword, setKeyword] = useState(initialQuery);
  const [searchedQuery, setSearchedQuery] = useState(initialQuery);
  const [results, setResults] = useState(initialResults);
  const [searchError, setSearchError] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRequestIdRef = useRef(0);

  const runSearch = useCallback(async (query: string, requestId: number) => {
    window.history.replaceState(null, "", searchHref(query, activeCategory));
    try {
      const next = await fetchSearchResults(activeCategory, query, 1);
      if (requestId !== searchRequestIdRef.current) return;
      setResults(next);
      setSearchedQuery(query);
      setSearchError(false);
      setLoadError(false);
      setLoadingMore(false);
    } catch {
      if (requestId !== searchRequestIdRef.current) return;
      setResults({ list: [], totalData: 0, currentPage: 1, hasMore: false });
      setSearchedQuery(query);
      setSearchError(true);
      setLoadingMore(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    const query = keyword.trim();
    if (query === searchedQuery) return;
    const requestId = ++searchRequestIdRef.current;
    debounceTimerRef.current = setTimeout(() => {
      void runSearch(query, requestId);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      clearTimeout(debounceTimerRef.current ?? undefined);
    };
  }, [keyword, searchedQuery, runSearch]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = keyword.trim();
    if (query === searchedQuery && !searchError) return;
    clearTimeout(debounceTimerRef.current ?? undefined);
    const requestId = ++searchRequestIdRef.current;
    void runSearch(query, requestId);
  }

  async function handleLoadMore() {
    if (loadingMore || !results.hasMore) return;
    const requestId = searchRequestIdRef.current;
    setLoadingMore(true);
    setLoadError(false);
    try {
      const next = await fetchSearchResults(
        activeCategory,
        searchedQuery,
        results.currentPage + 1
      );
      if (requestId !== searchRequestIdRef.current) return;
      setResults((previous) => ({
        ...next,
        list: [...previous.list, ...next.list],
      }));
    } catch {
      if (requestId === searchRequestIdRef.current) setLoadError(true);
    } finally {
      if (requestId === searchRequestIdRef.current) setLoadingMore(false);
    }
  }

  function handleFeedDeleted(feedId: string) {
    setResults((previous) => ({
      ...previous,
      list: previous.list.filter(
        (item) => (item as SearchFeedResult).feed?.id !== feedId
      ),
      totalData: Math.max(0, previous.totalData - 1),
    }));
  }

  function renderResults() {
    switch (activeCategory) {
      case "feed":
        return (results.list as SearchFeedResult[])
          .filter((posting) => posting?.feed?.id)
          .map((posting, index) => (
            <FeedItemCard
              key={`${posting.type}-${posting.feed.id}-${index}`}
              surface="flat"
              feed={posting.feed}
              currentUserId={viewer.userId}
              currentUserName={viewer.fullName}
              currentUserAvatar={viewer.avatar}
              userStatus={viewer.userStatus}
              verificationStatus={viewer.verificationStatus}
              repostedBy={
                posting.type === "repost" && posting.reposter_full_name
                  ? {
                      fullName: posting.reposter_full_name,
                      avatar: posting.reposter_avatar,
                    }
                  : undefined
              }
              onDeleted={handleFeedDeleted}
            />
          ));
      case "user":
        return (results.list as SearchPersonResult[]).map((person) => (
          <SearchPersonRow key={person.id} person={person} />
        ));
      case "entity":
        return (results.list as SearchEntityResult[]).map((entity) => (
          <SearchEntityRow
            key={`${entity.entity_type}:${entity.entity_id}`}
            entity={entity}
          />
        ));
      case "article":
        return (results.list as ArticleListEntry[]).map((article) => (
          <SearchArticleRow key={article.id} article={article} />
        ));
    }
  }

  const currentCategory = CATEGORIES.find(
    (item) => item.value === activeCategory
  )!;

  return (
    <div className="min-h-screen bg-white pb-16 lg:pb-0">
      <Header
        fullName={viewer.fullName}
        avatar={viewer.avatar}
        userId={viewer.userId}
        username={viewer.username}
        verificationStatus={viewer.verificationStatus}
      />

      <PageMargin className="grid grid-cols-1 gap-8 pb-8 pt-5 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] lg:pt-8">
        <main className="min-w-0">
          <h1 className="sr-only">Cari di HMI Connect</h1>
          <form role="search" onSubmit={handleSubmit}>
            <Input
              inputId="site-search"
              type="search"
              aria-label="Kata kunci pencarian"
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value);
                setSearchError(false);
              }}
              placeholder="Cari di HMI Connect"
              icon={
                <IconSearch
                  aria-hidden="true"
                  className="size-[18px]"
                  stroke={1.8}
                />
              }
              className="h-11 rounded-xl text-sm"
            />
          </form>

          <nav
            aria-label="Kategori pencarian"
            className="mt-5 grid grid-cols-4 border-b border-[#e6e9ef]"
          >
            {CATEGORIES.map((category) => {
              const active = category.value === activeCategory;
              return (
                <button
                  key={category.value}
                  type="button"
                  aria-current={active ? "page" : undefined}
                  onClick={() => {
                    clearTimeout(debounceTimerRef.current ?? undefined);
                    searchRequestIdRef.current++;
                    startNavigation(() =>
                      router.push(searchHref(keyword, category.value))
                    );
                  }}
                  className={`-mb-px min-h-10 cursor-pointer border-b-2 px-1 text-center text-[13px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:text-sm ${
                    active
                      ? "border-[#172033] font-semibold text-[#172033]"
                      : "border-transparent font-medium text-[#7b8190] hover:text-[#172033]"
                  }`}
                >
                  {category.label}
                </button>
              );
            })}
          </nav>

          <section
            aria-label={`Hasil pencarian ${currentCategory.label}`}
            className="pt-5"
          >
            {keyword.trim() !== searchedQuery ? (
              <p role="status" className="py-16 text-center text-sm text-[#7b8190]">
                Mencari...
              </p>
            ) : searchError ? (
              <p role="alert" className="py-16 text-center text-sm text-destructive">
                Gagal mencari. Coba ubah kata kunci atau tekan Enter.
              </p>
            ) : !searchedQuery ? (
              <p className="py-16 text-center text-sm text-[#7b8190]">
                Ketik kata kunci untuk mencari {currentCategory.noun}.
              </p>
            ) : results.list.length === 0 ? (
              <p className="py-16 text-center text-sm text-[#7b8190]">
                Tidak ada {currentCategory.noun} untuk &ldquo;{searchedQuery}
                &rdquo;.
              </p>
            ) : (
              <>
                <div>{renderResults()}</div>
                {results.hasMore && (
                  <div className="py-6 text-center">
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="cursor-pointer text-sm font-semibold text-primary-foreground hover:underline disabled:cursor-wait disabled:opacity-60"
                    >
                      {loadingMore ? "Memuat..." : "Muat lebih banyak"}
                    </button>
                    {loadError && (
                      <p role="alert" className="mt-2 text-sm text-destructive">
                        Gagal memuat hasil. Coba lagi.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </section>
        </main>

        <aside className="hidden lg:sticky lg:top-6 lg:block lg:self-start">
          {aside}
        </aside>
      </PageMargin>

      <BottomNav userId={viewer.userId} username={viewer.username} />
    </div>
  );
}
