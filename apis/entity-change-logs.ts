import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
import type { PagedListResult } from "./access-grants";
import {
  isSuccessStatus,
  type AccessEntityTypeEnum,
  type EntityChangeLogEventEnum,
} from "@/lib/types";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

// Mirrors one row of POST /api/v1/entity-change-logs/list — old/new values arrive as text, null when unset.
export type EntityChangeLogEntry = {
  id: number;
  entity_type: AccessEntityTypeEnum;
  entity_id: string;
  event_type: EntityChangeLogEventEnum;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  actor_id: string;
  actor_full_name: string;
  actor_username: string;
  actor_avatar: string | null;
  subject_user_id: string | null;
  subject_user_full_name: string | null;
  subject_user_username: string | null;
  access_grant_id: string | null;
  occurred_at: string;
  is_backfilled: boolean;
};

type EntityChangeLogListResponse = {
  list: EntityChangeLogEntry[];
  metapaging?: {
    total_data: number;
    total_page: number;
    current_page: number;
    page_size: number;
  };
};

export type ListEntityChangeLogsOptions = {
  entityType: AccessEntityTypeEnum;
  entityId: string;
  search?: string;
  page?: number;
  pageSize?: number;
};

const EMPTY_PAGE: PagedListResult<EntityChangeLogEntry> = {
  list: [],
  totalData: 0,
  totalPage: 1,
  currentPage: 1,
};

// One entity's history, newest first. Super Admin, or a manage grant on the entity or anywhere above it.
export async function listEntityChangeLogs(
  options: ListEntityChangeLogsOptions
): Promise<PagedListResult<EntityChangeLogEntry> | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const { entityType, entityId, search, page = 1, pageSize = 20 } = options;
  const result = await callApi<EntityChangeLogListResponse>(
    "/api/v1/entity-change-logs/list",
    {
      method: "POST",
      token,
      body: {
        entity_type: entityType,
        entity_id: entityId,
        ...(search ? { search } : {}),
        page,
        page_size: pageSize,
      },
    }
  );

  if (!isSuccessStatus(result.status)) return null;
  if (!result.data) return EMPTY_PAGE;
  const meta = result.data.metapaging;
  return {
    list: result.data.list ?? [],
    totalData: meta?.total_data ?? result.data.list?.length ?? 0,
    totalPage: meta?.total_page ?? 1,
    currentPage: meta?.current_page ?? page,
  };
}
