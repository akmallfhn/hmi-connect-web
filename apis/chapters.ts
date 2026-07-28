import "server-only";

import { cookies } from "next/headers";
import { callApi, type ApiEnvelope } from "./api";
import { isSuccessStatus, type BranchTypeEnum, type StatusEnum } from "@/lib/types";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

export type Chapter = {
  id: string;
  branch_id: string;
  name: string;
  type: string;
  status: string;
};

type ChaptersListResponse = {
  list: Chapter[];
  metapaging?: {
    total_data: number;
    total_page: number;
    current_page: number;
    page_size: number;
  };
};

export type GetChaptersOptions = {
  search?: string;
  page?: number;
  pageSize?: number;
};

export type GetChaptersResult = {
  list: Chapter[];
  hasMore: boolean;
};

export async function searchChapters(
  branchId: string,
  options: GetChaptersOptions = {}
): Promise<GetChaptersResult> {
  const { search, page, pageSize } = options;
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  const result = await callApi<ChaptersListResponse>("/api/v1/chapters/list", {
    method: "POST",
    token: sessionToken,
    body: {
      branch_id: branchId,
      status: "active",
      ...(search ? { search } : {}),
      ...(page ? { page } : {}),
      ...(pageSize ? { page_size: pageSize } : {}),
    },
  });

  const list = result.data?.list ?? [];
  const metapaging = result.data?.metapaging;
  const hasMore = metapaging ? metapaging.current_page < metapaging.total_page : false;

  return { list, hasMore };
}

// Mirrors POST /api/v1/chapters/list's response — the admin table shape (/master/chapters). Unlike branches/list, chapters/list has no name field for its parent (branch_name), so the admin list page carries that via its own required Cabang filter selection instead.
export type ChapterListEntry = {
  id: string;
  branch_id: string;
  name: string;
  type: BranchTypeEnum;
  status: StatusEnum;
  // Only present when include_aggregates is requested — active kader count directly in this chapter.
  user_count?: number;
};

export type ListChaptersOptions = {
  branchId: string;
  search?: string;
  status?: StatusEnum;
  page?: number;
  pageSize?: number;
};

export type PagedListResult<T> = {
  list: T[];
  totalData: number;
  totalPage: number;
  currentPage: number;
};

type ChapterListAdminResponse = {
  list: ChapterListEntry[];
  metapaging?: {
    total_data: number;
    total_page: number;
    current_page: number;
    page_size: number;
  };
};

// Requires Super Admin/Administrator — only called from the /master/chapters admin panel, gated by MasterLayout.
export async function listChaptersAdmin(
  options: ListChaptersOptions
): Promise<PagedListResult<ChapterListEntry>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return { list: [], totalData: 0, totalPage: 1, currentPage: 1 };

  const { branchId, search, status, page, pageSize } = options;
  const result = await callApi<ChapterListAdminResponse>("/api/v1/chapters/list", {
    method: "POST",
    token: sessionToken,
    body: {
      branch_id: branchId,
      include_aggregates: true,
      ...(search ? { search } : {}),
      ...(status ? { status } : {}),
      page: page ?? 1,
      page_size: pageSize ?? 20,
    },
  });

  if (!isSuccessStatus(result.status)) {
    console.error("[listChaptersAdmin] request failed:", result);
    return { list: [], totalData: 0, totalPage: 1, currentPage: 1 };
  }

  const list = result.data?.list ?? [];
  const metapaging = result.data?.metapaging;
  return {
    list,
    totalData: metapaging?.total_data ?? list.length,
    totalPage: metapaging?.total_page ?? 1,
    currentPage: metapaging?.current_page ?? page ?? 1,
  };
}

// Mirrors POST /api/v1/chapters/create and /update's response.
export type ChapterDetail = {
  id: string;
  branch_id: string;
  branch_name?: string;
  name: string;
  type: BranchTypeEnum;
  status: StatusEnum;
  created_at: string;
  updated_at: string;
};

export type CreateChapterPayload = {
  branch_id: string;
  name: string;
  type?: BranchTypeEnum;
  status?: StatusEnum;
};

export async function createChapter(
  payload: CreateChapterPayload
): Promise<ApiEnvelope<ChapterDetail>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return { status: "UNAUTHORIZED", message: "Session expired. Please log in again." };
  }

  return callApi<ChapterDetail>("/api/v1/chapters/create", {
    method: "POST",
    token: sessionToken,
    body: payload,
  });
}

export type UpdateChapterPayload = {
  id: string;
  branch_id?: string;
  name?: string;
  type?: BranchTypeEnum;
  status?: StatusEnum;
};

export async function updateChapter(
  payload: UpdateChapterPayload
): Promise<ApiEnvelope<ChapterDetail>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return { status: "UNAUTHORIZED", message: "Session expired. Please log in again." };
  }

  return callApi<ChapterDetail>("/api/v1/chapters/update", {
    method: "POST",
    token: sessionToken,
    body: payload,
  });
}

export async function deleteChapter(id: string): Promise<ApiEnvelope> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return { status: "UNAUTHORIZED", message: "Session expired. Please log in again." };
  }

  return callApi("/api/v1/chapters/delete", {
    method: "POST",
    token: sessionToken,
    body: { id },
  });
}
