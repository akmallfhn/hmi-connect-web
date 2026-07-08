import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";
import { callApi, type ApiEnvelope } from "./api";
import {
  isSuccessStatus,
  type Degree,
  type GenderEnum,
  type TrainingResultEnum,
  type TrainingStatusEnum,
  type UserStatusEnum,
} from "@/lib/types";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

export type ActivationPayload = {
  branch_id: string;
  training_result: TrainingResultEnum;
  training_organizer_name: string;
  training_year: number;
  education_institution_id: number;
  education_degree: Degree;
  education_major: string;
  education_start_year: number;
  education_end_year: number;
};

export type ActivationResult = {
  user_id: string;
  branch_id: string;
  username: string;
  user_email: string;
  status: UserStatusEnum;
};

export async function activateUser(
  payload: ActivationPayload
): Promise<ApiEnvelope<ActivationResult>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return {
      status: "UNAUTHORIZED",
      message: "Session expired. Please log in again.",
    };
  }

  return callApi<ActivationResult>("/api/v1/users/activation", {
    method: "POST",
    token: sessionToken,
    body: payload,
  });
}

export type VerificationPayload = {
  ktp_full_name: string;
  nik: string;
  phone_number: string;
  date_of_birth: string;
  gender: GenderEnum;
  address_street: string;
  district_id: number;
};

export type VerificationResult = {
  user_id: string;
  ktp_full_name: string;
  district_id: number;
  is_verified: boolean;
};

export async function verifyUser(
  payload: VerificationPayload
): Promise<ApiEnvelope<VerificationResult>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return {
      status: "UNAUTHORIZED",
      message: "Session expired. Please log in again.",
    };
  }

  return callApi<VerificationResult>("/api/v1/users/verification", {
    method: "POST",
    token: sessionToken,
    body: payload,
  });
}

export type TrainingHistoryEntry = {
  id: string;
  level: TrainingStatusEnum;
  result: TrainingResultEnum;
  organizer_name: string;
  year: number;
};

export type EducationHistoryEntry = {
  id: string;
  institution_id: number;
  institution_name: string;
  image_url?: string;
  degree: Degree;
  major: string;
  start_year: number;
  end_year?: number;
};

// Mirrors POST /api/v1/users/detail's response 1:1 — some fields here are PII, opt in per field rather than spreading this whole object into UI.
export type UserProfile = {
  id: string;
  organization_id?: string;
  organization_name?: string;
  coordinating_body_id?: string;
  coordinating_body_name?: string;
  branch_id?: string;
  branch_name?: string;
  full_name: string;
  ktp_full_name?: string;
  email: string;
  phone_number?: string;
  member_card?: string;
  avatar?: string;
  following_count: number;
  followers_count: number;
  feed_count: number;
  headline?: string;
  bio?: string;
  role_id: number;
  role_name?: string;
  status: UserStatusEnum;
  is_verified: boolean;
  date_of_birth?: string;
  gender?: GenderEnum;
  address_street?: string;
  district_id?: number;
  is_trainer: boolean;
  is_subscribe: boolean;
  subscription_started_at?: string;
  subscription_ended_at?: string;
  created_at: string;
  updated_at: string;
};

// Gated by the org client secret (not a user token), so this works for anonymous visitors too.
export const getUserById = cache(
  async (id: string): Promise<UserProfile | null> => {
    const clientSecret = process.env.CLIENT_SECRET;
    if (!clientSecret) return null;

    const result = await callApi<UserProfile>("/api/v1/users/detail", {
      method: "POST",
      token: clientSecret,
      body: { id },
    });

    if (!isSuccessStatus(result.status) || !result.data) return null;
    return result.data;
  }
);

export type UpdateUserPayload = {
  id: string;
  full_name?: string;
  headline?: string;
  bio?: string;
  avatar?: string;
};

export type UpdateUserResult = {
  id: string;
  full_name: string;
  email: string;
  role_id: number;
  role_name?: string;
  status: UserStatusEnum;
  is_verified: boolean;
  is_trainer: boolean;
  is_subscribe: boolean;
  created_at: string;
  updated_at: string;
};

export async function updateUser(
  payload: UpdateUserPayload
): Promise<ApiEnvelope<UpdateUserResult>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return {
      status: "UNAUTHORIZED",
      message: "Session expired. Please log in again.",
    };
  }

  return callApi<UpdateUserResult>("/api/v1/users/update", {
    method: "POST",
    token: sessionToken,
    body: payload,
  });
}

type ListOptions = {
  search?: string;
  page?: number;
  pageSize?: number;
};

