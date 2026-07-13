import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";
import { callApi, type ApiEnvelope } from "./api";
import type { Feed, FeedComment } from "./feeds";
import {
  isSuccessStatus,
  type ActivityTypeEnum,
  type Degree,
  type GenderEnum,
  type TrainingResultEnum,
  type TrainingStatusEnum,
  type UserStatusEnum,
} from "@/lib/types";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

export type ActivationPayload = {
  username: string;
  full_name?: string;
  avatar?: string;
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
  full_name: string;
  avatar?: string;
  username: string;
  user_email: string;
  status: UserStatusEnum;
};

export type CheckUsernameResult = {
  is_available: boolean;
};

export async function checkUsernameAvailability(
  username: string
): Promise<ApiEnvelope<CheckUsernameResult>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return {
      status: "UNAUTHORIZED",
      message: "Session expired. Please log in again.",
    };
  }

  return callApi<CheckUsernameResult>("/api/v1/users/check-username", {
    method: "POST",
    token: sessionToken,
    body: { username },
  });
}

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
  chapter_id: string;
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
  chapter_id: string;
  ktp_full_name: string;
  district_id: number;
  is_verified: boolean;
  member_card: string;
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

export type OrganizationExperienceEntry = {
  id: string;
  organization_name: string;
  position_title: string;
  start_year: number;
  end_year?: number;
  description?: string;
};

export type SocialMediaAccountEntry = {
  id: string;
  platform_id: number;
  platform_name: string;
  logo_url?: string;
  url: string;
};

// Mirrors POST /api/v1/users/detail's response 1:1 — some fields here are PII, opt in per field rather than spreading this whole object into UI.
export type UserProfile = {
  id: string;
  organization_id?: string;
  organization_name?: string;
  coordinating_body_id?: string;
  coordinating_body_name?: string;
  chapter_id?: string;
  chapter_name?: string;
  branch_id?: string;
  branch_name?: string;
  full_name: string;
  username?: string;
  ktp_full_name?: string;
  email: string;
  phone_number?: string;
  member_card?: string;
  avatar?: string;
  following_count: number;
  followers_count: number;
  feed_count: number;
  is_followed_by_me?: boolean;
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

// Pass a viewer JWT to include viewer-scoped fields, otherwise this falls back to the org client secret.
export const getUserByUsername = cache(
  async (username: string, token?: string): Promise<UserProfile | null> => {
    const authToken = token ?? process.env.CLIENT_SECRET;
    if (!authToken) return null;

    const result = await callApi<UserProfile>("/api/v1/users/detail", {
      method: "POST",
      token: authToken,
      body: { username },
    });

    if (!isSuccessStatus(result.status) || !result.data) return null;
    return result.data;
  }
);

// Mirrors POST /api/v1/users/membership-details's response — the caller's own membership card.
export type MembershipDetail = {
  id: string;
  full_name: string;
  ktp_full_name?: string;
  username?: string;
  member_card?: string;
  chapter_id?: string;
  chapter_name?: string;
  branch_id?: string;
  branch_name?: string;
  coordinating_body_id?: string;
  coordinating_body_name?: string;
  is_subscribe: boolean;
  subscription_started_at?: string;
  subscription_ended_at?: string;
};

export const getMembershipDetail = cache(
  async (token: string): Promise<MembershipDetail | null> => {
    const result = await callApi<MembershipDetail>("/api/v1/users/membership-details", {
      method: "POST",
      token,
    });

    if (!isSuccessStatus(result.status) || !result.data) return null;
    return result.data;
  }
);

export type FollowUserResult = {
  follower_id: string;
  following_id: string;
};

export async function followUser(
  userId: string
): Promise<ApiEnvelope<FollowUserResult>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return {
      status: "UNAUTHORIZED",
      message: "Session expired. Please log in again.",
    };
  }

  return callApi<FollowUserResult>("/api/v1/users/follow", {
    method: "POST",
    token: sessionToken,
    body: { user_id: userId },
  });
}

export async function unfollowUser(
  userId: string
): Promise<ApiEnvelope<FollowUserResult>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return {
      status: "UNAUTHORIZED",
      message: "Session expired. Please log in again.",
    };
  }

  return callApi<FollowUserResult>("/api/v1/users/unfollow", {
    method: "POST",
    token: sessionToken,
    body: { user_id: userId },
  });
}

export type FollowUserEntry = {
  id: string;
  full_name: string;
  username?: string;
  avatar?: string;
};

