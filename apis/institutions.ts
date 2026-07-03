import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
import { SESSION_COOKIE_NAME } from "./session";

export type Institution = {
  id: number;
  name: string;
  image_url?: string | null;
};

type InstitutionsListResponse = {
  list: Institution[];
  metapaging?: {
    total_data: number;
    total_page: number;
    current_page: number;
    page_size: number;
  };
};

export type GetInstitutionsOptions = {
  search?: string;
  page?: number;
  pageSize?: number;
};

export type GetInstitutionsResult = {
  list: Institution[];
  hasMore: boolean;
};

async function fetchInstitutions(
  options: GetInstitutionsOptions = {}
): Promise<GetInstitutionsResult> {
  const { search, page, pageSize } = options;
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  const result = await callApi<InstitutionsListResponse>(
    "/api/v1/institutions/list",
    {
      method: "POST",
      token: sessionToken,
      body: {
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

export async function getInstitutions(
  options: GetInstitutionsOptions = {}
): Promise<Institution[]> {
  const { list } = await fetchInstitutions(options);
  return list;
}

export async function searchInstitutions(
  options: GetInstitutionsOptions = {}
): Promise<GetInstitutionsResult> {
  return fetchInstitutions(options);
}

export async function createInstitution(
  name: string
): Promise<Institution | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  const result = await callApi<Institution>("/api/v1/institutions/create", {
    method: "POST",
    token: sessionToken,
    body: { name },
  });

  if (!result.success || !result.data) return null;
  return result.data;
}
