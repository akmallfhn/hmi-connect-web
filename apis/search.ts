import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
import { isSuccessStatus, type SearchTypeEnum } from "@/lib/types";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

export type SearchPersonResult = {
  id: string;
  full_name: string;
  username?: string;
  avatar?: string;
  headline?: string;
  chapter_id?: string;
  chapter_name?: string;
  branch_id?: string;
  branch_name?: string;
  coordinating_body_id?: string;
  coordinating_body_name?: string;
};

export type SearchPostingResult = {
  id: string;
  content: string;
  creator_id: string;
  creator_full_name: string;
  creator_username?: string;
  creator_avatar?: string;
  created_at: string;
};

type Metapaging = {
  total_data: number;
  total_page: number;
  current_page: number;
  page_size: number;
};

type ListResponse<T> = {
  list: T[];
  metapaging?: Metapaging;
};

async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

function hasMoreFromMetapaging(metapaging?: Metapaging): boolean {
  return metapaging ? metapaging.current_page < metapaging.total_page : false;
}

async function search<T>(
  type: SearchTypeEnum,
  keyword: string,
  options: { page?: number; pageSize?: number } = {}
): Promise<{ list: T[]; hasMore: boolean }> {
  if (!keyword.trim()) return { list: [], hasMore: false };

  const sessionToken = await getSessionToken();
  if (!sessionToken) return { list: [], hasMore: false };

  const { page = 1, pageSize = 20 } = options;
  const result = await callApi<ListResponse<T>>("/api/v1/search/list", {
    method: "POST",
    token: sessionToken,
    body: { type, keyword: keyword.trim(), page, page_size: pageSize },
  });

  if (!isSuccessStatus(result.status)) {
    console.error(`[search:${type}] request failed:`, result);
    return { list: [], hasMore: false };
  }

  return {
    list: result.data?.list ?? [],
    hasMore: hasMoreFromMetapaging(result.data?.metapaging),
  };
}

export function searchPeople(
  keyword: string,
  options?: { page?: number; pageSize?: number }
): Promise<{ list: SearchPersonResult[]; hasMore: boolean }> {
  return search<SearchPersonResult>("people", keyword, options);
}

export function searchPostings(
  keyword: string,
  options?: { page?: number; pageSize?: number }
): Promise<{ list: SearchPostingResult[]; hasMore: boolean }> {
  return search<SearchPostingResult>("posting", keyword, options);
}
