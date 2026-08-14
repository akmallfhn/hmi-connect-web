import "server-only";

import { render } from "@react-email/components";
import { cookies } from "next/headers";
import { VerificationApprovedEmail } from "@/components/emails/VerificationApprovedEmail";
import { SESSION_COOKIE_NAME, getMainSiteOrigin } from "@/lib/constants";
import { sendEmail } from "@/lib/mailtrap";
import {
  isSuccessStatus,
  type GenderEnum,
  type VerificationRequestStatusEnum,
} from "@/lib/types";
import { callApi, type ApiEnvelope } from "./api";
import type { PagedListResult } from "./users";

export type VerificationRequestListEntry = {
  id: string;
  user_id: string;
  full_name: string;
  username: string;
  email?: string;
  avatar?: string;
  chapter_id: string;
  chapter_name?: string;
  branch_id?: string;
  branch_name?: string;
  status: VerificationRequestStatusEnum;
  created_at: string;
};

export type VerificationRequestDetail = VerificationRequestListEntry & {
  ktp_full_name: string;
  phone_number: string;
  date_of_birth: string;
  gender: GenderEnum;
  address_street: string;
  district_id: number;
  district_name?: string;
  city_id?: number;
  city_name?: string;
  province_id?: number;
  province_name?: string;
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
  branchId?: string;
  status?: VerificationRequestStatusEnum;
  search?: string;
  page?: number;
  pageSize?: number;
};

// List/detail support Super Admin, organization admin, and branch admin according to backend scope.
export async function listVerificationRequests(
  options: ListVerificationRequestsOptions = {}
): Promise<PagedListResult<VerificationRequestListEntry>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return { list: [], totalData: 0, totalPage: 1, currentPage: 1 };
  }

  const { branchId, status, search, page, pageSize } = options;
  const result = await callApi<ListResponse<VerificationRequestListEntry>>(
    "/api/v1/verification-requests/list",
    {
      method: "POST",
      token: sessionToken,
      body: {
        status: status ?? "pending",
        ...(branchId ? { branch_id: branchId } : {}),
        ...(search ? { search } : {}),
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

const ALL_VERIFICATION_REQUEST_STATUSES: VerificationRequestStatusEnum[] = [
  "pending",
  "approved",
  "rejected",
];
const ALL_STATUS_FETCH_SIZE = 100;

// The backend accepts one status per request. Compose the UI's "Semua Status" option here.
export async function listVerificationRequestsForReview(
  options: ListVerificationRequestsOptions = {}
): Promise<PagedListResult<VerificationRequestListEntry>> {
  if (options.status) return listVerificationRequests(options);

  const results = await Promise.all(
    ALL_VERIFICATION_REQUEST_STATUSES.map((status) =>
      listVerificationRequests({
        ...options,
        status,
        page: 1,
        pageSize: ALL_STATUS_FETCH_SIZE,
      })
    )
  );
  const list = results
    .flatMap((result) => result.list)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

  return {
    list,
    totalData: list.length,
    totalPage: 1,
    currentPage: 1,
  };
}

export async function getVerificationRequestDetail(
  id: string
): Promise<VerificationRequestDetail | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return null;

  const result = await callApi<VerificationRequestDetail>(
    "/api/v1/verification-requests/detail",
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
    return {
      status: "UNAUTHORIZED",
      message: "Session expired. Please log in again.",
    };
  }

  const result = await callApi<VerificationRequestReviewResult>(
    "/api/v1/verification-requests/approve",
    { method: "POST", token: sessionToken, body: { id } }
  );

  if (isSuccessStatus(result.status) && result.data) {
    sendVerificationApprovedEmail(result.data).catch((err) => {
      console.error(
        "[approveVerificationRequest] sendVerificationApprovedEmail threw:",
        err
      );
    });
  }

  return result;
}

// Fire-and-forget — a failed send must never fail the approval itself.
async function sendVerificationApprovedEmail(
  request: VerificationRequestListEntry
) {
  if (!request.email) return;

  const html = await render(
    VerificationApprovedEmail({
      fullName: request.full_name,
      username: request.username,
      siteUrl: getMainSiteOrigin(),
    })
  );

  await sendEmail({
    mailRecipients: [request.email],
    mailSubject: "Akun kamu sudah terverifikasi di HMI Connect 🎉",
    mailHtml: html,
  });
}

export async function rejectVerificationRequest(
  id: string,
  rejectionReason?: string
): Promise<ApiEnvelope<VerificationRequestReviewResult>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return {
      status: "UNAUTHORIZED",
      message: "Session expired. Please log in again.",
    };
  }

  return callApi<VerificationRequestReviewResult>(
    "/api/v1/verification-requests/reject",
    {
      method: "POST",
      token: sessionToken,
      body: {
        id,
        ...(rejectionReason?.trim()
          ? { rejection_reason: rejectionReason.trim() }
          : {}),
      },
    }
  );
}