type ListResult<T> = {
  list: T[];
  hasMore: boolean;
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

// Gated by the org client secret like getUserById — `id` is whichever profile is being viewed, not the caller.
export async function listEducationHistories(
  id: string,
  options: ListOptions = {}
): Promise<ListResult<EducationHistoryEntry>> {
  const clientSecret = process.env.CLIENT_SECRET;
  if (!clientSecret) return { list: [], hasMore: false };

  const { search, page, pageSize } = options;
  const result = await callApi<ListResponse<EducationHistoryEntry>>(
    "/api/v1/users/education-histories/list",
    {
      method: "POST",
      token: clientSecret,
      body: {
        id,
        ...(search ? { search } : {}),
        ...(page ? { page } : {}),
        ...(pageSize ? { page_size: pageSize } : {}),
      },
    }
  );

  if (!isSuccessStatus(result.status)) {
    console.error("[listEducationHistories] request failed:", result);
    return { list: [], hasMore: false };
  }

  const list = result.data?.list ?? [];
  const metapaging = result.data?.metapaging;
  const hasMore = metapaging ? metapaging.current_page < metapaging.total_page : false;
  return { list, hasMore };
}

export async function listTrainingHistories(
  id: string,
  options: ListOptions = {}
): Promise<ListResult<TrainingHistoryEntry>> {
  const clientSecret = process.env.CLIENT_SECRET;
  if (!clientSecret) return { list: [], hasMore: false };

  const { search, page, pageSize } = options;
  const result = await callApi<ListResponse<TrainingHistoryEntry>>(
    "/api/v1/users/training-histories/list",
    {
      method: "POST",
      token: clientSecret,
      body: {
        id,
        ...(search ? { search } : {}),
        ...(page ? { page } : {}),
        ...(pageSize ? { page_size: pageSize } : {}),
      },
    }
  );

  if (!isSuccessStatus(result.status)) {
    console.error("[listTrainingHistories] request failed:", result);
    return { list: [], hasMore: false };
  }

  const list = result.data?.list ?? [];
  const metapaging = result.data?.metapaging;
  const hasMore = metapaging ? metapaging.current_page < metapaging.total_page : false;
  return { list, hasMore };
}

// create/update/delete below are always scoped to the caller (JWT) — no user id in these bodies, unlike list above.

export type CreateEducationHistoryPayload = {
  institution_id: number;
  degree: Degree;
  major?: string;
  start_year: number;
  end_year?: number;
};

export async function createEducationHistory(
  payload: CreateEducationHistoryPayload
): Promise<ApiEnvelope<EducationHistoryEntry>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return { status: "UNAUTHORIZED", message: "Session expired. Please log in again." };
  }

  return callApi<EducationHistoryEntry>("/api/v1/users/education-histories/create", {
    method: "POST",
    token: sessionToken,
    body: payload,
  });
}

export type UpdateEducationHistoryPayload = {
  id: string;
  institution_id?: number;
  degree?: Degree;
  major?: string;
  start_year?: number;
  end_year?: number;
};

export async function updateEducationHistory(
  payload: UpdateEducationHistoryPayload
): Promise<ApiEnvelope<EducationHistoryEntry>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return { status: "UNAUTHORIZED", message: "Session expired. Please log in again." };
  }

  return callApi<EducationHistoryEntry>("/api/v1/users/education-histories/update", {
    method: "POST",
    token: sessionToken,
    body: payload,
  });
}

export async function deleteEducationHistory(id: string): Promise<ApiEnvelope> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return { status: "UNAUTHORIZED", message: "Session expired. Please log in again." };
  }

  return callApi("/api/v1/users/education-histories/delete", {
    method: "POST",
    token: sessionToken,
    body: { id },
  });
}

export type CreateTrainingHistoryPayload = {
  level: TrainingStatusEnum;
  result: TrainingResultEnum;
  organizer_name: string;
  year: number;
};

export async function createTrainingHistory(
  payload: CreateTrainingHistoryPayload
): Promise<ApiEnvelope<TrainingHistoryEntry>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return { status: "UNAUTHORIZED", message: "Session expired. Please log in again." };
  }

  return callApi<TrainingHistoryEntry>("/api/v1/users/training-histories/create", {
    method: "POST",
    token: sessionToken,
    body: payload,
  });
}

export type UpdateTrainingHistoryPayload = {
  id: string;
  level?: TrainingStatusEnum;
  result?: TrainingResultEnum;
  organizer_name?: string;
  year?: number;
};

export async function updateTrainingHistory(
  payload: UpdateTrainingHistoryPayload
): Promise<ApiEnvelope<TrainingHistoryEntry>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return { status: "UNAUTHORIZED", message: "Session expired. Please log in again." };
  }

  return callApi<TrainingHistoryEntry>("/api/v1/users/training-histories/update", {
    method: "POST",
    token: sessionToken,
    body: payload,
  });
}

export async function deleteTrainingHistory(id: string): Promise<ApiEnvelope> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return { status: "UNAUTHORIZED", message: "Session expired. Please log in again." };
  }

  return callApi("/api/v1/users/training-histories/delete", {
    method: "POST",
    token: sessionToken,
    body: { id },
  });
}
