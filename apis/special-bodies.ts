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
  image_url?: string;
};

// Empty strings clear description/image_url; type and parent are immutable after create.
export type UpdateSpecialBodyPayload = {
  id: string;
  name?: string;
  description?: string;
  image_url?: string;
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

export async function listSpecialBodiesAdmin(
  options: ListSpecialBodiesOptions = {}
): Promise<ListSpecialBodiesResult> {
  const currentPage = options.page ?? 1;
  const empty = { list: [], totalData: 0, totalPage: 1, currentPage };
  const sessionToken = await getSessionToken();
  if (!sessionToken) return empty;

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
        page: currentPage,
        ...(options.pageSize ? { page_size: options.pageSize } : {}),
      },
    }
  );
  if (!isSuccessStatus(result.status) || !result.data) return empty;

  const rows = result.data.list ?? [];
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
  const metapaging = result.data.metapaging;

  return {
    list: rows.map((row) => ({
      ...row,
      parent: parents.get(parentKey(row)) ?? null,
    })),
    totalData: metapaging?.total_data ?? rows.length,
    totalPage: metapaging?.total_page ?? 1,
    currentPage: metapaging?.current_page ?? currentPage,
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
