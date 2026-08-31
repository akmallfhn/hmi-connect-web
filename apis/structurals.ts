import "server-only";

import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import {
  isSuccessStatus,
  type StatusEnum,
  type StructuralEntityTypeEnum,
} from "@/lib/types";
import { callApi, type ApiEnvelope } from "./api";
import type { PagedListResult } from "./users";

// Mirrors POST /api/v1/structurals/list's row shape — a period summary, no officers.
export type StructuralPeriodSummary = {
  id: number;
  entity_type: StructuralEntityTypeEnum;
  entity_id: string;
  start_year: number;
  end_year: number | null;
  officer_count: number;
  created_at: string;
  updated_at: string;
};

export type StructuralOfficer = {
  id: string;
  structural_period_id: number;
  user_id: string;
  user_full_name: string;
  user_username: string;
  user_avatar?: string;
  position_id: number;
  position_name: string;
  status: StatusEnum;
  created_at: string;
  updated_at: string;
};

// Mirrors POST /api/v1/structurals/create and /detail's response — a period with its full officer list.
export type StructuralPeriodDetail = {
  id: number;
  entity_type: StructuralEntityTypeEnum;
  entity_id: string;
  start_year: number;
  end_year: number | null;
  created_at: string;
  updated_at: string;
  officers: StructuralOfficer[];
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

export type ListStructuralPeriodsOptions = {
  entityType: StructuralEntityTypeEnum;
  entityId: string;
  page?: number;
  pageSize?: number;
};

// Any authenticated user can list/view periods — no entity-scope restriction on the backend.
export async function listStructuralPeriods(
  options: ListStructuralPeriodsOptions
): Promise<PagedListResult<StructuralPeriodSummary>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return { list: [], totalData: 0, totalPage: 1, currentPage: 1 };
  }

  const { entityType, entityId, page, pageSize } = options;
  const result = await callApi<ListResponse<StructuralPeriodSummary>>(
    "/api/v1/structurals/list",
    {
      method: "POST",
      token: sessionToken,
      body: {
        entity_type: entityType,
        entity_id: entityId,
        page: page ?? 1,
        page_size: pageSize ?? 20,
      },
    }
  );

  if (!isSuccessStatus(result.status)) {
    console.error("[listStructuralPeriods] request failed:", result);
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

export async function getStructuralPeriodDetail(
  id: number
): Promise<StructuralPeriodDetail | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return null;

  const result = await callApi<StructuralPeriodDetail>(
    "/api/v1/structurals/detail",
    { method: "POST", token: sessionToken, body: { id } }
  );

  if (!isSuccessStatus(result.status) || !result.data) return null;
  return result.data;
}

export type StructuralOverview = {
  periods: StructuralPeriodSummary[];
  selectedPeriodId: number | null;
  selectedPeriod: StructuralPeriodDetail | null;
};

// Resolves the "selected" period (valid ?period=, else the still-ongoing one, else the newest) and fetches its detail — shared by every scoped .../structural route.
export async function getStructuralOverview(
  entityType: StructuralEntityTypeEnum,
  entityId: string,
  requestedPeriodId: number | null
): Promise<StructuralOverview> {
  const { list } = await listStructuralPeriods({
    entityType,
    entityId,
    pageSize: 50,
  });

  const requestedIsValid =
    requestedPeriodId !== null &&
    list.some((item) => item.id === requestedPeriodId);
  const defaultPeriodId =
    list.find((item) => item.end_year === null)?.id ?? list[0]?.id ?? null;
  const selectedPeriodId = requestedIsValid
    ? requestedPeriodId
    : defaultPeriodId;
  const selectedPeriod = selectedPeriodId
    ? await getStructuralPeriodDetail(selectedPeriodId)
    : null;

  return { periods: list, selectedPeriodId, selectedPeriod };
}

export type CreateStructuralPeriodPayload = {
  entity_type: StructuralEntityTypeEnum;
  entity_id: string;
  start_year: number;
  end_year?: number;
  officers: { user_id: string; position_id: number }[];
};

