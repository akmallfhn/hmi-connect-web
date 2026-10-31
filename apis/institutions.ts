import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
import {
  isSuccessStatus,
  type InstitutionSortByEnum,
  type SortTypeEnum,
  type StatusName,
} from "@/lib/types";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

export type Institution = {
  id: number;
  name: string;
  alias?: string | null;
  image_url?: string | null;
};

export type InstitutionDetail = Institution & {
  district_id?: number | null;
  district_name?: string | null;
  city_id?: number | null;
  city_name?: string | null;
  province_id?: number | null;
  province_name?: string | null;
  address?: string | null;
  created_at: string;
  updated_at: string;
};

export type InstitutionListEntry = Institution & {
  chapter_count: number;
  user_count: number;
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
  sortBy?: InstitutionSortByEnum;
  sortType?: SortTypeEnum;
  includeAggregates?: boolean;
  page?: number;
  pageSize?: number;
};

export type GetInstitutionsResult = {
  list: Institution[];
  hasMore: boolean;
  totalData: number;
  totalPage: number;
  currentPage: number;
};

export type InstitutionPayload = {
  name: string;
  alias?: string;
  image_url?: string;
  district_id?: number;
  address?: string;
};

export type UpdateInstitutionPayload = Partial<InstitutionPayload> & {
  id: number;
};

export type InstitutionWriteResult =
  | { ok: true; institution: InstitutionDetail }
  | { ok: false; message: string };

export type PagedInstitutionResult = Omit<
  GetInstitutionsResult,
  "hasMore" | "list"
> & {
  list: InstitutionListEntry[];
};

async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

async function fetchInstitutions(
  options: GetInstitutionsOptions = {}
): Promise<GetInstitutionsResult> {
  const {
    search,
    sortBy,
    sortType,
    includeAggregates,
    page,
    pageSize,
  } = options;
  const currentPage = page ?? 1;
  const sessionToken = await getSessionToken();

  if (!sessionToken) {
    return {
      list: [],
      hasMore: false,
      totalData: 0,
      totalPage: 1,
      currentPage,
    };
  }

  const result = await callApi<InstitutionsListResponse>(
    "/api/v1/institutions/list",
    {
      method: "POST",
      token: sessionToken,
      body: {
        ...(search ? { search } : {}),
        ...(sortBy ? { sort_by: sortBy } : {}),
        ...(sortType ? { sort_type: sortType } : {}),
        ...(includeAggregates ? { include_aggregates: true } : {}),
        ...(page ? { page } : {}),
        ...(pageSize ? { page_size: pageSize } : {}),
      },
    }
  );

  const list = result.data?.list ?? [];
  const metapaging = result.data?.metapaging;
  const hasMore = metapaging ? metapaging.current_page < metapaging.total_page : false;

  return {
    list,
    hasMore,
    totalData: metapaging?.total_data ?? list.length,
    totalPage: metapaging?.total_page ?? 1,
    currentPage: metapaging?.current_page ?? currentPage,
  };
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

export async function listInstitutionsAdmin(
  options: GetInstitutionsOptions = {}
): Promise<PagedInstitutionResult> {
  const result = await fetchInstitutions(options);
  return {
    list: result.list as InstitutionListEntry[],
    totalData: result.totalData,
    totalPage: result.totalPage,
    currentPage: result.currentPage,
  };
}

export async function getInstitutionDetail(
  id: number
): Promise<InstitutionDetail | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken || !Number.isSafeInteger(id) || id < 1) return null;

  const result = await callApi<InstitutionDetail>(
    "/api/v1/institutions/detail",
    {
      method: "POST",
      token: sessionToken,
      body: { id },
    }
  );

  if (!isSuccessStatus(result.status)) return null;
  return result.data ?? null;
}

export async function createInstitution(
  name: string
): Promise<Institution | null> {
  const result = await createInstitutionAdmin({ name });
  return result.ok ? result.institution : null;
}

export async function createInstitutionAdmin(
  payload: InstitutionPayload
): Promise<InstitutionWriteResult> {
  return writeInstitution("/api/v1/institutions/create", payload);
}

export async function updateInstitution(
  payload: UpdateInstitutionPayload
): Promise<InstitutionWriteResult> {
  return writeInstitution("/api/v1/institutions/update", payload);
}

export async function deleteInstitution(
  id: number
): Promise<{ ok: boolean; message?: string }> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return { ok: false, message: "Sesi kamu sudah berakhir." };
  }

  const result = await callApi("/api/v1/institutions/delete", {
    method: "POST",
    token: sessionToken,
    body: { id },
  });

  if (isSuccessStatus(result.status)) return { ok: true };
  return {
    ok: false,
    message: institutionWriteErrorMessage(result.status, result.message),
  };
}

async function writeInstitution(
  path: string,
  body: object
): Promise<InstitutionWriteResult> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return { ok: false, message: "Sesi kamu sudah berakhir." };
  }

  const result = await callApi<InstitutionDetail>(path, {
    method: "POST",
    token: sessionToken,
    body,
  });

  if (!isSuccessStatus(result.status) || !result.data) {
    return {
      ok: false,
      message: institutionWriteErrorMessage(result.status, result.message),
    };
  }
  return { ok: true, institution: result.data };
}

function institutionWriteErrorMessage(
  status: StatusName | undefined,
  message?: string
): string {
  switch (status) {
    case "FORBIDDEN":
      return "Kamu tidak punya akses untuk mengelola institusi.";
    case "NOT_FOUND":
      return "Institusi tidak ditemukan.";
    case "CONFLICT":
      return "Nama institusi sudah digunakan.";
    case "BAD_REQUEST":
      return message?.includes("district")
        ? "Kecamatan yang dipilih tidak ditemukan."
        : "Data institusi belum lengkap atau tidak valid.";
    default:
      return "Gagal menyimpan perubahan institusi. Coba lagi.";
  }
}
