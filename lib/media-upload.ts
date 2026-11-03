"use client";

import type { MediaCategory } from "@/apis/media";
import {
  confirmMedia,
  deleteMedia,
  fallbackMedia,
  presignMedia,
} from "@/lib/actions";
import {
  uploadMediaFileWithDependencies,
  type UploadDependencies,
  type UploadedMedia,
} from "@/lib/media-upload-core";

export { MediaUploadError } from "@/lib/media-upload-core";
export type { UploadedMedia } from "@/lib/media-upload-core";

// An entity logo field's value: the asset id is what gets saved, the URL only drives the preview.
export type EntityLogoValue = {
  mediaId: string;
  imageUrl: string;
};

export type UploadedPublicMedia = {
  assetId: string;
  publicUrl: string;
};

const defaultDependencies: UploadDependencies = {
  presign: presignMedia,
  fallback: fallbackMedia,
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
