import "server-only";

import { cookies } from "next/headers";
import { callApi, type ApiEnvelope } from "./api";
import {
  isSuccessStatus,
  type NotificationEntityTypeEnum,
  type NotificationTypeEnum,
} from "@/lib/types";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

export type Notification = {
  id: string;
  type: NotificationTypeEnum;
  entity_type: NotificationEntityTypeEnum;
  entity_id: string;
  entity_content: string | null;
  feed_id: string | null;
  actor_id: string;
  actor_full_name: string;
  actor_username?: string;
  actor_avatar?: string;
  read_at: string | null;
  created_at: string;
};

type Metapaging = {
  total_data: number;
  total_page: number;
  current_page: number;
  page_size: number;
};

type ListResponse<T> = {
  list: T[];
  metapaging?: Metapaging;
};

async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

function hasMoreFromMetapaging(metapaging?: Metapaging): boolean {
  return metapaging ? metapaging.current_page < metapaging.total_page : false;
}

export async function listNotifications(
  options: { page?: number; pageSize?: number } = {}
): Promise<{ list: Notification[]; hasMore: boolean }> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return { list: [], hasMore: false };

  const { page = 1, pageSize = 20 } = options;
  const result = await callApi<ListResponse<Notification>>("/api/v1/notifications/list", {
    method: "POST",
    token: sessionToken,
    body: { page, page_size: pageSize },
  });

  if (!isSuccessStatus(result.status)) {
    console.error("[listNotifications] request failed:", result);
    return { list: [], hasMore: false };
  }

  return {
    list: result.data?.list ?? [],
    hasMore: hasMoreFromMetapaging(result.data?.metapaging),
  };
}

export async function markNotificationsAsRead(ids?: string[]): Promise<ApiEnvelope> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return { status: "UNAUTHORIZED", message: "Session expired. Please log in again." };
  }

  return callApi("/api/v1/notifications/mark-as-read", {
    method: "POST",
    token: sessionToken,
    body: { ids: ids ?? [] },
  });
}
