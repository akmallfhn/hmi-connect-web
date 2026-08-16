import "server-only";

import { cookies } from "next/headers";
import { callApi, type ApiEnvelope } from "./api";
import { isSuccessStatus, type StatusEnum } from "@/lib/types";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

export type CoordinatingBody = {
  id: string;
  name: string;
};

// Mirrors POST /api/v1/coordinating-bodies/detail's response — used to seed the Badko filter's default label on /master/branches.
export type CoordinatingBodyDetail = {
  id: string;
  organization_id: string;
  name: string;
  status: StatusEnum;
  created_at: string;
  updated_at: string;
  organization?: {
    id: string;
    name: string;
    slug: string;
    status: StatusEnum;
  };
};

export async function getCoordinatingBodyDetail(
  id: string,
): Promise<CoordinatingBodyDetail | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return null;

  const result = await callApi<CoordinatingBodyDetail>(
    "/api/v1/coordinating-bodies/detail",
    {
      method: "POST",
      token: sessionToken,
      body: { id },
    },
  );

  if (!isSuccessStatus(result.status) || !result.data) return null;
  return result.data;
}

type CoordinatingBodiesListResponse = {
  list: CoordinatingBody[];
  metapaging?: {
    total_data: number;
    total_page: number;
    current_page: number;
    page_size: number;
  };
};

export type GetCoordinatingBodiesOptions = {
  search?: string;
  page?: number;
  pageSize?: number;
};

export type GetCoordinatingBodiesResult = {
  list: CoordinatingBody[];
  hasMore: boolean;
};

// Backs the Badko picker in the admin branch form — same shape/status-filter convention as searchBranches.
export async function searchCoordinatingBodies(
  options: GetCoordinatingBodiesOptions = {},
): Promise<GetCoordinatingBodiesResult> {
  const { search, page, pageSize } = options;
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  const result = await callApi<CoordinatingBodiesListResponse>(
    "/api/v1/coordinating-bodies/list",
    {
      method: "POST",
      token: sessionToken,
      body: {
        organization_id: process.env.ORGANIZATION_ID,
        status: "active",
        ...(search ? { search } : {}),
        ...(page ? { page } : {}),
        ...(pageSize ? { page_size: pageSize } : {}),
      },
    },
  );

  const list = result.data?.list ?? [];
  const metapaging = result.data?.metapaging;
  const hasMore = metapaging
    ? metapaging.current_page < metapaging.total_page
    : false;

  return { list, hasMore };
}

// Mirrors POST /api/v1/coordinating-bodies/list's response — the admin table shape (/master/coordinating-bodies). organization_name is intentionally left off — this app only manages one organization, so it'd be dead weight on every row.
export type CoordinatingBodyListEntry = {
  id: string;
  name: string;
  status: StatusEnum;
  // Only present when include_aggregates is requested — active kader count under this Badko via its branches/chapters.
  user_count?: number;
  // Only present when include_aggregates is requested — branch count under this Badko.
  branch_count?: number;
};

export type ListCoordinatingBodiesOptions = {
  organizationId?: string;
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

type CoordinatingBodyListAdminResponse = {
  list: CoordinatingBodyListEntry[];
  metapaging?: {
    total_data: number;
    total_page: number;
    current_page: number;
    page_size: number;
  };
};

// Requires the admin CRUD role; callers are gated by either the Master or Organization layout.
export async function listCoordinatingBodiesAdmin(
  options: ListCoordinatingBodiesOptions = {},
): Promise<PagedListResult<CoordinatingBodyListEntry>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken)
    return { list: [], totalData: 0, totalPage: 1, currentPage: 1 };

  const { organizationId, search, status, page, pageSize } = options;
  const result = await callApi<CoordinatingBodyListAdminResponse>(
    "/api/v1/coordinating-bodies/list",
    {
      method: "POST",
      token: sessionToken,
      body: {
        organization_id: organizationId ?? process.env.ORGANIZATION_ID,
        include_aggregates: true,
        ...(search ? { search } : {}),
        ...(status ? { status } : {}),
        page: page ?? 1,
        page_size: pageSize ?? 20,
      },
    },
  );

  if (!isSuccessStatus(result.status)) {
    console.error("[listCoordinatingBodiesAdmin] request failed:", result);
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

export type CreateCoordinatingBodyPayload = {
  name: string;
  status?: StatusEnum;
};

// organization_id is always this app's single ORGANIZATION_ID — never exposed as a caller-supplied field.
export async function createCoordinatingBody(
  payload: CreateCoordinatingBodyPayload,
): Promise<ApiEnvelope<CoordinatingBodyDetail>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return {
      status: "UNAUTHORIZED",
      message: "Session expired. Please log in again.",
    };
  }

  return callApi<CoordinatingBodyDetail>("/api/v1/coordinating-bodies/create", {
    method: "POST",
    token: sessionToken,
    body: { organization_id: process.env.ORGANIZATION_ID, ...payload },
  });
}

export type UpdateCoordinatingBodyPayload = {
  id: string;
  name?: string;
  status?: StatusEnum;
};

export async function updateCoordinatingBody(
  payload: UpdateCoordinatingBodyPayload,
): Promise<ApiEnvelope<CoordinatingBodyDetail>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return {
      status: "UNAUTHORIZED",
      message: "Session expired. Please log in again.",
    };
  }

  return callApi<CoordinatingBodyDetail>("/api/v1/coordinating-bodies/update", {
    method: "POST",
    token: sessionToken,
    body: payload,
  });
}

export async function deleteCoordinatingBody(id: string): Promise<ApiEnvelope> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return {
      status: "UNAUTHORIZED",
      message: "Session expired. Please log in again.",
    };
  }

  return callApi("/api/v1/coordinating-bodies/delete", {
    method: "POST",
    token: sessionToken,
    body: { id },
  });
}
