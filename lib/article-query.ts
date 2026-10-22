import { infiniteQueryOptions } from "@tanstack/react-query";
import type { ArticleFeedTab, ArticleListEntry } from "@/apis/articles";
import type { NewsArticle } from "@/apis/news";
import { loadMoreArticles, loadMoreNewsArticles } from "@/lib/actions";

export type ArticlesTab = ArticleFeedTab | "news";
export type ArticleFeedPage =
  | { kind: "news"; list: NewsArticle[]; hasMore: boolean }
  | { kind: "articles"; list: ArticleListEntry[]; hasMore: boolean };

export function articleFeedQueryOptions(
  tab: ArticlesTab,
  viewerId?: string,
  initial?: ArticleFeedPage,
) {
  return infiniteQueryOptions({
    queryKey: ["article-feed", viewerId ?? "public", tab],
    queryFn: async ({ pageParam }): Promise<ArticleFeedPage> =>
      tab === "news"
        ? { kind: "news", ...(await loadMoreNewsArticles(pageParam)) }
        : { kind: "articles", ...(await loadMoreArticles(tab, pageParam)) },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + 1 : undefined,
    initialData: initial ? { pages: [initial], pageParams: [1] } : undefined,
    staleTime: 60_000,
  });
}
