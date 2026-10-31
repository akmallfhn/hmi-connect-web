import "server-only";

import { cookies } from "next/headers";
import { callApi, type ApiEnvelope } from "./api";
import { getBranchDetail } from "./branches";
import { getChapterDetail } from "./chapters";
import { getCoordinatingBodyDetail } from "./coordinating-bodies";
import { getCoordinatingChapterDetail } from "./coordinating-chapters";
import { getOrganizationDetail } from "./organizations";
import {
  isSuccessStatus,
  type AccessEntityTypeEnum,
  type SpecialBodyTypeEnum,
  type StatusEnum,
} from "@/lib/types";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { specialBodyLevelRank } from "@/lib/special-body";

export type SpecialBodyListEntry = {
  id: string;
  type: SpecialBodyTypeEnum;
  parent_entity_type: AccessEntityTypeEnum;
  parent_entity_id: string;
  name: string;
  image_url?: string | null;
  status: StatusEnum;
};

export type SpecialBodyDetail = SpecialBodyListEntry & {
  description?: string | null;
  image_media_id?: string | null;
  created_at: string;
  updated_at: string;
};

// The list only carries the parent's type and id, so its name (and a Korkom/Komisariat's Cabang) is resolved here.
export type SpecialBodyParent = {
  name: string;
  branchName?: string | null;
};

export type SpecialBodyAdminEntry = SpecialBodyListEntry & {
  parent: SpecialBodyParent | null;
};

type SpecialBodyListResponse = {
  list: SpecialBodyListEntry[];
  metapaging?: {
    total_data: number;
    total_page: number;
    current_page: number;
    page_size: number;
  };
};

export type ListSpecialBodiesOptions = {
  type?: SpecialBodyTypeEnum;
  parentEntityType?: AccessEntityTypeEnum;
  parentEntityId?: string;
  status?: StatusEnum;
  search?: string;
  page?: number;
  pageSize?: number;
};

export type ListSpecialBodiesResult = {
  list: SpecialBodyAdminEntry[];
  totalData: number;
  totalPage: number;
  currentPage: number;
};

export type CreateSpecialBodyPayload = {
  type: SpecialBodyTypeEnum;
  parent_entity_type: AccessEntityTypeEnum;
  parent_entity_id: string;
  name: string;
  description?: string;
  image_media_id?: string;
};

// Empty strings clear description/logo; type and parent are immutable after create.
export type UpdateSpecialBodyPayload = {
  id: string;
  name?: string;
  description?: string;
  image_media_id?: string;
};

async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

async function resolveParent(
  type: AccessEntityTypeEnum,
  id: string
): Promise<SpecialBodyParent | null> {
  switch (type) {
    case "organization": {
      const detail = await getOrganizationDetail(id);
      return detail ? { name: detail.name } : null;
    }
    case "coordinating_body": {
      const detail = await getCoordinatingBodyDetail(id);
      return detail ? { name: detail.name } : null;
    }
    case "branch": {
      const detail = await getBranchDetail(id);
      return detail ? { name: detail.name } : null;
    }
    case "coordinating_chapter": {
      const detail = await getCoordinatingChapterDetail(id);
      return detail
        ? { name: detail.name, branchName: detail.branch_name }
        : null;
    }
    case "chapter": {
      const detail = await getChapterDetail(id);
      return detail
        ? { name: detail.name, branchName: detail.branch_name }
        : null;
    }
  }
}

const FETCH_PAGE_SIZE = 100;
const MAX_FETCH_PAGES = 50;

// The backend orders by type then name, so every page is read and re-sorted PB HMI first, then down the levels.
async function fetchAllSpecialBodies(
  sessionToken: string,
  options: ListSpecialBodiesOptions
): Promise<SpecialBodyListEntry[] | null> {
  const rows: SpecialBodyListEntry[] = [];
  for (let page = 1; page <= MAX_FETCH_PAGES; page++) {
    const result = await callApi<SpecialBodyListResponse>(
      "/api/v1/special-bodies/list",
      {
        method: "POST",
        token: sessionToken,
        body: {
          ...(options.type ? { type: options.type } : {}),
          ...(options.parentEntityType
            ? { parent_entity_type: options.parentEntityType }
            : {}),
          ...(options.parentEntityId
            ? { parent_entity_id: options.parentEntityId }
            : {}),
          ...(options.status ? { status: options.status } : {}),
          ...(options.search ? { search: options.search } : {}),
          page,
          page_size: FETCH_PAGE_SIZE,
        },
      }
    );
    if (!isSuccessStatus(result.status) || !result.data) {
      return page === 1 ? null : rows;
    }
    rows.push(...(result.data.list ?? []));
    const totalPage = result.data.metapaging?.total_page ?? 1;
    if (page >= totalPage) break;
  }
  return rows.sort(
    (a, b) =>
      specialBodyLevelRank(a.parent_entity_type) -
        specialBodyLevelRank(b.parent_entity_type) ||
      a.name.localeCompare(b.name, "id")
  );
}

