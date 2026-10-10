import "server-only";

import { cookies } from "next/headers";
import type { ArticleListEntry } from "./articles";
import { getFeedById, type Feed } from "./feeds";
import { callApi } from "./api";
import { isSuccessStatus, type AccessEntityTypeEnum, type VerificationStatusEnum } from "@/lib/types";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

export const SEARCH_CATEGORIES = ["user", "feed", "entity", "article"] as const;
export type SearchCategory = (typeof SEARCH_CATEGORIES)[number];

export type SearchPersonResult = {
  id: string;
  full_name: string;
  username: string;
  avatar?: string;
  headline?: string;
  verification_status?: VerificationStatusEnum;
  is_alumni?: boolean;
  chapter_id?: string;
  chapter_name?: string;
  branch_id?: string;
  branch_name?: string;
  coordinating_body_id?: string;
  coordinating_body_name?: string;
};

// search/feed returns hydrated timeline entries, including reposts.
export type SearchFeedResult = {
  type: string;
  created_at: string;
  feed: Feed;
  reposter_full_name?: string;
  reposter_avatar?: string;
};

export type SearchEntityResult = {
  entity_type: AccessEntityTypeEnum;
  entity_id: string;
  entity_name: string;
  entity_legal_name: string | null;
  entity_image_url: string | null;
  created_at: string;
};

export type SearchResultMap = {
  user: SearchPersonResult;
  feed: SearchFeedResult;
  article: ArticleListEntry;
  entity: SearchEntityResult;
};
export type SearchResultItem = SearchResultMap[SearchCategory];

export type PagedSearchResult<T> = {
  list: T[];
  totalData: number;
  currentPage: number;
  hasMore: boolean;
};

type ListResponse<T> = {
  list?: T[];
  metapaging?: {
    total_data: number;
    total_page: number;
    current_page: number;
    page_size: number;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isHydratedFeed(value: unknown): value is Feed {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.creator_id === "string" &&
    typeof value.content === "string" &&
    typeof value.created_at === "string" &&
    typeof value.updated_at === "string" &&
    typeof value.comment_count === "number" &&
    typeof value.comment_reply_count === "number" &&
    isRecord(value.reaction_count) &&
    typeof value.reaction_count.total === "number"
  );
}

async function normalizeFeedResults(
  items: unknown[],
  sessionToken: string
): Promise<SearchFeedResult[]> {
  const resolved = await Promise.all(items.map(async (item): Promise<SearchFeedResult | null> => {
    if (!isRecord(item)) return null;
    const rawFeed = isRecord(item.feed) ? item.feed : item;
    if (typeof rawFeed.id !== "string") return null;

    // Older deployments return flat rows instead of { type, feed }, so hydrate those by id.
    const feed = isHydratedFeed(rawFeed)
      ? rawFeed
      : typeof rawFeed.creator_id === "string" && typeof rawFeed.content === "string"
        ? await getFeedById(rawFeed.id, sessionToken)
        : null;
    if (!feed) return null;

    return {
      type: typeof item.type === "string" ? item.type : "post",
      created_at: typeof item.created_at === "string"
        ? item.created_at
        : feed.created_at,
      feed,
      reposter_full_name: typeof item.reposter_full_name === "string"
        ? item.reposter_full_name
        : undefined,
      reposter_avatar: typeof item.reposter_avatar === "string"
        ? item.reposter_avatar
        : undefined,
    };
  }));
  const list = resolved.filter((item): item is SearchFeedResult => item !== null);
  if (list.length !== items.length) {
    console.error(`[search:feed] skipped ${items.length - list.length} invalid result(s)`);
  }
  return list;
}

export async function searchResults<Category extends SearchCategory>(
  category: Category,
  keyword: string,
  options: { page?: number; pageSize?: number } = {}
): Promise<PagedSearchResult<SearchResultMap[Category]>> {
  const { page = 1, pageSize = 20 } = options;
  const empty = { list: [], totalData: 0, currentPage: page, hasMore: false };
  if (!keyword.trim()) return empty;
  if (!SEARCH_CATEGORIES.includes(category)) return empty;

  const sessionToken = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return empty;

  const result = await callApi<ListResponse<SearchResultMap[Category]>>(
    `/api/v1/search/${category}`,
    {
      method: "POST",
      token: sessionToken,
      body: { keyword: keyword.trim(), page, page_size: pageSize },
    }
  );

  if (!isSuccessStatus(result.status)) {
    console.error(`[search:${category}] request failed:`, result);
    return empty;
  }

  const rawList = Array.isArray(result.data?.list) ? result.data.list : [];
  const list = category === "feed"
    ? await normalizeFeedResults(rawList, sessionToken) as SearchResultMap[Category][]
    : rawList;
  const currentPage = result.data?.metapaging?.current_page ?? page;
  return {
    list,
    totalData: result.data?.metapaging?.total_data ?? list.length,
    currentPage,
    hasMore: currentPage < (result.data?.metapaging?.total_page ?? 1),
  };
}

// Shared user pickers on both subdomains use the same public member search.
export function searchPeople(
  keyword: string,
  options?: { page?: number; pageSize?: number }
) {
  return searchResults("user", keyword, options);
}
