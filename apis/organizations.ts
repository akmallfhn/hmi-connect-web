import "server-only";

import { cookies } from "next/headers";
import { callApi, type ApiEnvelope } from "./api";
import { isSuccessStatus, type StatusEnum } from "@/lib/types";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

// Mirrors organizations/detail — an organization has no description, only a slug and a logo.
export type OrganizationDetail = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  status: StatusEnum;
  created_at: string;
  updated_at: string;
};

export async function getOrganizationDetail(
  id: string
): Promise<OrganizationDetail | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return null;

  const result = await callApi<OrganizationDetail>(
    "/api/v1/organizations/detail",
    { method: "POST", token: sessionToken, body: { id } }
  );

  if (!isSuccessStatus(result.status) || !result.data) return null;
  return result.data;
}

export type UpdateOrganizationPayload = {
  id: string;
  name?: string;
  slug?: string;
  // An empty string clears the column, matching the backend's own nullable handling.
  logo_url?: string;
  status?: StatusEnum;
};

export async function updateOrganization(
  payload: UpdateOrganizationPayload
): Promise<ApiEnvelope<OrganizationDetail>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return {
      status: "UNAUTHORIZED",
      message: "Session expired. Please log in again.",
    };
  }

  return callApi<OrganizationDetail>("/api/v1/organizations/update", {
    method: "POST",
    token: sessionToken,
    body: payload,
  });
}
