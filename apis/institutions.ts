import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
import { SESSION_COOKIE_NAME } from "./session";

export type Institution = {
  id: number;
  name: string;
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

export async function getInstitutions(
  options: GetInstitutionsOptions = {}
): Promise<Institution[]> {
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

  return result.data?.list ?? [];
}
