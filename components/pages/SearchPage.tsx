"use client";

import { IconSearch } from "@tabler/icons-react";
import {
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ArticleListEntry } from "@/apis/articles";
import type {
  SearchCategory,
  SearchEntityResult,
  SearchFeedResult,
  SearchOverviewResults,
  SearchPersonResult,
  SearchResultItem,
} from "@/apis/search";
import { fetchSearchOverview, fetchSearchResults } from "@/lib/actions";
import type { UserStatusEnum, VerificationStatusEnum } from "@/lib/types";
import PageMargin from "../common/PageMargin";
import FeedItemCard from "../feeds/FeedItemCard";
import Input from "../fields/Input";
import ActingAwareBottomNav from "../official/ActingAwareBottomNav";
import type { ComposerAuthorEntity } from "../forms/CreateFeedForms";
import Header from "../navigations/Header";
import SearchArticleRow from "../search/SearchArticleRow";
import SearchEntityRow from "../search/SearchEntityRow";
import SearchPersonRow from "../search/SearchPersonRow";
import SearchResultsSkeleton from "../search/SearchResultsSkeleton";

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
  initialResults: SearchOverviewResults;
  aside: ReactNode;
  actingEntity?: ComposerAuthorEntity | null;
}

const CATEGORIES: { value: SearchCategory; label: string }[] = [
  { value: "user", label: "People" },
  { value: "feed", label: "Post" },
  { value: "entity", label: "Organisasi" },
  { value: "article", label: "Artikel" },
];
const SEARCH_DEBOUNCE_MS = 400;
const EXPANDED_PAGE_SIZE = 15;

function searchHref(query: string) {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  return `/search${params.size ? `?${params}` : ""}`;
}

