import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";
import { callApi } from "./api";

export const SESSION_COOKIE_NAME = "session_token_hmi";

export type SessionUser = {
  full_name?: string;
  avatar?: string;
  role?: { id: number; name: string };
  status?: string;
  is_verified?: boolean;
  is_subscribe?: boolean;
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

  if (!result.success || !result.data) {
    return { sessionToken: undefined, user: null };
  }

  return { sessionToken, user: result.data };
});
