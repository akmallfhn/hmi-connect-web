import "server-only";

import { cookies } from "next/headers";
import { callApi, type ApiEnvelope, type EntityDetailKey } from "./api";
import { isSuccessStatus, type StatusEnum } from "@/lib/types";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

// Mirrors organizations/detail — an organization has no description, only a slug and a logo.
export type OrganizationDetail = {
  id: string;
  name: string;
  mention_name: string;
  mention_name_normalized: string;
  slug: string;
  logo_media_id?: string | null;
  logo_url: string | null;
  status: StatusEnum;
  created_at: string;
  updated_at: string;
};

// `by: "mention_name"` reads the entity by its public handle, matched case-insensitively.
export async function getOrganizationDetail(
  id: string,
  by: EntityDetailKey = "id",
): Promise<OrganizationDetail | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return null;

  const result = await callApi<OrganizationDetail>(
    "/api/v1/organizations/detail",
    { method: "POST", token: sessionToken, body: { [by]: id } }
  );

  if (!isSuccessStatus(result.status) || !result.data) return null;
  return result.data;
}

export type UpdateOrganizationPayload = {
  id: string;
  name?: string;
  mention_name?: string;
  slug?: string;
  // An empty string clears the column, matching the backend's own nullable handling.
  // An entity_image asset id from media upload; an empty string removes the logo.
  logo_media_id?: string;
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

// Suspension answers to the level above, never to the row itself — hence its own endpoint rather than update({status}).
export async function suspendOrganization(id: string): Promise<ApiEnvelope<OrganizationDetail>> {
  return setEntityStatusOrganization("suspend", id);
}

export async function activateOrganization(id: string): Promise<ApiEnvelope<OrganizationDetail>> {
  return setEntityStatusOrganization("activate", id);
}

async function setEntityStatusOrganization(
  action: "suspend" | "activate",
  id: string
): Promise<ApiEnvelope<OrganizationDetail>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return {
      status: "UNAUTHORIZED",
      message: "Session expired. Please log in again.",
    };
  }

  return callApi<OrganizationDetail>(`/api/v1/organizations/${action}`, {
    method: "POST",
    token: sessionToken,
    body: { id },
  });
}
