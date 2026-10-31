import "server-only";

import { cookies } from "next/headers";
import { callApi, type ApiEnvelope } from "./api";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

export type MediaCategory =
  | "avatar"
  | "feed_image"
  | "event_banner"
  | "chat_image"
  | "entity_image"
  | "article_cover"
  | "article_content"
  | "document"
  | "document_cover"
  | "institution_image";

export type PresignMediaPayload = {
  filename: string;
  contentType: string;
  size: number;
  category: MediaCategory;
};

export type PresignMediaResult = {
  asset_id: string;
  upload_url: string;
  required_headers: Record<string, string>;
  expires_at: string;
};

export type ConfirmMediaResult = {
  asset_id: string;
  public_url?: string;
};

export type DownloadMediaResult = {
  download_url: string;
  expires_at?: string;
};

async function sessionToken() {
  return (await cookies()).get(SESSION_COOKIE_NAME)?.value;
}

function unauthorized<T>(): ApiEnvelope<T> {
  return {
    status: "UNAUTHORIZED",
    message: "Session expired. Please log in again.",
  };
}

export async function presignMedia(
  payload: PresignMediaPayload,
): Promise<ApiEnvelope<PresignMediaResult>> {
  const token = await sessionToken();
  if (!token) return unauthorized();
  return callApi<PresignMediaResult>("/api/v1/media/presign", {
    method: "POST",
    token,
    body: {
      filename: payload.filename,
      content_type: payload.contentType,
      size: payload.size,
      category: payload.category,
    },
  });
}

export async function fallbackMedia(
  assetId: string,
): Promise<ApiEnvelope<PresignMediaResult>> {
  const token = await sessionToken();
  if (!token) return unauthorized();
  return callApi<PresignMediaResult>("/api/v1/media/fallback", {
    method: "POST",
    token,
    body: { asset_id: assetId },
  });
}

export async function confirmMedia(
  assetId: string,
): Promise<ApiEnvelope<ConfirmMediaResult>> {
  const token = await sessionToken();
  if (!token) return unauthorized();
  return callApi<ConfirmMediaResult>("/api/v1/media/confirm", {
    method: "POST",
    token,
    body: { asset_id: assetId },
  });
}

export async function downloadMedia(
  assetId: string,
): Promise<ApiEnvelope<DownloadMediaResult>> {
  const token = await sessionToken();
  if (!token) return unauthorized();
  return callApi<DownloadMediaResult>("/api/v1/media/download", {
    method: "POST",
    token,
    body: { asset_id: assetId },
  });
}

export async function deleteMedia(assetId: string): Promise<ApiEnvelope> {
  const token = await sessionToken();
  if (!token) return unauthorized();
  return callApi("/api/v1/media/delete", {
    method: "POST",
    token,
    body: { asset_id: assetId },
  });
}
