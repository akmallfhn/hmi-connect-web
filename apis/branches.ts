import "server-only";

import { cookies } from "next/headers";
import { callApi, type ApiEnvelope } from "./api";
import { isSuccessStatus, type BranchTypeEnum, type StatusEnum } from "@/lib/types";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

export type Branch = {
  id: string;
  name: string;
};

type BranchesListResponse = {
  list: Branch[];
  metapaging?: {
    total_data: number;
    total_page: number;
    current_page: number;
    page_size: number;
  };
};

export type GetBranchesOptions = {
  search?: string;
  page?: number;
  pageSize?: number;
};

export type GetBranchesResult = {
  list: Branch[];
  hasMore: boolean;
};

async function fetchBranches(
  options: GetBranchesOptions = {}
): Promise<GetBranchesResult> {
  const { search, page, pageSize } = options;
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  const result = await callApi<BranchesListResponse>("/api/v1/branches/list", {
    method: "POST",
    token: sessionToken,
    body: {
      organization_id: process.env.ORGANIZATION_ID,
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

export async function getBranches(
  options: GetBranchesOptions = {}
): Promise<Branch[]> {
  const { list } = await fetchBranches(options);
  return list;
}

export async function searchBranches(
  options: GetBranchesOptions = {}
): Promise<GetBranchesResult> {
  return fetchBranches(options);
}

// Mirrors POST /api/v1/branches/list's response — the admin table shape (/master/branches), unlike Branch above which is the {id,name} shape used for pickers elsewhere.
export type BranchListEntry = {
  id: string;
  coordinating_body_id: string;
  name: string;
  type: BranchTypeEnum;
  coordinating_body_name?: string;
  status: StatusEnum;
  // Only present when include_aggregates is requested — active kader count under this branch.
  user_count?: number;
};

export type ListBranchesOptions = {
  coordinatingBodyId?: string;
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

type BranchListAdminResponse = {
  list: BranchListEntry[];
  metapaging?: {
    total_data: number;
    total_page: number;
    current_page: number;
    page_size: number;
  };
};

// Requires Super Admin/Administrator — only called from the /master/branches admin panel, gated by MasterLayout.
export async function listBranchesAdmin(
  options: ListBranchesOptions = {}
): Promise<PagedListResult<BranchListEntry>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return { list: [], totalData: 0, totalPage: 1, currentPage: 1 };

  const { coordinatingBodyId, search, status, page, pageSize } = options;
  const result = await callApi<BranchListAdminResponse>("/api/v1/branches/list", {
    method: "POST",
    token: sessionToken,
    body: {
      organization_id: process.env.ORGANIZATION_ID,
      include_aggregates: true,
      ...(coordinatingBodyId ? { coordinating_body_id: coordinatingBodyId } : {}),
      ...(search ? { search } : {}),
      ...(status ? { status } : {}),
      page: page ?? 1,
      page_size: pageSize ?? 20,
    },
  });

  if (!isSuccessStatus(result.status)) {
    console.error("[listBranchesAdmin] request failed:", result);
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

// Mirrors POST /api/v1/branches/detail's response.
export type BranchDetail = {
  id: string;
  coordinating_body_id: string;
  name: string;
  type: BranchTypeEnum;
  status: StatusEnum;
  created_at: string;
  updated_at: string;
  coordinating_body?: {
    id: string;
    organization_id: string;
    name: string;
    status: StatusEnum;
  };
};

export async function getBranchDetail(id: string): Promise<BranchDetail | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return null;

  const result = await callApi<BranchDetail>("/api/v1/branches/detail", {
    method: "POST",
    token: sessionToken,
    body: { id },
  });

  if (!isSuccessStatus(result.status) || !result.data) return null;
  return result.data;
}

export type CreateBranchPayload = {
  coordinating_body_id: string;
  name: string;
  type?: BranchTypeEnum;
  status?: StatusEnum;
};

export async function createBranch(
  payload: CreateBranchPayload
): Promise<ApiEnvelope<BranchDetail>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return { status: "UNAUTHORIZED", message: "Session expired. Please log in again." };
  }

  return callApi<BranchDetail>("/api/v1/branches/create", {
    method: "POST",
    token: sessionToken,
    body: payload,
  });
}

export type UpdateBranchPayload = {
  id: string;
  coordinating_body_id?: string;
  name?: string;
  type?: BranchTypeEnum;
  status?: StatusEnum;
};

export async function updateBranch(
  payload: UpdateBranchPayload
): Promise<ApiEnvelope<BranchDetail>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return { status: "UNAUTHORIZED", message: "Session expired. Please log in again." };
  }

  return callApi<BranchDetail>("/api/v1/branches/update", {
    method: "POST",
    token: sessionToken,
    body: payload,
  });
}

export async function deleteBranch(id: string): Promise<ApiEnvelope> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return { status: "UNAUTHORIZED", message: "Session expired. Please log in again." };
  }

  return callApi("/api/v1/branches/delete", {
    method: "POST",
    token: sessionToken,
    body: { id },
  });
}
