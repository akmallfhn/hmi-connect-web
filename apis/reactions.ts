import "server-only";

import { cookies } from "next/headers";
import { callApi, type ApiEnvelope } from "./api";
import { isSuccessStatus, type ReactionTargetTypeEnum, type ReactionTypeEnum } from "@/lib/types";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

export type Reactor = {
  id: string;
  full_name: string;
  username?: string;
  avatar?: string;
};

type Metapaging = {
  total_data: number;
  total_page: number;
  current_page: number;
  page_size: number;
};

type ReactorListResponse = {
  list: Reactor[];
  metapaging?: Metapaging;
};

async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

export async function sendReaction(payload: {
  targetType: ReactionTargetTypeEnum;
  targetId: string;
  type: ReactionTypeEnum;
}): Promise<ApiEnvelope> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return { status: "UNAUTHORIZED", message: "Session expired. Please log in again." };
  }

  return callApi("/api/v1/reactions/send", {
    method: "POST",
    token: sessionToken,
    body: {
      target_type: payload.targetType,
      target_id: payload.targetId,
      type: payload.type,
    },
  });
}

export async function unsendReaction(payload: {
  targetType: ReactionTargetTypeEnum;
  targetId: string;
}): Promise<ApiEnvelope> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return { status: "UNAUTHORIZED", message: "Session expired. Please log in again." };
  }

  return callApi("/api/v1/reactions/unsend", {
    method: "POST",
    token: sessionToken,
    body: { target_type: payload.targetType, target_id: payload.targetId },
  });
}

export async function listReactors(payload: {
  targetType: ReactionTargetTypeEnum;
  targetId: string;
  page?: number;
  pageSize?: number;
}): Promise<{ list: Reactor[]; hasMore: boolean }> {
  const sessionToken = await getSessionToken();
  const authToken = sessionToken ?? process.env.CLIENT_SECRET;
  if (!authToken) return { list: [], hasMore: false };

  const { page = 1, pageSize = 20 } = payload;
  const result = await callApi<ReactorListResponse>("/api/v1/reactions/list", {
    method: "POST",
    token: authToken,
    body: {
      target_type: payload.targetType,
      target_id: payload.targetId,
      page,
      page_size: pageSize,
    },
  });

  if (!isSuccessStatus(result.status)) {
    console.error("[listReactors] request failed:", result);
    return { list: [], hasMore: false };
  }

  const list = result.data?.list ?? [];
  const metapaging = result.data?.metapaging;
  const hasMore = metapaging ? metapaging.current_page < metapaging.total_page : false;
  return { list, hasMore };
}
