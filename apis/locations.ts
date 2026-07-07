import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

export type Province = { id: number; name: string };
export type City = { id: number; province_id: number; name: string };
export type Subdistrict = { id: number; city_id: number; name: string };

type LocationListResponse<T> = {
  list: T[];
  metapaging?: {
    total_data: number;
    total_page: number;
    current_page: number;
    page_size: number;
  };
};

export type LocationListOptions = {
  search?: string;
  page?: number;
  pageSize?: number;
};

export type LocationListResult<T> = {
  list: T[];
  hasMore: boolean;
};

async function fetchLocationList<T>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<LocationListResult<T>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  const result = await callApi<LocationListResponse<T>>(endpoint, {
    method: "POST",
    token: sessionToken,
    body,
  });

  const list = result.data?.list ?? [];
  const metapaging = result.data?.metapaging;
  const hasMore = metapaging ? metapaging.current_page < metapaging.total_page : false;

  return { list, hasMore };
}

export async function searchProvinces(
  options: LocationListOptions = {}
): Promise<LocationListResult<Province>> {
  const { search, page, pageSize } = options;
  return fetchLocationList<Province>("/api/v1/provinces/list", {
    ...(search ? { search } : {}),
    ...(page ? { page } : {}),
    ...(pageSize ? { page_size: pageSize } : {}),
  });
}

export async function searchCities(
  provinceId: number,
  options: LocationListOptions = {}
): Promise<LocationListResult<City>> {
  const { search, page, pageSize } = options;
  return fetchLocationList<City>("/api/v1/cities/list", {
    province_id: provinceId,
    ...(search ? { search } : {}),
    ...(page ? { page } : {}),
    ...(pageSize ? { page_size: pageSize } : {}),
  });
}

export async function searchSubdistricts(
  cityId: number,
  options: LocationListOptions = {}
): Promise<LocationListResult<Subdistrict>> {
  const { search, page, pageSize } = options;
  return fetchLocationList<Subdistrict>("/api/v1/subdistricts/list", {
    city_id: cityId,
    ...(search ? { search } : {}),
    ...(page ? { page } : {}),
    ...(pageSize ? { page_size: pageSize } : {}),
  });
}