// Requires Super Admin, or Administrator with the can_manage_* permission matching entity_type.
export async function createStructuralPeriod(
  payload: CreateStructuralPeriodPayload
): Promise<ApiEnvelope<StructuralPeriodDetail>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return {
      status: "UNAUTHORIZED",
      message: "Session expired. Please log in again.",
    };
  }

  return callApi<StructuralPeriodDetail>("/api/v1/structurals/create", {
    method: "POST",
    token: sessionToken,
    body: payload,
  });
}

export type UpdateStructuralPeriodPayload = {
  id: number;
  start_year: number;
  // Omit or send null to mark the period still ongoing; entity_type/entity_id/officers are immutable here.
  end_year?: number | null;
};

// Requires Super Admin, or Administrator with the can_manage_* permission matching the period's entity.
export async function updateStructuralPeriod(
  payload: UpdateStructuralPeriodPayload
): Promise<ApiEnvelope<StructuralPeriodDetail>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return {
      status: "UNAUTHORIZED",
      message: "Session expired. Please log in again.",
    };
  }

  return callApi<StructuralPeriodDetail>("/api/v1/structurals/update", {
    method: "POST",
    token: sessionToken,
    body: payload,
  });
}

export type CreateStructuralOfficerPayload = {
  structural_period_id: number;
  user_id: string;
  position_id: number;
};

// Requires Super Admin, or Administrator with the can_manage_* permission matching the period's entity.
export async function createStructuralOfficer(
  payload: CreateStructuralOfficerPayload
): Promise<ApiEnvelope<StructuralOfficer>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return {
      status: "UNAUTHORIZED",
      message: "Session expired. Please log in again.",
    };
  }

  return callApi<StructuralOfficer>("/api/v1/structurals/officers/create", {
    method: "POST",
    token: sessionToken,
    body: payload,
  });
}

export type UpdateStructuralOfficerPayload = {
  id: string;
  // Both mutable fields are optional — an omitted one leaves that part of the officer unchanged.
  position_id?: number;
  status?: StatusEnum;
};

export async function updateStructuralOfficer(
  payload: UpdateStructuralOfficerPayload
): Promise<ApiEnvelope<StructuralOfficer>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return {
      status: "UNAUTHORIZED",
      message: "Session expired. Please log in again.",
    };
  }

  return callApi<StructuralOfficer>("/api/v1/structurals/officers/update", {
    method: "POST",
    token: sessionToken,
    body: payload,
  });
}

// Hard delete — structural_officers has no deleted_at, matching the backend.
export async function deleteStructuralOfficer(
  id: string
): Promise<ApiEnvelope<null>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return {
      status: "UNAUTHORIZED",
      message: "Session expired. Please log in again.",
    };
  }

  return callApi<null>("/api/v1/structurals/officers/delete", {
    method: "POST",
    token: sessionToken,
    body: { id },
  });
}

// Mirrors POST /api/v1/structural-positions/list's row shape.
export type StructuralPosition = {
  id: number;
  name: string;
};

type StructuralPositionsListResponse = {
  list: StructuralPosition[];
  metapaging?: {
    total_data: number;
    total_page: number;
    current_page: number;
    page_size: number;
  };
};

export type SearchStructuralPositionsOptions = {
  search?: string;
  page?: number;
  pageSize?: number;
};

export type SearchStructuralPositionsResult = {
  list: StructuralPosition[];
  hasMore: boolean;
};

// Any authenticated user can browse — no admin gate on the backend, same as institutions/social-media-platforms.
export async function searchStructuralPositions(
  options: SearchStructuralPositionsOptions = {}
): Promise<SearchStructuralPositionsResult> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return { list: [], hasMore: false };

  const { search, page, pageSize } = options;
  const result = await callApi<StructuralPositionsListResponse>(
    "/api/v1/structural-positions/list",
    {
      method: "POST",
      token: sessionToken,
      body: {
        ...(search ? { search } : {}),
        page: page ?? 1,
        page_size: pageSize ?? 20,
      },
    }
  );

  if (!isSuccessStatus(result.status)) {
    console.error("[searchStructuralPositions] request failed:", result);
    return { list: [], hasMore: false };
  }

  const list = result.data?.list ?? [];
  const metapaging = result.data?.metapaging;
  const hasMore = metapaging
    ? metapaging.current_page < metapaging.total_page
    : false;
  return { list, hasMore };
}