export default function SearchPage({
  viewer,
  initialQuery,
  initialResults,
  aside,
  actingEntity,
}: SearchPageProps) {
  const [keyword, setKeyword] = useState(initialQuery);
  const [searchedQuery, setSearchedQuery] = useState(initialQuery);
  const [results, setResults] = useState(initialResults);
  const [searchError, setSearchError] = useState(false);
  const [loadingMore, setLoadingMore] = useState<
    Partial<Record<SearchCategory, boolean>>
  >({});
  const [loadErrors, setLoadErrors] = useState<
    Partial<Record<SearchCategory, boolean>>
  >({});
  const [expandedCategories, setExpandedCategories] = useState<
    Set<SearchCategory>
  >(() => new Set());
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRequestIdRef = useRef(0);

  const runSearch = useCallback(async (query: string, requestId: number) => {
    window.history.replaceState(null, "", searchHref(query));
    try {
      const next = await fetchSearchOverview(query);
      if (requestId !== searchRequestIdRef.current) return;
      setResults(next);
      setSearchedQuery(query);
      setSearchError(false);
      setLoadErrors({});
      setLoadingMore({});
      setExpandedCategories(new Set());
    } catch {
      if (requestId !== searchRequestIdRef.current) return;
      setSearchedQuery(query);
      setSearchError(true);
      setLoadingMore({});
    }
  }, []);

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

  async function handleLoadMore(category: SearchCategory) {
    const categoryResults = results[category];
    if (loadingMore[category] || !categoryResults.hasMore) return;

    const requestId = searchRequestIdRef.current;
    const isFirstExpandedPage = !expandedCategories.has(category);
    const page = isFirstExpandedPage ? 1 : categoryResults.currentPage + 1;
    setLoadingMore((previous) => ({ ...previous, [category]: true }));
    setLoadErrors((previous) => ({ ...previous, [category]: false }));

    try {
      const next = await fetchSearchResults(
        category,
        searchedQuery,
        page,
        EXPANDED_PAGE_SIZE,
      );
      if (requestId !== searchRequestIdRef.current) return;

      setResults((previous) => {
        const previousItems = previous[category].list as SearchResultItem[];
        const nextItems = next.list as SearchResultItem[];
        return {
          ...previous,
          [category]: {
            ...next,
            list: isFirstExpandedPage
              ? nextItems
              : [...previousItems, ...nextItems],
          },
        } as SearchOverviewResults;
      });
      setExpandedCategories((previous) => new Set(previous).add(category));
    } catch {
      if (requestId === searchRequestIdRef.current) {
        setLoadErrors((previous) => ({ ...previous, [category]: true }));
      }
    } finally {
      if (requestId === searchRequestIdRef.current) {
        setLoadingMore((previous) => ({ ...previous, [category]: false }));
      }
    }
  }

  function handleFeedDeleted(feedId: string) {
    setResults((previous) => ({
      ...previous,
      feed: {
        ...previous.feed,
        list: previous.feed.list.filter((item) => item.feed?.id !== feedId),
        totalData: Math.max(0, previous.feed.totalData - 1),
      },
    }));
  }

  function renderResults(category: SearchCategory) {
    switch (category) {
      case "feed":
        return (results.feed.list as SearchFeedResult[])
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
              authorEntity={actingEntity ?? undefined}
            />
          ));
      case "user":
        return (results.user.list as SearchPersonResult[]).map((person) => (
          <SearchPersonRow key={person.id} person={person} />
        ));
      case "entity":
        return (results.entity.list as SearchEntityResult[]).map((entity) => (
          <SearchEntityRow
            key={`${entity.entity_type}:${entity.entity_id}`}
            entity={entity}
          />
        ));
      case "article":
        return (results.article.list as ArticleListEntry[]).map((article) => (
          <SearchArticleRow key={article.id} article={article} />
        ));
    }
  }

  const hasAnyResults = CATEGORIES.some(
    ({ value }) => results[value].list.length > 0,
  );
  const isSearching = keyword.trim() !== searchedQuery;

  return (
    <div className="min-h-screen bg-surface pb-16 lg:pb-0">
      <Header
        fullName={viewer.fullName}
        avatar={viewer.avatar}
        userId={viewer.userId}
        username={viewer.username}
        verificationStatus={viewer.verificationStatus}
      />

      <PageMargin
        noMobilePadding
        className="grid grid-cols-1 gap-8 pb-8 pt-5 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] lg:pt-8"
      >
        <main className="min-w-0">
          <h1 className="sr-only">Cari di HMI Connect</h1>
          <form
            role="search"
            onSubmit={handleSubmit}
            className="px-4 lg:px-0"
          >
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

          <div className="mt-5">
            {isSearching ? (
              <div role="status" className="flex flex-col gap-1.5 lg:gap-4">
                <span className="sr-only">Mencari...</span>
                {CATEGORIES.map((category) => (
                  <section
                    key={category.value}
                    className="overflow-hidden border border-x-0 border-border bg-surface lg:rounded-2xl lg:border-x"
                  >
                    <h2 className="px-5 pb-2 pt-5 font-stack-sans-headline text-sm font-medium text-heading xl:text-[15px]">
                      {category.label}
                    </h2>
                    <div className={category.value === "feed" ? "px-5" : "px-2"}>
                      <SearchResultsSkeleton category={category.value} />
                    </div>
                  </section>
                ))}
              </div>
            ) : searchError ? (
              <p
                role="alert"
                className="py-16 text-center text-sm text-destructive-foreground"
              >
                Gagal mencari. Coba ubah kata kunci atau tekan Enter.
              </p>
            ) : !searchedQuery ? (
              <p className="py-16 text-center text-sm text-subtle-foreground">
                Ketik kata kunci untuk mencari di HMI Connect.
              </p>
            ) : !hasAnyResults ? (
              <p className="py-16 text-center text-sm text-subtle-foreground">
                Tidak ada hasil untuk &ldquo;{searchedQuery}&rdquo;.
              </p>
            ) : (
              <div className="flex flex-col gap-1.5 lg:gap-4">
                {CATEGORIES.map((category) => {
                  const categoryResults = results[category.value];
                  if (categoryResults.list.length === 0) return null;

                  return (
                    <section
                      key={category.value}
                      aria-labelledby={`search-category-${category.value}`}
                      className="overflow-hidden border border-x-0 border-border bg-surface lg:rounded-2xl lg:border-x"
                    >
                      <h2
                        id={`search-category-${category.value}`}
                        className="px-5 pb-2 pt-5 font-stack-sans-headline text-sm font-medium text-heading xl:text-[15px]"
                      >
                        {category.label}
                      </h2>
                      <div className={category.value === "feed" ? "px-5" : "px-2"}>
                        {renderResults(category.value)}
                      </div>
                      {categoryResults.hasMore && (
                        <div className="px-5 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleLoadMore(category.value)}
                            disabled={loadingMore[category.value]}
                            className="cursor-pointer text-sm font-semibold text-primary-foreground hover:underline disabled:cursor-wait disabled:opacity-60"
                          >
                            {loadingMore[category.value]
                              ? "Memuat..."
                              : "Tampilkan lebih banyak"}
                          </button>
                          {loadErrors[category.value] && (
                            <p
                              role="alert"
                              className="mt-2 text-sm text-destructive-foreground"
                            >
                              Gagal memuat hasil. Coba lagi.
                            </p>
                          )}
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        <aside className="hidden lg:sticky lg:top-6 lg:block lg:self-start">
          {aside}
        </aside>
      </PageMargin>

      <ActingAwareBottomNav
        actingEntity={actingEntity}
        userId={viewer.userId}
        username={viewer.username}
      />
    </div>
  );
}
