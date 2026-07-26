import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
import { isSuccessStatus } from "@/lib/types";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

export type StatSummary = {
  total_active_kader: number;
  total_branch: number;
  total_chapter: number;
  total_coordinating_body: number;
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

export type CoordinatingBodyStatus = {
  total_active: number;
  total_inactive: number;
};

async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

export async function getStatSummary(): Promise<StatSummary | null> {
  const token = await getSessionToken();
  const result = await callApi<StatSummary>("/api/v1/stat/summary", { token });
  return isSuccessStatus(result.status) ? (result.data ?? null) : null;
}

export async function getBranchDistribution(): Promise<BranchDistribution | null> {
  const token = await getSessionToken();
  const result = await callApi<BranchDistribution>(
    "/api/v1/stat/branch-distribution",
    { token }
  );
  return isSuccessStatus(result.status) ? (result.data ?? null) : null;
}

export async function getUserGrowth(
  granularity: UserGrowthGranularity = "month"
): Promise<UserGrowth | null> {
  const token = await getSessionToken();
  const result = await callApi<UserGrowth>("/api/v1/stat/user-growth", {
    token,
    body: { granularity },
  });
  return isSuccessStatus(result.status) ? (result.data ?? null) : null;
}

export async function getMembershipStatus(): Promise<MembershipStatus | null> {
  const token = await getSessionToken();
  const result = await callApi<MembershipStatus>(
    "/api/v1/stat/membership-status",
    { token }
  );
  return isSuccessStatus(result.status) ? (result.data ?? null) : null;
}

export async function getBranchStatus(): Promise<BranchStatus | null> {
  const token = await getSessionToken();
  const result = await callApi<BranchStatus>("/api/v1/stat/branch-status", {
    token,
  });
  return isSuccessStatus(result.status) ? (result.data ?? null) : null;
}

export async function getCoordinatingBodyStatus(): Promise<CoordinatingBodyStatus | null> {
  const token = await getSessionToken();
  const result = await callApi<CoordinatingBodyStatus>(
    "/api/v1/stat/coordinating-body-status",
    { token }
  );
  return isSuccessStatus(result.status) ? (result.data ?? null) : null;
}
