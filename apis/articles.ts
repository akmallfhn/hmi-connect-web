import "server-only";

import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import {
  isSuccessStatus,
  type ArticleStatusEnum,
  type StatusName,
} from "@/lib/types";
import { callApi } from "./api";

export type ArticleListEntry = {
  id: string;
  title: string;
  image_url: string;
  status: ArticleStatusEnum;
  category_id: number;
  category_name: string;
  category_slug: string;
  keywords?: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  slug_url: string;
  published_at: string;
  updated_at: string;
};

export type ArticleDetail = ArticleListEntry & {
  description: string | null;
  // Raw author-authored HTML — sanitize through lib/article-body.ts before rendering.
  body_content: string;
  created_at: string;
};

export type ArticleCategory = {
  id: number;
  name: string;
  slug: string;
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

export type PagedArticleResult<T> = {
  list: T[];
  totalData: number;
  totalPage: number;
  currentPage: number;
  hasMore: boolean;
};

async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

// Articles read with the client secret so a logged-out visitor can read one, same as trainings.
async function getArticleReadToken() {
  return process.env.CLIENT_SECRET ?? (await getSessionToken());
}

function mapPage<T>(
  data: ListResponse<T> | undefined,
  fallbackPage: number
): PagedArticleResult<T> {
  const list = data?.list ?? [];
  const currentPage = data?.metapaging?.current_page ?? fallbackPage;
  const totalPage = data?.metapaging?.total_page ?? 1;
  return {
    list,
    totalData: data?.metapaging?.total_data ?? list.length,
    totalPage,
    currentPage,
    hasMore: currentPage < totalPage,
  };
}

export type ListArticlesOptions = {
  search?: string;
  categoryId?: number;
  page?: number;
  pageSize?: number;
};

export async function listArticles(
  options: ListArticlesOptions = {}
): Promise<PagedArticleResult<ArticleListEntry>> {
  const page = options.page ?? 1;
  const token = await getArticleReadToken();
  if (!token) return mapPage<ArticleListEntry>(undefined, page);

  const result = await callApi<ListResponse<ArticleListEntry>>(
    "/api/v1/articles/list",
    {
      method: "POST",
      token,
      body: {
        ...(options.search ? { search: options.search } : {}),
        ...(options.categoryId ? { category_id: options.categoryId } : {}),
        page,
        page_size: options.pageSize ?? 20,
      },
    }
  );

  if (!isSuccessStatus(result.status)) {
    return mapPage<ArticleListEntry>(undefined, page);
  }
  return mapPage(result.data, page);
}

// Answers 404 for a missing, deleted, or unpublished article — all three surface as null.
export async function getArticleDetail(
  id: string
): Promise<ArticleDetail | null> {
  const token = await getArticleReadToken();
  if (!token) return null;

  const result = await callApi<ArticleDetail>("/api/v1/articles/detail", {
    method: "POST",
    token,
    body: { id },
  });

  if (!isSuccessStatus(result.status)) return null;
  return result.data ?? null;
}

// Unlike articles/list, article-categories/list is JWT-only on the backend — no client-secret fallback.
export async function listArticleCategories(
  options: { search?: string; page?: number; pageSize?: number } = {}
): Promise<PagedArticleResult<ArticleCategory>> {
  const page = options.page ?? 1;
  const token = await getSessionToken();
  if (!token) return mapPage<ArticleCategory>(undefined, page);

  const result = await callApi<ListResponse<ArticleCategory>>(
    "/api/v1/article-categories/list",
    {
      method: "POST",
      token,
      body: {
        ...(options.search ? { search: options.search } : {}),
        page,
        page_size: options.pageSize ?? 20,
      },
    }
  );

  if (!isSuccessStatus(result.status)) {
    return mapPage<ArticleCategory>(undefined, page);
  }
  return mapPage(result.data, page);
}

export type CreateArticlePayload = {
  title: string;
  image_url: string;
  body_content: string;
  category_id: number;
  author_id: string;
  description?: string;
  keywords?: string;
  status?: ArticleStatusEnum;
  slug_url?: string;
  published_at?: string;
};

export type CreateArticleResult =
  | { ok: true; article: ArticleDetail }
  | { ok: false; message: string };

// Authorized by the session JWT: a non-admin author must be verified and may only create as themselves.
export async function createArticle(
  payload: CreateArticlePayload
): Promise<CreateArticleResult> {
  const token = await getSessionToken();
  if (!token) return { ok: false, message: "Sesi kamu sudah berakhir." };

  const result = await callApi<ArticleDetail>("/api/v1/articles/create", {
    method: "POST",
    token,
    body: payload,
  });

  if (!isSuccessStatus(result.status) || !result.data) {
    return { ok: false, message: createArticleMessage(result.status) };
  }
  return { ok: true, article: result.data };
}

function createArticleMessage(status: StatusName | undefined): string {
  switch (status) {
    case "FORBIDDEN":
      return "Akun kamu harus terverifikasi sebelum bisa menerbitkan artikel.";
    case "CONFLICT":
      return "Sudah ada artikel dengan slug yang sama. Ubah judulnya sedikit.";
    case "BAD_REQUEST":
      return "Data artikel belum lengkap atau kategori tidak valid.";
    case "UNAUTHORIZED":
      return "Sesi kamu sudah berakhir. Masuk ulang lalu coba lagi.";
    default:
      return "Artikel gagal diterbitkan. Coba lagi.";
  }
}
