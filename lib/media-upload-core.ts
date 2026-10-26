import type {
  ConfirmMediaResult,
  MediaCategory,
  PresignMediaPayload,
  PresignMediaResult,
} from "@/apis/media";
import type { ApiEnvelope } from "@/apis/api";
import {
  LEGACY_R2_UPLOAD_TARGET_HEADER,
  MEDIA_UPLOAD_EDGE_PATH,
  MEDIA_UPLOAD_TARGET_HEADER,
} from "@/lib/media-upload-transport";
import { isSuccessStatus } from "@/lib/types";

export class MediaUploadError extends Error {}

export type UploadedMedia = {
  assetId: string;
  publicUrl?: string;
};

export type UploadDependencies = {
  presign: (
    payload: PresignMediaPayload,
  ) => Promise<ApiEnvelope<PresignMediaResult>>;
  fallback?: (assetId: string) => Promise<ApiEnvelope<PresignMediaResult>>;
  confirm: (assetId: string) => Promise<ApiEnvelope<ConfirmMediaResult>>;
  remove: (assetId: string) => Promise<ApiEnvelope>;
  fetcher: typeof fetch;
  wait?: (milliseconds: number) => Promise<void>;
};

const UPLOAD_ATTEMPTS = 4;
const UPLOAD_RETRY_DELAYS_MS = [500, 1500, 3000] as const;

type UploadFailure =
  | { kind: "http"; status: number; message?: string }
  | { kind: "network" };

export async function uploadMediaFileWithDependencies(
  file: File,
  category: MediaCategory,
  dependencies: UploadDependencies,
): Promise<UploadedMedia> {
  const presigned = await dependencies.presign({
    filename: file.name,
    contentType: file.type,
    size: file.size,
    category,
  });
  if (!isSuccessStatus(presigned.status) || !presigned.data) {
    throw new MediaUploadError(
      presigned.message ?? "Gagal menyiapkan unggahan media.",
    );
  }

  const assetId = presigned.data.asset_id;
  try {
    const wait = dependencies.wait ?? waitFor;
    let failure = await uploadToTarget(
      file,
      presigned.data,
      dependencies.fetcher,
      wait,
    );

    if (failure && shouldRecoverOrFallback(failure)) {
      const recovered = await recoverConfirmed(assetId, dependencies.confirm);
      if (recovered) return recovered;

      if (dependencies.fallback) {
        const fallback = await dependencies.fallback(assetId);
        if (!isSuccessStatus(fallback.status) || !fallback.data) {
          throw new MediaUploadError(
            fallback.message ?? "Penyimpanan cadangan tidak tersedia.",
          );
        }
        if (fallback.data.asset_id !== assetId) {
          throw new MediaUploadError("ID media berubah saat beralih penyimpanan.");
        }
        failure = await uploadToTarget(
          file,
          fallback.data,
          dependencies.fetcher,
          wait,
        );
        if (failure && shouldRecoverOrFallback(failure)) {
          const fallbackRecovered = await recoverConfirmed(
            assetId,
            dependencies.confirm,
          );
          if (fallbackRecovered) return fallbackRecovered;
        }
      }
    }

    if (failure) {
      throw uploadFailureError(failure);
    }

    const confirmed = await dependencies.confirm(assetId);
    if (!isSuccessStatus(confirmed.status) || !confirmed.data) {
      throw new MediaUploadError(
        confirmed.message ?? "Unggahan media tidak dapat dikonfirmasi.",
      );
    }
    return {
      assetId: confirmed.data.asset_id,
      publicUrl: confirmed.data.public_url,
    };
  } catch (error) {
    await dependencies.remove(assetId).catch(() => undefined);
    if (error instanceof MediaUploadError) throw error;
    throw new MediaUploadError("Gagal mengunggah media.");
  }
}

async function uploadToTarget(
  file: File,
  presigned: PresignMediaResult,
  fetcher: typeof fetch,
  wait: (milliseconds: number) => Promise<void>,
): Promise<UploadFailure | undefined> {
  const headers = new Headers(presigned.required_headers);
  const uploadTarget =
    headers.get(LEGACY_R2_UPLOAD_TARGET_HEADER) ?? presigned.upload_url;
  headers.delete(LEGACY_R2_UPLOAD_TARGET_HEADER);
  headers.set(MEDIA_UPLOAD_TARGET_HEADER, uploadTarget);
  if (!headers.has("Content-Type")) headers.set("Content-Type", file.type);

  let lastFailure: UploadFailure | undefined;
  for (let attempt = 0; attempt < UPLOAD_ATTEMPTS; attempt += 1) {
    try {
      const upload = await fetcher(MEDIA_UPLOAD_EDGE_PATH, {
        method: "PUT",
        headers,
        body: file,
      });
      if (upload.ok) return undefined;

      lastFailure = {
        kind: "http",
        status: upload.status,
        message: await readUploadErrorMessage(upload),
      };
      if (!isRetryableUploadStatus(upload.status)) break;
    } catch {
      // A rejected fetch is ambiguous: the provider may have stored the object
      // while the mobile connection lost the response. PUT is safe to retry.
      lastFailure = { kind: "network" };
    }

    const retryDelay = UPLOAD_RETRY_DELAYS_MS[attempt];
    if (retryDelay !== undefined) await wait(retryDelay);
  }
  return lastFailure ?? { kind: "network" };
}

async function recoverConfirmed(
  assetId: string,
  confirm: UploadDependencies["confirm"],
): Promise<UploadedMedia | undefined> {
  const recovered = await confirm(assetId).catch(() => undefined);
  if (!recovered || !isSuccessStatus(recovered.status) || !recovered.data) {
    return undefined;
  }
  return {
    assetId: recovered.data.asset_id,
    publicUrl: recovered.data.public_url,
  };
}

function shouldRecoverOrFallback(failure: UploadFailure) {
  return (
    failure.kind === "network" ||
    isRetryableUploadStatus(failure.status) ||
    failure.message === "Storage rejected the upload."
  );
}

function uploadFailureError(failure: UploadFailure) {
  if (failure.kind === "network") {
    return new MediaUploadError(
      "Koneksi unggahan ke server terputus. Periksa jaringan lalu coba lagi.",
    );
  }
  return new MediaUploadError(
    `Upload media gagal (${failure.status})${
      failure.message ? `: ${failure.message}` : "."
    }`,
  );
}

async function readUploadErrorMessage(response: Response) {
  try {
    const body: unknown = await response.clone().json();
    if (
      typeof body === "object" &&
      body !== null &&
      "message" in body &&
      typeof body.message === "string"
    ) {
      return body.message;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function isRetryableUploadStatus(status: number) {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

function waitFor(milliseconds: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
}
