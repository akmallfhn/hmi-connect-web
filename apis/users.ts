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

// Mirrors POST /api/v1/users/detail's response 1:1. Some fields here (email, phone_number,
// address_street, date_of_birth, ktp_full_name, member_card, subdistrict_id) are PII — this
// route is public/unauthenticated, so callers must opt in deliberately per field rather than
// spreading this whole object into anything user-facing.
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
  headline?: string;
  bio?: string;
  role_id: number;
  role_name?: string;
  status: UserStatusEnum;
  is_verified: boolean;
  date_of_birth?: string;
  gender?: GenderEnum;
  address_street?: string;
  subdistrict_id?: number;
  is_trainer: boolean;
  is_subscribe: boolean;
  subscription_started_at?: string;
  subscription_ended_at?: string;
  training_histories: TrainingHistoryEntry[];
  education_histories: EducationHistoryEntry[];
  created_at: string;
  updated_at: string;
};

// /users/detail is gated by the org client secret (not a user token), so this is safe to
// call for anonymous visitors too — needed for public, SEO-crawlable profile pages.
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

export type UpdateEducationHistoryInput = {
  id: string;
  degree?: Degree;
  major?: string;
  start_year?: number;
  end_year?: number;
};

export type UpdateTrainingHistoryInput = {
  id: string;
  level?: TrainingStatusEnum;
  result?: TrainingResultEnum;
  organizer_name?: string;
  year?: number;
};

// /users/update supports far more fields than these (see the API docs) — this only types the
// subset our three partial edit forms (header/education/training) actually send.
export type UpdateUserPayload = {
  id: string;
  full_name?: string;
  headline?: string;
  bio?: string;
  avatar?: string;
  education_histories?: UpdateEducationHistoryInput[];
  training_histories?: UpdateTrainingHistoryInput[];
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
