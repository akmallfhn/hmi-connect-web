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
};

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
    const upload = await dependencies.fetcher(presigned.data.upload_url, {
      method: "PUT",
      headers,
      body: file,
    });
    if (!upload.ok) {
      throw new MediaUploadError(`Upload media gagal (${upload.status}).`);
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
