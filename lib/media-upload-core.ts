import type {
  ConfirmMediaResult,
  MediaCategory,
  PresignMediaPayload,
  PresignMediaResult,
} from "@/apis/media";
import type { ApiEnvelope } from "@/apis/api";
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
  confirm: (assetId: string) => Promise<ApiEnvelope<ConfirmMediaResult>>;
  remove: (assetId: string) => Promise<ApiEnvelope>;
  fetcher: typeof fetch;
  wait?: (milliseconds: number) => Promise<void>;
};

const UPLOAD_ATTEMPTS = 3;
const UPLOAD_RETRY_DELAYS_MS = [250, 750] as const;

type UploadFailure =
  | { kind: "http"; status: number }
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
    const headers = new Headers(presigned.data.required_headers);
    if (!headers.has("Content-Type")) headers.set("Content-Type", file.type);
    const wait = dependencies.wait ?? waitFor;
    let uploadSucceeded = false;
    let lastFailure: UploadFailure | undefined;

    for (let attempt = 0; attempt < UPLOAD_ATTEMPTS; attempt += 1) {
      try {
        const upload = await dependencies.fetcher(presigned.data.upload_url, {
          method: "PUT",
          headers,
          body: file,
        });
        if (upload.ok) {
          uploadSucceeded = true;
          break;
        }

        lastFailure = { kind: "http", status: upload.status };
        if (!isRetryableUploadStatus(upload.status)) break;
      } catch {
        // A rejected fetch is ambiguous: the request may have reached R2 while
        // the mobile connection lost the response. Retrying PUT on the same
        // object key is safe, and confirm below recovers that ambiguous success.
        lastFailure = { kind: "network" };
      }

      const retryDelay = UPLOAD_RETRY_DELAYS_MS[attempt];
      if (retryDelay !== undefined) await wait(retryDelay);
    }

    if (!uploadSucceeded) {
      if (lastFailure?.kind === "network") {
        const recovered = await dependencies.confirm(assetId).catch(
          () => undefined,
        );
        if (recovered && isSuccessStatus(recovered.status) && recovered.data) {
          return {
            assetId: recovered.data.asset_id,
            publicUrl: recovered.data.public_url,
          };
        }
        throw new MediaUploadError(
          "Koneksi ke penyimpanan terputus saat mengunggah media. Coba lagi atau ganti jaringan.",
        );
      }
      throw new MediaUploadError(
        `Upload media gagal (${lastFailure?.status ?? "unknown"}).`,
      );
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

function isRetryableUploadStatus(status: number) {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

function waitFor(milliseconds: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
}