async function listFollowRelation(
  endpoint: "following" | "followers",
  userId: string,
  options: ListOptions = {}
): Promise<ListResult<FollowUserEntry>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return { list: [], hasMore: false };

  const { search, page, pageSize } = options;
  const result = await callApi<ListResponse<FollowUserEntry>>(
    `/api/v1/users/${endpoint}/list`,
    {
      method: "POST",
      token: sessionToken,
      body: {
        user_id: userId,
        ...(search ? { search } : {}),
        ...(page ? { page } : {}),
        ...(pageSize ? { page_size: pageSize } : {}),
      },
    }
  );

  if (!isSuccessStatus(result.status)) {
    console.error(`[listFollowRelation:${endpoint}] request failed:`, result);
    return { list: [], hasMore: false };
  }

  const list = result.data?.list ?? [];
  const metapaging = result.data?.metapaging;
  const hasMore = metapaging ? metapaging.current_page < metapaging.total_page : false;
  return { list, hasMore };
}

export async function listFollowing(
  userId: string,
  options: ListOptions = {}
): Promise<ListResult<FollowUserEntry>> {
  return listFollowRelation("following", userId, options);
}

export async function listFollowers(
  userId: string,
  options: ListOptions = {}
): Promise<ListResult<FollowUserEntry>> {
  return listFollowRelation("followers", userId, options);
}

// Mirrors POST /api/v1/users/follow-recommendations/list's response — closeness_score: 3 = same chapter, 2 = same branch, 1 = same coordinating body, 0 = unrelated.
export type FollowRecommendationEntry = {
  id: string;
  full_name: string;
  username?: string;
  avatar?: string;
  chapter_id?: string;
  chapter_name?: string;
  branch_id?: string;
  branch_name?: string;
  coordinating_body_id?: string;
  coordinating_body_name?: string;
  closeness_score: number;
};

export async function listFollowRecommendations(
  options: ListOptions = {}
): Promise<ListResult<FollowRecommendationEntry>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return { list: [], hasMore: false };

  const { page, pageSize } = options;
  const result = await callApi<ListResponse<FollowRecommendationEntry>>(
    "/api/v1/users/follow-recommendations/list",
    {
      method: "POST",
      token: sessionToken,
      body: {
        ...(page ? { page } : {}),
        ...(pageSize ? { page_size: pageSize } : {}),
      },
    }
  );

  if (!isSuccessStatus(result.status)) {
    console.error("[listFollowRecommendations] request failed:", result);
    return { list: [], hasMore: false };
  }

  const list = result.data?.list ?? [];
  const metapaging = result.data?.metapaging;
  const hasMore = metapaging ? metapaging.current_page < metapaging.total_page : false;
  return { list, hasMore };
}

export type UpdateUserPayload = {
  id: string;
  username?: string;
  full_name?: string;
  headline?: string;
  bio?: string;
  avatar?: string;
};

