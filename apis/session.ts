import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";
import { callApi } from "./api";
import { isSuccessStatus, type UserStatusEnum } from "@/lib/types";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

export type SessionUser = {
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

  return { sessionToken, user: result.data };
});
