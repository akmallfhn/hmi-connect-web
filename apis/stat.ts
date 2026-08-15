import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
import {
  isSuccessStatus,
  type BranchTypeEnum,
  type StatusEnum,
} from "@/lib/types";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

export type OrganizationSummary = {
  verified_member_count: number;
  coordinating_body_count: number;
  branch_count: number;
  chapter_count: number;
};

export type CoordinatingBodySummary = {
  verified_member_count: number;
  branch_count: number;
  coordinating_chapter_count: number;
  chapter_count: number;
};

export type BranchSummary = {
  verified_member_count: number;
  chapter_count: number;
  pending_verification_request_count: number;
  verified_member_percentage: number;
};

export type CoordinatingChapterSummary = {
  verified_member_count: number;
  chapter_count: number;
};

export type ChapterSummary = {
  verified_member_count: number;
  member_growth_percentage_last_month: number;
  new_member_count_last_month: number;
};

export type BranchDistributionEntry = {
  branch_id: string;
  branch_name: string;
  total: number;
};

export type BranchDistribution = {
  list: BranchDistributionEntry[];
  total_active_kader: number;
};

export type GetBranchDistributionOptions = {
  coordinatingBodyId?: string;
};

export type ChapterDistributionEntry = {
  chapter_id: string;
  chapter_name: string;
  total: number;
};

export type ChapterDistribution = {
  list: ChapterDistributionEntry[];
  total_active_kader: number;
};

export type GetChapterDistributionOptions = {
  branchId?: string;
  coordinatingChapterId?: string;
};

export type UserGrowthGranularity = "day" | "week" | "month";

export type UserGrowthEntry = {
  period: string;
  total: number;
};

export type UserGrowth = {
  granularity: UserGrowthGranularity;
  list: UserGrowthEntry[];
};

type UserGrowthScope =
  | {
      coordinatingBodyId: string;
      branchId?: never;
      coordinatingChapterId?: never;
      chapterId?: never;
    }
  | {
      coordinatingBodyId?: never;
      branchId: string;
      coordinatingChapterId?: never;
      chapterId?: never;
    }
  | {
      coordinatingBodyId?: never;
      branchId?: never;
      coordinatingChapterId: string;
      chapterId?: never;
    }
  | {
      coordinatingBodyId?: never;
      branchId?: never;
      coordinatingChapterId?: never;
      chapterId: string;
    }
  | {
      coordinatingBodyId?: never;
      branchId?: never;
      coordinatingChapterId?: never;
      chapterId?: never;
    };

export type GetUserGrowthOptions = {
  granularity?: UserGrowthGranularity;
} & UserGrowthScope;

export type MembershipStatus = {
  total_verified: number;
  total_unverified: number;
};

export type BranchStatus = {
  total_full: number;
  total_provisional: number;
};

export type GetBranchStatusOptions = {
  coordinatingBodyId?: string;
};

export type ChapterStatus = {
  total_full: number;
  total_provisional: number;
};

type ChapterStatusScope =
  | {
      coordinatingBodyId: string;
      branchId?: never;
      coordinatingChapterId?: never;
    }
  | {
      coordinatingBodyId?: never;
      branchId: string;
      coordinatingChapterId?: never;
    }
  | {
      coordinatingBodyId?: never;
      branchId?: never;
      coordinatingChapterId: string;
    }
  | {
      coordinatingBodyId?: never;
      branchId?: never;
      coordinatingChapterId?: never;
    };

export type GetChapterStatusOptions = ChapterStatusScope;

export type CoordinatingBodyStatus = {
  total_active: number;
  total_inactive: number;
};

export type BranchMapCoverage = "nationwide" | "international";

export type BranchMapEntry = {
  id: string;
  name: string;
  type: BranchTypeEnum;
  status: StatusEnum;
  latitude: number | null;
  longitude: number | null;
  coordinating_body_id: string;
  coordinating_body_name: string;
  verified_member_count: number;
  chapter_count: number;
};

export type BranchMap = {
  list: BranchMapEntry[];
};

export type GetBranchMapOptions = {
  coverage?: BranchMapCoverage;
  coordinatingBodyId?: string;
  search?: string;
};

async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

async function getEntitySummary<T>(
  endpoint: string,
  body: Record<string, string>
): Promise<T | null> {
  const token = await getSessionToken();
  const result = await callApi<T>(endpoint, { token, body });
  return isSuccessStatus(result.status) ? (result.data ?? null) : null;
}

export async function getOrganizationSummary(
  organizationId: string
): Promise<OrganizationSummary | null> {
  return getEntitySummary<OrganizationSummary>(
    "/api/v1/stat/summary/organization",
    { organization_id: organizationId }
  );
}

export async function getCoordinatingBodySummary(
  coordinatingBodyId: string
): Promise<CoordinatingBodySummary | null> {
  return getEntitySummary<CoordinatingBodySummary>(
    "/api/v1/stat/summary/coordinating-body",
    { coordinating_body_id: coordinatingBodyId }
  );
}

export async function getBranchSummary(
  branchId: string
): Promise<BranchSummary | null> {
  return getEntitySummary<BranchSummary>("/api/v1/stat/summary/branch", {
    branch_id: branchId,
  });
}

