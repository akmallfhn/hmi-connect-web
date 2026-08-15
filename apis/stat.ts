import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
import {
  isSuccessStatus,
  type BranchTypeEnum,
  type StatusEnum,
} from "@/lib/types";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

export type StatSummary = {
  total_active_kader: number;
  total_chapter: number;
  total_branch?: number;
  total_coordinating_body?: number;
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

export type ChapterDistributionEntry = {
  chapter_id: string;
  chapter_name: string;
  total: number;
};

export type ChapterDistribution = {
  list: ChapterDistributionEntry[];
  total_active_kader: number;
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

export type MembershipStatus = {
  total_verified: number;
  total_unverified: number;
};

export type BranchStatus = {
  total_full: number;
  total_provisional: number;
};

export type ChapterStatus = {
  total_full: number;
  total_provisional: number;
};

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

export async function getStatSummary(
  branchId?: string
): Promise<StatSummary | null> {
  const token = await getSessionToken();
  const result = await callApi<StatSummary>("/api/v1/stat/summary", {
    token,
    body: branchId ? { branch_id: branchId } : {},
  });
  return isSuccessStatus(result.status) ? (result.data ?? null) : null;
}

export async function getBranchDistribution(): Promise<BranchDistribution | null> {
  const token = await getSessionToken();
  const result = await callApi<BranchDistribution>(
    "/api/v1/stat/branch-distribution",
    { token, body: {} }
  );
  return isSuccessStatus(result.status) ? (result.data ?? null) : null;
}

export async function getChapterDistribution(
  branchId?: string
): Promise<ChapterDistribution | null> {
  const token = await getSessionToken();
  const result = await callApi<ChapterDistribution>(
    "/api/v1/stat/chapter-distribution",
    {
      token,
      body: branchId ? { branch_id: branchId } : {},
    }
  );
  return isSuccessStatus(result.status) ? (result.data ?? null) : null;
}

export async function getUserGrowth(
  granularity: UserGrowthGranularity = "month",
  branchId?: string
): Promise<UserGrowth | null> {
  const token = await getSessionToken();
  const result = await callApi<UserGrowth>("/api/v1/stat/user-growth", {
    token,
    body: {
      granularity,
      ...(branchId ? { branch_id: branchId } : {}),
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

export async function getBranchStatus(): Promise<BranchStatus | null> {
  const token = await getSessionToken();
  const result = await callApi<BranchStatus>("/api/v1/stat/branch-status", {
    token,
    body: {},
  });
  return isSuccessStatus(result.status) ? (result.data ?? null) : null;
}

export async function getChapterStatus(
  branchId?: string
): Promise<ChapterStatus | null> {
  const token = await getSessionToken();
  const result = await callApi<ChapterStatus>("/api/v1/stat/chapter-status", {
    token,
    body: branchId ? { branch_id: branchId } : {},
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
