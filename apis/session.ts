import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";
import { callApi, type ApiEnvelope } from "./api";
import {
  isSuccessStatus,
  type AccessCapabilityEnum,
  type AccessEntityTypeEnum,
  type UserStatusEnum,
  type VerificationStatusEnum,
} from "@/lib/types";
import { SESSION_COOKIE_NAME, getSessionCookieDomain } from "@/lib/constants";

// One accepted, unrevoked access grant — check-session only ever returns accepted ones.
export type SessionGrant = {
  id: string;
  entity_type: AccessEntityTypeEnum;
  entity_id: string;
  entity_name?: string;
  capability: AccessCapabilityEnum;
};

export type SessionUser = {
  id?: string;
  organization_id?: string;
  organization_name?: string;
  coordinating_body_id?: string;
  coordinating_body_name?: string;
  branch_id?: string;
  branch_name?: string;
  coordinating_chapter_id?: string;
  coordinating_chapter_name?: string;
  chapter_id?: string;
  chapter_name?: string;
  grants?: SessionGrant[]; // replaced the can_manage_* booleans; `[]` for plain members and for Super Admin
  full_name?: string;
  username: string; // backend auto-generates a placeholder at sign-up, never null — see internal/user/README.md
  avatar?: string;
  role_id?: number;
  role_name?: string;
  status?: UserStatusEnum;
  verification_status?: VerificationStatusEnum;
  is_subscribe?: boolean;
  access_token?: string;
};

export const getSession = cache(async () => {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return { sessionToken: undefined, user: null };
  }

  const result = await callApi<SessionUser>("/api/v1/auth/check-session", {
    method: "POST",
    token: sessionToken,
  });

  if (!isSuccessStatus(result.status) || !result.data) {
    return { sessionToken: undefined, user: null };
  }

  return {
    sessionToken,
    user: result.data,
  };
});

// Clears the cookie regardless of whether the backend logout call succeeds.
export async function logoutUser(): Promise<ApiEnvelope> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  const result = sessionToken
    ? await callApi("/api/v1/auth/logout", {
        method: "POST",
        token: sessionToken,
      })
    : { status: "OK" as const, message: "Already logged out" };

  const cookieDomain = getSessionCookieDomain();
  cookieStore.delete({
    name: SESSION_COOKIE_NAME,
    ...(cookieDomain ? { domain: cookieDomain } : {}),
  });

  return result;
}
