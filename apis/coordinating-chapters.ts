import "server-only";

import { cookies } from "next/headers";
import { callApi, type ApiEnvelope } from "./api";
import { isSuccessStatus, type StatusEnum } from "@/lib/types";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

// Mirrors POST /api/v1/coordinating-chapters/list's response — the admin table shape (/master/coordinating-chapters).
export type CoordinatingChapterListEntry = {
  id: string;
  branch_id: string;
  branch_name: string;
  name: string;
  image_url: string | null;
  status: StatusEnum;
};

export type ListCoordinatingChaptersOptions = {
  branchId?: string;
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

type CoordinatingChapterListAdminResponse = {
  list: CoordinatingChapterListEntry[];
  metapaging?: {
    total_data: number;
    total_page: number;
    current_page: number;
    page_size: number;
  };
};

// Requires Super Admin, or a manage grant on the entity named in the request — /master/coordinating-chapters and the branch-scoped Kelola Korkom page.
export async function listCoordinatingChaptersAdmin(
  options: ListCoordinatingChaptersOptions = {}
): Promise<PagedListResult<CoordinatingChapterListEntry>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken)
    return { list: [], totalData: 0, totalPage: 1, currentPage: 1 };

  const { branchId, search, status, page, pageSize } = options;
  const result = await callApi<CoordinatingChapterListAdminResponse>(
    "/api/v1/coordinating-chapters/list",
    {
      method: "POST",
      token: sessionToken,
      body: {
        ...(branchId ? { branch_id: branchId } : {}),
        ...(search ? { search } : {}),
        ...(status ? { status } : {}),
        page: page ?? 1,
        page_size: pageSize ?? 20,
      },
    }
  );

  if (!isSuccessStatus(result.status)) {
    console.error("[listCoordinatingChaptersAdmin] request failed:", result);
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

// Mirrors POST /api/v1/coordinating-chapters/detail and /create and /update's response.
export type CoordinatingChapterDetail = {
  id: string;
  branch_id: string;
  branch_name: string;
  name: string;
  description: string | null;
  image_url: string | null;
  status: StatusEnum;
  created_at: string;
  updated_at: string;
};

export async function getCoordinatingChapterDetail(
  id: string
): Promise<CoordinatingChapterDetail | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return null;

  const result = await callApi<CoordinatingChapterDetail>(
    "/api/v1/coordinating-chapters/detail",
    {
      method: "POST",
      token: sessionToken,
      body: { id },
    }
  );

  if (!isSuccessStatus(result.status) || !result.data) return null;
  return result.data;
}

export type CreateCoordinatingChapterPayload = {
  branch_id: string;
  name: string;
  description?: string;
  image_url?: string;
  status?: StatusEnum;
};

export async function createCoordinatingChapter(
  payload: CreateCoordinatingChapterPayload
): Promise<ApiEnvelope<CoordinatingChapterDetail>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return {
      status: "UNAUTHORIZED",
      message: "Session expired. Please log in again.",
    };
  }

  return callApi<CoordinatingChapterDetail>(
    "/api/v1/coordinating-chapters/create",
    {
      method: "POST",
      token: sessionToken,
      body: payload,
    }
  );
}

export type UpdateCoordinatingChapterPayload = {
  id: string;
  branch_id?: string;
  name?: string;
  description?: string;
  image_url?: string;
  status?: StatusEnum;
};

export async function updateCoordinatingChapter(
  payload: UpdateCoordinatingChapterPayload
): Promise<ApiEnvelope<CoordinatingChapterDetail>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return {
      status: "UNAUTHORIZED",
      message: "Session expired. Please log in again.",
    };
  }

  return callApi<CoordinatingChapterDetail>(
    "/api/v1/coordinating-chapters/update",
    {
      method: "POST",
      token: sessionToken,
      body: payload,
    }
  );
}

export async function deleteCoordinatingChapter(
  id: string
): Promise<ApiEnvelope> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return {
      status: "UNAUTHORIZED",
      message: "Session expired. Please log in again.",
    };
  }

  return callApi("/api/v1/coordinating-chapters/delete", {
    method: "POST",
    token: sessionToken,
    body: { id },
  });
}
