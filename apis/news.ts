import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
import { isSuccessStatus } from "@/lib/types";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

export type NewsCategory = {
  id: number;
  name: string;
  slug: string;
};

export type NewsArticle = {
  id: string;
  source_id: number;
  source_name: string;
  source_url: string;
  source_logo_url?: string;
  title: string;
  summary?: string;
  image_url?: string;
  category_id?: number;
  category_name?: string;
  category_slug?: string;
  published_at?: string;
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

export async function listNewsCategories(
  options: { search?: string; page?: number; pageSize?: number } = {}
): Promise<{ list: NewsCategory[]; hasMore: boolean }> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return { list: [], hasMore: false };

  const { search, page = 1, pageSize = 20 } = options;
  const result = await callApi<ListResponse<NewsCategory>>(
    "/api/v1/news-categories/list",
    {
      method: "POST",
      token: sessionToken,
      body: { search, page, page_size: pageSize },
    }
  );

  if (!isSuccessStatus(result.status)) {
    console.error("[listNewsCategories] request failed:", result);
    return { list: [], hasMore: false };
  }

  return {
    list: result.data?.list ?? [],
    hasMore: hasMoreFromMetapaging(result.data?.metapaging),
  };
}

export async function listNewsArticles(
  options: {
    search?: string;
    categorySlug?: string;
    sourceId?: number;
    page?: number;
    pageSize?: number;
  } = {}
): Promise<{ list: NewsArticle[]; hasMore: boolean }> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return { list: [], hasMore: false };

  const { search, categorySlug, sourceId, page = 1, pageSize = 20 } = options;
  const result = await callApi<ListResponse<NewsArticle>>(
    "/api/v1/news-articles/list",
    {
      method: "POST",
      token: sessionToken,
      body: {
        search,
        category_slug: categorySlug,
        source_id: sourceId,
        page,
        page_size: pageSize,
      },
    }
  );

  if (!isSuccessStatus(result.status)) {
    console.error("[listNewsArticles] request failed:", result);
    return { list: [], hasMore: false };
  }

  return {
    list: result.data?.list ?? [],
    hasMore: hasMoreFromMetapaging(result.data?.metapaging),
  };
}
