import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
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
};

export async function getCoordinatingBodyDetail(
  id: string
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
    }
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
  options: GetCoordinatingBodiesOptions = {}
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
    }
  );

  const list = result.data?.list ?? [];
  const metapaging = result.data?.metapaging;
  const hasMore = metapaging ? metapaging.current_page < metapaging.total_page : false;

  return { list, hasMore };
}
