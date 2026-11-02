import "server-only";

import { cookies } from "next/headers";
import { callApi, type ApiEnvelope } from "./api";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import {
  isSuccessStatus,
  type AccessEntityTypeEnum,
  type MentionEntityTypeEnum,
  type VerificationStatusEnum,
} from "@/lib/types";

async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

export type EntityFollowStatus = {
  isFollowing: boolean;
  followerCount: number;
};

// Whether the caller follows the entity, plus its follower count; null when it can't be read.
export async function getEntityFollowStatus(
  entityType: MentionEntityTypeEnum,
  entityId: string
): Promise<EntityFollowStatus | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

  const result = await callApi<{ is_following: boolean; follower_count: number }>(
    "/api/v1/entity-follows/status",
    {
      method: "POST",
      token: sessionToken,
      body: { entity_type: entityType, entity_id: entityId },
    }
  );
  if (!isSuccessStatus(result.status) || !result.data) return null;
  return {
    isFollowing: result.data.is_following,
    followerCount: result.data.follower_count,
  };
}

async function writeEntityFollow(
  path: string,
  entityType: MentionEntityTypeEnum,
  entityId: string
): Promise<ApiEnvelope<unknown>> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return { status: "UNAUTHORIZED", message: "Sesi kamu sudah berakhir." };
  }
  return callApi(path, {
    method: "POST",
    token: sessionToken,
    body: { entity_type: entityType, entity_id: entityId },
  });
}

export async function followEntity(entityType: MentionEntityTypeEnum, entityId: string) {
  return writeEntityFollow("/api/v1/entity-follows/follow", entityType, entityId);
}

export async function unfollowEntity(entityType: MentionEntityTypeEnum, entityId: string) {
  return writeEntityFollow("/api/v1/entity-follows/unfollow", entityType, entityId);
}

// One active kader registered under the entity.
export type EntityMember = {
  id: string;
  full_name: string;
  username: string;
  avatar?: string;
  headline?: string;
  verification_status: VerificationStatusEnum;
  is_alumni: boolean;
  branch_name?: string;
  chapter_name?: string;
  is_followed_by_me: boolean;
};

// A multiple of both grid widths (two and three columns), so every page fills whole rows.
export const ENTITY_MEMBERS_PAGE_SIZE = 18;

export type EntityMembersResult = {
  list: EntityMember[];
  totalData: number;
  hasMore: boolean;
};

// The same members/list endpoint is registered under all five entity resources, keyed by that level's own id.
const ENTITY_MEMBERS_PATH: Record<AccessEntityTypeEnum, string> = {
  organization: "/api/v1/organizations/members/list",
  coordinating_body: "/api/v1/coordinating-bodies/members/list",
  branch: "/api/v1/branches/members/list",
  coordinating_chapter: "/api/v1/coordinating-chapters/members/list",
  chapter: "/api/v1/chapters/members/list",
};

export async function listEntityMembers(
  entityType: AccessEntityTypeEnum,
  entityId: string,
  options: { page?: number; pageSize?: number; search?: string } = {}
): Promise<EntityMembersResult> {
  const empty = { list: [], totalData: 0, hasMore: false };
  const sessionToken = await getSessionToken();
  if (!sessionToken) return empty;

  const result = await callApi<{
    list: EntityMember[];
    metapaging?: { total_data: number; total_page: number; current_page: number };
  }>(ENTITY_MEMBERS_PATH[entityType], {
    method: "POST",
    token: sessionToken,
    body: {
      id: entityId,
      page: options.page ?? 1,
      page_size: options.pageSize ?? ENTITY_MEMBERS_PAGE_SIZE,
      ...(options.search ? { search: options.search } : {}),
    },
  });
  if (!isSuccessStatus(result.status) || !result.data) return empty;

  const metapaging = result.data.metapaging;
  return {
    list: result.data.list ?? [],
    totalData: metapaging?.total_data ?? 0,
    hasMore: metapaging ? metapaging.current_page < metapaging.total_page : false,
  };
}
