import "server-only";

import { cookies } from "next/headers";
import { callApi, type ApiEnvelope } from "./api";
import type { AccessEntityTypeEnum } from "@/lib/types";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

export type MentionNameAvailability = {
  mention_name: string;
  mention_name_normalized: string;
  is_available: boolean;
};

// The optional entity is the one being edited, so its own current handle reads as available.
export async function checkMentionNameAvailability(
  mentionName: string,
  entity?: { type: AccessEntityTypeEnum; id: string },
): Promise<ApiEnvelope<MentionNameAvailability>> {
  const sessionToken = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return { status: "UNAUTHORIZED", message: "Session expired. Please log in again." };
  }
  return callApi<MentionNameAvailability>("/api/v1/entity-mentions/check-availability", {
    method: "POST",
    token: sessionToken,
    body: {
      mention_name: mentionName,
      ...(entity ? { entity_type: entity.type, entity_id: entity.id } : {}),
    },
  });
}
