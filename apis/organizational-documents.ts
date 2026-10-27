import "server-only";

import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { isSuccessStatus, type StatusEnum, type StatusName } from "@/lib/types";
import { callApi } from "./api";

export type DocumentOutlineItem = {
  title: string;
  page: number;
  children: DocumentOutlineItem[];
};

export type OrganizationalDocumentListEntry = {
  id: number;
  organization_id: string;
  title: string;
  file_media_id: string;
  file_url: string;
  image_media_id: string | null;
  image_url: string | null;
  page_count: number | null;
  status: StatusEnum;
  slug_url: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  // Empty when the uploader's account no longer resolves.
  created_by_name: string;
  created_by_username: string;
  created_by_avatar: string | null;
};

export type OrganizationalDocumentDetail = OrganizationalDocumentListEntry & {
  table_of_contents: DocumentOutlineItem[];
};

type ListResponse<T> = {
  list?: T[];
  metapaging?: {
    total_data: number;
    total_page: number;
    current_page: number;
    page_size: number;
  };
};

export type PagedDocumentResult = {
  list: OrganizationalDocumentListEntry[];
  totalData: number;
  totalPage: number;
  currentPage: number;
};

export type OrganizationalDocumentWriteResult =
  | { ok: true; document: OrganizationalDocumentDetail }
  | { ok: false; message: string };

export type CreateOrganizationalDocumentPayload = {
  organization_id: string;
  title: string;
  file_media_id: string;
  image_media_id?: string;
  page_count?: number;
  // Omitted on create, where the backend defaults it to []; set later from the outline sheet.
  table_of_contents?: DocumentOutlineItem[];
  status: StatusEnum;
  published_at: string;
};

// An empty image_media_id clears the cover; every other omitted field stays unchanged.
export type UpdateOrganizationalDocumentPayload = Partial<
  Omit<CreateOrganizationalDocumentPayload, "organization_id">
> & { id: number };

async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

// Inactive rows and the status filter only reach callers who may manage that organization's documents.
export async function listOrganizationalDocuments(
  options: {
    search?: string;
    status?: StatusEnum;
    page?: number;
    pageSize?: number;
  } = {}
): Promise<PagedDocumentResult> {
  const page = options.page ?? 1;
  const empty = { list: [], totalData: 0, totalPage: 1, currentPage: page };
  const token = await getSessionToken();
  if (!token) return empty;

  const result = await callApi<ListResponse<OrganizationalDocumentListEntry>>(
    "/api/v1/organizational-documents/list",
    {
      method: "POST",
      token,
      body: {
        ...(options.search ? { search: options.search } : {}),
        ...(options.status ? { status: options.status } : {}),
        page,
        page_size: options.pageSize ?? 20,
      },
    }
  );

  if (!isSuccessStatus(result.status)) return empty;
  const list = result.data?.list ?? [];
  return {
    list,
    totalData: result.data?.metapaging?.total_data ?? list.length,
    totalPage: result.data?.metapaging?.total_page ?? 1,
    currentPage: result.data?.metapaging?.current_page ?? page,
  };
}

// Answers 404 for a missing or deleted document, or an inactive one the caller cannot manage; all surface as null.
export async function getOrganizationalDocumentDetail(
  id: number
): Promise<OrganizationalDocumentDetail | null> {
  const token = await getSessionToken();
  if (!token || !Number.isSafeInteger(id) || id < 1) return null;

  const result = await callApi<OrganizationalDocumentDetail>(
    "/api/v1/organizational-documents/detail",
    { method: "POST", token, body: { id } }
  );

  if (!isSuccessStatus(result.status)) return null;
  return result.data ?? null;
}

export async function createOrganizationalDocument(
  payload: CreateOrganizationalDocumentPayload
): Promise<OrganizationalDocumentWriteResult> {
  return writeDocument("/api/v1/organizational-documents/create", payload);
}

export async function updateOrganizationalDocument(
  payload: UpdateOrganizationalDocumentPayload
): Promise<OrganizationalDocumentWriteResult> {
  return writeDocument("/api/v1/organizational-documents/update", payload);
}

export async function deleteOrganizationalDocument(
  id: number
): Promise<{ ok: boolean; message?: string }> {
  const token = await getSessionToken();
  if (!token) return { ok: false, message: "Sesi kamu sudah berakhir." };

  const result = await callApi("/api/v1/organizational-documents/delete", {
    method: "POST",
    token,
    body: { id },
  });
  if (isSuccessStatus(result.status)) return { ok: true };
  return { ok: false, message: writeErrorMessage(result.status) };
}

async function writeDocument(
  path: string,
  body: object
): Promise<OrganizationalDocumentWriteResult> {
  const token = await getSessionToken();
  if (!token) return { ok: false, message: "Sesi kamu sudah berakhir." };

  const result = await callApi<OrganizationalDocumentDetail>(path, {
    method: "POST",
    token,
    body,
  });

  if (!isSuccessStatus(result.status) || !result.data) {
    return {
      ok: false,
      message: writeErrorMessage(result.status, result.message),
    };
  }
  return { ok: true, document: result.data };
}

function writeErrorMessage(
  status: StatusName | undefined,
  message?: string
): string {
  switch (status) {
    case "FORBIDDEN":
      return "Kamu tidak punya akses untuk mengelola pedoman organisasi ini.";
    case "NOT_FOUND":
      return "Pedoman atau file yang dipilih tidak ditemukan.";
    case "CONFLICT":
      return message?.includes("slug")
        ? "Sudah ada pedoman dengan judul yang sama."
        : "File belum siap dipakai. Unggah ulang lalu coba lagi.";
    case "BAD_REQUEST":
      return message?.includes("table_of_contents")
        ? "Daftar isi tidak valid: setiap bagian butuh judul dan halaman yang ada di dokumen."
        : "Data pedoman belum lengkap atau tidak valid.";
    default:
      return "Gagal menyimpan pedoman. Coba lagi.";
  }
}
