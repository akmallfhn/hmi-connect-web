import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
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
