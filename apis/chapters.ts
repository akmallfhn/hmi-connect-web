import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
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
