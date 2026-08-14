import "server-only";

import { cookies } from "next/headers";
import { callApi, type ApiEnvelope } from "./api";
import type { UserProfile } from "./users";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

// Grant/revoke endpoints for the can_manage_* management scopes — Super Admin-only.
async function callAccessEndpoint(
  path: string,
  id: string
): Promise<ApiEnvelope<UserProfile>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return {
      status: "UNAUTHORIZED",
      message: "Session expired. Please log in again.",
    };
  }

  return callApi<UserProfile>(path, {
    method: "POST",
    token: sessionToken,
    body: { id },
  });
}

export async function grantBranchAdmin(id: string) {
  return callAccessEndpoint("/api/v1/access/grant/branch-admin", id);
}

export async function grantChapterAdmin(id: string) {
  return callAccessEndpoint("/api/v1/access/grant/chapter-admin", id);
}

export async function grantCoordinatingBodyAdmin(id: string) {
  return callAccessEndpoint("/api/v1/access/grant/coordinating-body-admin", id);
}

export async function revokeBranchAdmin(id: string) {
  return callAccessEndpoint("/api/v1/access/revoke/branch-admin", id);
}

export async function revokeChapterAdmin(id: string) {
  return callAccessEndpoint("/api/v1/access/revoke/chapter-admin", id);
}

export async function revokeCoordinatingBodyAdmin(id: string) {
  return callAccessEndpoint(
    "/api/v1/access/revoke/coordinating-body-admin",
    id
  );
}
