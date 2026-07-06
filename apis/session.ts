import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";
import { callApi, type ApiEnvelope } from "./api";
import { isSuccessStatus, type UserStatusEnum } from "@/lib/types";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

export type SessionUser = {
  id?: string;
  organization_id?: string;
  organization_name?: string;
  coordinating_body_id?: string;
  coordinating_body_name?: string;
  branch_id?: string;
  branch_name?: string;
  full_name?: string;
  avatar?: string;
  role_id?: number;
  role_name?: string;
  status?: UserStatusEnum;
  is_verified?: boolean;
  is_subscribe?: boolean;
  access_token?: string;
};

// The session cookie is the backend's own JWT; its "sub" claim is the user's id. Decoding it
// here (no signature check needed) avoids a backend round-trip just to get an id to link to.
function decodeUserId(token: string): string | undefined {
  try {
    const payload = token.split(".")[1];
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof claims.sub === "string" ? claims.sub : undefined;
  } catch {
    return undefined;
  }
}

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
    user: { ...result.data, id: decodeUserId(sessionToken) },
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

  cookieStore.delete(SESSION_COOKIE_NAME);

  return result;
}