export async function listSpecialBodiesAdmin(
  options: ListSpecialBodiesOptions = {}
): Promise<ListSpecialBodiesResult> {
  const pageSize = options.pageSize ?? 20;
  const requestedPage = Math.max(1, options.page ?? 1);
  const empty = {
    list: [],
    totalData: 0,
    totalPage: 1,
    currentPage: requestedPage,
  };
  const sessionToken = await getSessionToken();
  if (!sessionToken) return empty;

  const allRows = await fetchAllSpecialBodies(sessionToken, options);
  if (!allRows) return empty;

  const totalPage = Math.max(1, Math.ceil(allRows.length / pageSize));
  const currentPage = Math.min(requestedPage, totalPage);
  const rows = allRows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const parentKey = (row: SpecialBodyListEntry) =>
    `${row.parent_entity_type}:${row.parent_entity_id}`;
  const uniqueRows = [
    ...new Map(rows.map((row) => [parentKey(row), row])).values(),
  ];
  const parents = new Map(
    await Promise.all(
      uniqueRows.map(
        async (row) =>
          [
            parentKey(row),
            await resolveParent(row.parent_entity_type, row.parent_entity_id),
          ] as const
      )
    )
  );
  return {
    list: rows.map((row) => ({
      ...row,
      parent: parents.get(parentKey(row)) ?? null,
    })),
    totalData: allRows.length,
    totalPage,
    currentPage,
  };
}

export async function getSpecialBodyDetail(
  id: string
): Promise<SpecialBodyDetail | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

  const result = await callApi<SpecialBodyDetail>(
    "/api/v1/special-bodies/detail",
    { method: "POST", token: sessionToken, body: { id } }
  );
  if (!isSuccessStatus(result.status) || !result.data) return null;
  return result.data;
}

export async function createSpecialBody(
  payload: CreateSpecialBodyPayload
): Promise<ApiEnvelope<SpecialBodyDetail>> {
  return writeSpecialBody<SpecialBodyDetail>("create", payload);
}

export async function updateSpecialBody(
  payload: UpdateSpecialBodyPayload
): Promise<ApiEnvelope<SpecialBodyDetail>> {
  return writeSpecialBody<SpecialBodyDetail>("update", payload);
}

export async function deleteSpecialBody(id: string): Promise<ApiEnvelope> {
  return writeSpecialBody("delete", { id });
}

// Suspension answers to the parent, never to the body's own admins — hence its own endpoint.
export async function suspendSpecialBody(
  id: string
): Promise<ApiEnvelope<SpecialBodyDetail>> {
  return writeSpecialBody<SpecialBodyDetail>("suspend", { id });
}

export async function activateSpecialBody(
  id: string
): Promise<ApiEnvelope<SpecialBodyDetail>> {
  return writeSpecialBody<SpecialBodyDetail>("activate", { id });
}

async function writeSpecialBody<T = unknown>(
  action: "create" | "update" | "delete" | "suspend" | "activate",
  body: object
): Promise<ApiEnvelope<T>> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return {
      status: "UNAUTHORIZED",
      message: "Sesi kamu sudah berakhir. Silakan masuk kembali.",
    };
  }

  const result = await callApi<T>(`/api/v1/special-bodies/${action}`, {
    method: "POST",
    token: sessionToken,
    body,
  });
  if (isSuccessStatus(result.status)) return result;
  return { ...result, message: specialBodyErrorMessage(result) };
}

function specialBodyErrorMessage(result: ApiEnvelope<unknown>): string {
  const message = result.message ?? "";
  if (message.includes("media")) {
    return "Logo tidak valid atau belum selesai diunggah. Unggah ulang logonya.";
  }
  if (message.includes("already has a special body")) {
    return "Entitas ini sudah memiliki lembaga dengan jenis yang sama.";
  }
  if (message.includes("parent entity is inactive")) {
    return "Entitas induk sedang disuspend, jadi belum bisa ditambahkan lembaga baru.";
  }
  if (message.includes("parent entity not found")) {
    return "Entitas induk tidak ditemukan.";
  }
  if (message.includes("may sit under")) {
    return "Jenis lembaga ini tidak boleh berada di tingkat yang dipilih.";
  }
  switch (result.status) {
    case "FORBIDDEN":
      return "Kamu tidak punya akses untuk mengelola lembaga ini.";
    case "NOT_FOUND":
      return "Lembaga tidak ditemukan.";
    case "BAD_REQUEST":
      return "Data lembaga belum lengkap atau tidak valid.";
    default:
      return "Gagal menyimpan perubahan. Coba lagi.";
  }
}
