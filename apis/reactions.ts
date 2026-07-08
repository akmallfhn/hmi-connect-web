import "server-only";

import { cookies } from "next/headers";
import { callApi, type ApiEnvelope } from "./api";
import type { ReactionTargetTypeEnum, ReactionTypeEnum } from "@/lib/types";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

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