export type UpdateUserResult = {
  id: string;
  username?: string;
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

// Gated by the org client secret like getUserByUsername — `username` is whichever profile is being viewed, not the caller.
export async function listEducationHistories(
  username: string,
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
        username,
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
  username: string,
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
        username,
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

export async function listOrganizationExperiences(
  username: string,
  options: ListOptions = {}
): Promise<ListResult<OrganizationExperienceEntry>> {
  const clientSecret = process.env.CLIENT_SECRET;
  if (!clientSecret) return { list: [], hasMore: false };

  const { search, page, pageSize } = options;
  const result = await callApi<ListResponse<OrganizationExperienceEntry>>(
    "/api/v1/users/organization-experiences/list",
    {
      method: "POST",
      token: clientSecret,
      body: {
        username,
        ...(search ? { search } : {}),
        ...(page ? { page } : {}),
        ...(pageSize ? { page_size: pageSize } : {}),
      },
    }
  );

  if (!isSuccessStatus(result.status)) {
    console.error("[listOrganizationExperiences] request failed:", result);
    return { list: [], hasMore: false };
  }

  const list = result.data?.list ?? [];
  const metapaging = result.data?.metapaging;
  const hasMore = metapaging ? metapaging.current_page < metapaging.total_page : false;
  return { list, hasMore };
}

export async function listSocialMediaAccounts(
  id: string,
  options: ListOptions = {}
): Promise<ListResult<SocialMediaAccountEntry>> {
  const clientSecret = process.env.CLIENT_SECRET;
  if (!clientSecret) return { list: [], hasMore: false };

  const { search, page, pageSize } = options;
  const result = await callApi<ListResponse<SocialMediaAccountEntry>>(
    "/api/v1/users/social-media-accounts/list",
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
    console.error("[listSocialMediaAccounts] request failed:", result);
    return { list: [], hasMore: false };
  }

  const list = result.data?.list ?? [];
  const metapaging = result.data?.metapaging;
  const hasMore = metapaging ? metapaging.current_page < metapaging.total_page : false;
  return { list, hasMore };
}

// Mirrors POST /api/v1/users/activity/list's response — one entry of a user's merged post/repost/comment activity.
export type ActivityEntry = {
  type: ActivityTypeEnum;
  created_at: string;
  feed: Feed;
  comment: FeedComment | null;
};

// Gated by the org client secret like getUserByUsername, but reads the viewer's own session
// cookie too so nested feed/comment carry viewer-scoped fields (my_reaction) when logged in.
export async function listUserActivity(
  username: string,
  options: ListOptions = {}
): Promise<ListResult<ActivityEntry>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const authToken = sessionToken ?? process.env.CLIENT_SECRET;
  if (!authToken) return { list: [], hasMore: false };

  const { page, pageSize } = options;
  const result = await callApi<ListResponse<ActivityEntry>>("/api/v1/users/activity/list", {
    method: "POST",
    token: authToken,
    body: {
      username,
      ...(page ? { page } : {}),
      ...(pageSize ? { page_size: pageSize } : {}),
    },
  });

  if (!isSuccessStatus(result.status)) {
    console.error("[listUserActivity] request failed:", result);
    return { list: [], hasMore: false };
  }

  const list = result.data?.list ?? [];
  const metapaging = result.data?.metapaging;
  const hasMore = metapaging ? metapaging.current_page < metapaging.total_page : false;
  return { list, hasMore };
}

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

export type CreateOrganizationExperiencePayload = {
  organization_name: string;
  position_title: string;
  start_year: number;
  end_year?: number;
  description?: string;
};

export async function createOrganizationExperience(
  payload: CreateOrganizationExperiencePayload
): Promise<ApiEnvelope<OrganizationExperienceEntry>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return { status: "UNAUTHORIZED", message: "Session expired. Please log in again." };
  }

  return callApi<OrganizationExperienceEntry>(
    "/api/v1/users/organization-experiences/create",
    {
      method: "POST",
      token: sessionToken,
      body: payload,
    }
  );
}

export type UpdateOrganizationExperiencePayload = {
  id: string;
  organization_name?: string;
  position_title?: string;
  start_year?: number;
  end_year?: number;
  description?: string;
};

export async function updateOrganizationExperience(
  payload: UpdateOrganizationExperiencePayload
): Promise<ApiEnvelope<OrganizationExperienceEntry>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return { status: "UNAUTHORIZED", message: "Session expired. Please log in again." };
  }

  return callApi<OrganizationExperienceEntry>(
    "/api/v1/users/organization-experiences/update",
    {
      method: "POST",
      token: sessionToken,
      body: payload,
    }
  );
}

export async function deleteOrganizationExperience(id: string): Promise<ApiEnvelope> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return { status: "UNAUTHORIZED", message: "Session expired. Please log in again." };
  }

  return callApi("/api/v1/users/organization-experiences/delete", {
    method: "POST",
    token: sessionToken,
    body: { id },
  });
}

export type CreateSocialMediaAccountPayload = {
  platform_id: number;
  url: string;
};

export async function createSocialMediaAccount(
  payload: CreateSocialMediaAccountPayload
): Promise<ApiEnvelope<SocialMediaAccountEntry>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return { status: "UNAUTHORIZED", message: "Session expired. Please log in again." };
  }

  return callApi<SocialMediaAccountEntry>(
    "/api/v1/users/social-media-accounts/create",
    {
      method: "POST",
      token: sessionToken,
      body: payload,
    }
  );
}

export type UpdateSocialMediaAccountPayload = {
  id: string;
  platform_id?: number;
  url?: string;
};

export async function updateSocialMediaAccount(
  payload: UpdateSocialMediaAccountPayload
): Promise<ApiEnvelope<SocialMediaAccountEntry>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return { status: "UNAUTHORIZED", message: "Session expired. Please log in again." };
  }

  return callApi<SocialMediaAccountEntry>(
    "/api/v1/users/social-media-accounts/update",
    {
      method: "POST",
      token: sessionToken,
      body: payload,
    }
  );
}

export async function deleteSocialMediaAccount(id: string): Promise<ApiEnvelope> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return { status: "UNAUTHORIZED", message: "Session expired. Please log in again." };
  }

  return callApi("/api/v1/users/social-media-accounts/delete", {
    method: "POST",
    token: sessionToken,
    body: { id },
  });
}