export async function getCoordinatingChapterSummary(
  coordinatingChapterId: string
): Promise<CoordinatingChapterSummary | null> {
  return getEntitySummary<CoordinatingChapterSummary>(
    "/api/v1/stat/summary/coordinating-chapter",
    { coordinating_chapter_id: coordinatingChapterId }
  );
}

export async function getChapterSummary(
  chapterId: string
): Promise<ChapterSummary | null> {
  return getEntitySummary<ChapterSummary>("/api/v1/stat/summary/chapter", {
    chapter_id: chapterId,
  });
}

export async function getBranchDistribution(
  options: GetBranchDistributionOptions = {}
): Promise<BranchDistribution | null> {
  const token = await getSessionToken();
  const { coordinatingBodyId } = options;
  const result = await callApi<BranchDistribution>(
    "/api/v1/stat/branch-distribution",
    {
      token,
      body: coordinatingBodyId
        ? { coordinating_body_id: coordinatingBodyId }
        : {},
    }
  );
  return isSuccessStatus(result.status) ? (result.data ?? null) : null;
}

export async function getChapterDistribution(
  options: GetChapterDistributionOptions = {}
): Promise<ChapterDistribution | null> {
  const token = await getSessionToken();
  const { branchId, coordinatingChapterId } = options;
  const result = await callApi<ChapterDistribution>(
    "/api/v1/stat/chapter-distribution",
    {
      token,
      body: {
        ...(branchId ? { branch_id: branchId } : {}),
        ...(coordinatingChapterId
          ? { coordinating_chapter_id: coordinatingChapterId }
          : {}),
      },
    }
  );
  return isSuccessStatus(result.status) ? (result.data ?? null) : null;
}

export async function getUserGrowth(
  options: GetUserGrowthOptions = {}
): Promise<UserGrowth | null> {
  const token = await getSessionToken();
  const {
    granularity = "month",
    coordinatingBodyId,
    branchId,
    coordinatingChapterId,
    chapterId,
  } = options;
  const result = await callApi<UserGrowth>("/api/v1/stat/user-growth", {
    token,
    body: {
      granularity,
      ...(coordinatingBodyId
        ? { coordinating_body_id: coordinatingBodyId }
        : {}),
      ...(branchId ? { branch_id: branchId } : {}),
      ...(coordinatingChapterId
        ? { coordinating_chapter_id: coordinatingChapterId }
        : {}),
      ...(chapterId ? { chapter_id: chapterId } : {}),
    },
  });
  return isSuccessStatus(result.status) ? (result.data ?? null) : null;
}

export async function getMembershipStatus(
  branchId?: string
): Promise<MembershipStatus | null> {
  const token = await getSessionToken();
  const result = await callApi<MembershipStatus>(
    "/api/v1/stat/membership-status",
    {
      token,
      body: branchId ? { branch_id: branchId } : {},
    }
  );
  return isSuccessStatus(result.status) ? (result.data ?? null) : null;
}

export async function getBranchStatus(
  options: GetBranchStatusOptions = {}
): Promise<BranchStatus | null> {
  const token = await getSessionToken();
  const { coordinatingBodyId } = options;
  const result = await callApi<BranchStatus>("/api/v1/stat/branch-status", {
    token,
    body: coordinatingBodyId
      ? { coordinating_body_id: coordinatingBodyId }
      : {},
  });
  return isSuccessStatus(result.status) ? (result.data ?? null) : null;
}

export async function getChapterStatus(
  options: GetChapterStatusOptions = {}
): Promise<ChapterStatus | null> {
  const token = await getSessionToken();
  const { coordinatingBodyId, branchId, coordinatingChapterId } = options;
  const result = await callApi<ChapterStatus>("/api/v1/stat/chapter-status", {
    token,
    body: {
      ...(coordinatingBodyId
        ? { coordinating_body_id: coordinatingBodyId }
        : {}),
      ...(branchId ? { branch_id: branchId } : {}),
      ...(coordinatingChapterId
        ? { coordinating_chapter_id: coordinatingChapterId }
        : {}),
    },
  });
  return isSuccessStatus(result.status) ? (result.data ?? null) : null;
}

export async function getCoordinatingBodyStatus(): Promise<CoordinatingBodyStatus | null> {
  const token = await getSessionToken();
  const result = await callApi<CoordinatingBodyStatus>(
    "/api/v1/stat/coordinating-body-status",
    { token, body: {} }
  );
  return isSuccessStatus(result.status) ? (result.data ?? null) : null;
}

export async function getBranchMap(
  options: GetBranchMapOptions = {}
): Promise<BranchMap | null> {
  const token = await getSessionToken();
  const { coverage = "nationwide", coordinatingBodyId, search } = options;
  const normalizedSearch = search?.trim();
  const result = await callApi<BranchMap>("/api/v1/stat/branch-map", {
    token,
    body: {
      coverage,
      ...(coordinatingBodyId
        ? { coordinating_body_id: coordinatingBodyId }
        : {}),
      ...(normalizedSearch ? { search: normalizedSearch } : {}),
    },
  });
  return isSuccessStatus(result.status) ? (result.data ?? null) : null;
}
