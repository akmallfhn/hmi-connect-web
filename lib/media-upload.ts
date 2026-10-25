"use client";

import type { MediaCategory } from "@/apis/media";
import {
  confirmMedia,
  deleteMedia,
  presignMedia,
} from "@/lib/actions";
import {
  uploadMediaFileWithDependencies,
  type UploadDependencies,
  type UploadedMedia,
} from "@/lib/media-upload-core";

export { MediaUploadError } from "@/lib/media-upload-core";
export type { UploadedMedia } from "@/lib/media-upload-core";

export type UploadedPublicMedia = {
  assetId: string;
  publicUrl: string;
};

const defaultDependencies: UploadDependencies = {
  presign: presignMedia,
  confirm: confirmMedia,
  remove: deleteMedia,
  fetcher: fetch,
};

export async function uploadMediaFile(
  file: File,
  category: MediaCategory,
  dependencies: UploadDependencies = defaultDependencies,
): Promise<UploadedMedia> {
  return uploadMediaFileWithDependencies(file, category, dependencies);
}

export async function uploadPublicMediaFile(
  file: File,
  category: MediaCategory,
): Promise<UploadedPublicMedia> {
  const uploaded = await uploadMediaFile(file, category);
  if (!uploaded.publicUrl) {
    throw new Error("URL publik media tidak tersedia.");
  }
  return { assetId: uploaded.assetId, publicUrl: uploaded.publicUrl };
}
