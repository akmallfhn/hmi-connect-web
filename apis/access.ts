import "server-only";

import { cookies } from "next/headers";
import { callApi, type ApiEnvelope } from "./api";
import type { PagedListResult, UserProfile } from "./users";
import {
  isSuccessStatus,
  type GenderEnum,
  type VerificationRequestStatusEnum,
} from "@/lib/types";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

// Grant/revoke endpoints for the can_manage_* management scopes — Super Admin-only, mounted under /access rather than /users (see internal/user/README.md's Access control endpoints section).
async function callAccessEndpoint(
  path: string,
  id: string
): Promise<ApiEnvelope<UserProfile>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return { status: "UNAUTHORIZED", message: "Session expired. Please log in again." };
  }

  return callApi<UserProfile>(path, {
    method: "POST",
    token: sessionToken,
    body: { id },
  });
}

export async function grantBranchAdmin(id: string) {
  return callAccessEndpoint("/api/v1/access/grant/branch-admin", id);
}

export async function grantChapterAdmin(id: string) {
  return callAccessEndpoint("/api/v1/access/grant/chapter-admin", id);
}

export async function grantCoordinatingBodyAdmin(id: string) {
  return callAccessEndpoint("/api/v1/access/grant/coordinating-body-admin", id);
}

export async function revokeBranchAdmin(id: string) {
  return callAccessEndpoint("/api/v1/access/revoke/branch-admin", id);
}

export async function revokeChapterAdmin(id: string) {
  return callAccessEndpoint("/api/v1/access/revoke/chapter-admin", id);
}

export async function revokeCoordinatingBodyAdmin(id: string) {
  return callAccessEndpoint("/api/v1/access/revoke/coordinating-body-admin", id);
}

// Mirrors verification-requests/list's row shape — Super Admin sees every request, a branch admin only sees requests under their own branch (scoped implicitly via the caller's JWT, not a request param).
export type VerificationRequestListEntry = {
  id: string;
  user_id: string;
  full_name: string;
  username: string;
  chapter_id: string;
  chapter_name?: string;
  status: VerificationRequestStatusEnum;
  created_at: string;
};

// verification-requests/detail's shape — the only endpoint that ever returns a plaintext nik.
export type VerificationRequestDetail = VerificationRequestListEntry & {
  ktp_full_name: string;
  nik: string;
  phone_number: string;
  date_of_birth: string;
  gender: GenderEnum;
  address_street: string;
  district_id: number;
  updated_at: string;
};

export type VerificationRequestReviewResult = VerificationRequestListEntry & {
  rejection_reason?: string;
  reviewed_by?: string;
  reviewed_at?: string;
};

type ListResponse<T> = {
  list: T[];
  metapaging?: {
    total_data: number;
    total_page: number;
    current_page: number;
    page_size: number;
  };
};

export type ListVerificationRequestsOptions = {
  status?: VerificationRequestStatusEnum;
  page?: number;
  pageSize?: number;
};

// Requires Super Admin, or Administrator with can_manage_branch — used by /branches/[branch_id]/verification.
export async function listVerificationRequests(
  options: ListVerificationRequestsOptions = {}
): Promise<PagedListResult<VerificationRequestListEntry>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return { list: [], totalData: 0, totalPage: 1, currentPage: 1 };

  const { status, page, pageSize } = options;
  const result = await callApi<ListResponse<VerificationRequestListEntry>>(
    "/api/v1/access/verification-requests/list",
    {
      method: "POST",
      token: sessionToken,
      body: {
        status: status ?? "pending",
        page: page ?? 1,
        page_size: pageSize ?? 20,
      },
    }
  );

  if (!isSuccessStatus(result.status)) {
    console.error("[listVerificationRequests] request failed:", result);
    return { list: [], totalData: 0, totalPage: 1, currentPage: 1 };
  }

  const list = result.data?.list ?? [];
  const metapaging = result.data?.metapaging;
  return {
    list,
    totalData: metapaging?.total_data ?? list.length,
    totalPage: metapaging?.total_page ?? 1,
    currentPage: metapaging?.current_page ?? page ?? 1,
  };
}

export async function getVerificationRequestDetail(
  id: string
): Promise<VerificationRequestDetail | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return null;

  const result = await callApi<VerificationRequestDetail>(
    "/api/v1/access/verification-requests/detail",
    { method: "POST", token: sessionToken, body: { id } }
  );

  if (!isSuccessStatus(result.status) || !result.data) return null;
  return result.data;
}

export async function approveVerificationRequest(
  id: string
): Promise<ApiEnvelope<VerificationRequestReviewResult>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return { status: "UNAUTHORIZED", message: "Session expired. Please log in again." };
  }

  return callApi<VerificationRequestReviewResult>(
    "/api/v1/access/verification-requests/approve",
    { method: "POST", token: sessionToken, body: { id } }
  );
}

export async function rejectVerificationRequest(
  id: string,
  rejectionReason?: string
): Promise<ApiEnvelope<VerificationRequestReviewResult>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return { status: "UNAUTHORIZED", message: "Session expired. Please log in again." };
  }

  return callApi<VerificationRequestReviewResult>(
    "/api/v1/access/verification-requests/reject",
    {
      method: "POST",
      token: sessionToken,
      body: {
        id,
        ...(rejectionReason?.trim() ? { rejection_reason: rejectionReason.trim() } : {}),
      },
    }
  );
}
