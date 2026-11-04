import { uploadMediaFile } from "@/lib/media-upload";
import { optimizeImage } from "@/lib/optimize-image";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
const MAX_RAW_BYTES = 20 * 1024 * 1024;
const MAX_BYTES = 5 * 1024 * 1024;

export const EVENT_IMAGE_ACCEPT = ".jpg,.jpeg,.png,.webp";

export type EventImageUploadResult =
  | { ok: true; url: string; assetId: string }
  | { ok: false; message: string };

export async function uploadEventImage(file: File): Promise<EventImageUploadResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, message: "Format hanya boleh JPG, PNG, atau WEBP." };
  }
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
    return { ok: false, message: "Ekstensi file tidak valid." };
  }
  if (file.size > MAX_RAW_BYTES) {
    return { ok: false, message: "Ukuran gambar maksimal 20MB." };
  }

  try {
    const optimized = await optimizeImage(file, "event_banner");
    if (optimized.size > MAX_BYTES) {
      return { ok: false, message: "Gambar masih terlalu besar setelah dikompres." };
    }
    const uploaded = await uploadMediaFile(optimized, "event_banner");
    if (!uploaded.publicUrl) throw new Error("missing public url");
    return { ok: true, url: uploaded.publicUrl, assetId: uploaded.assetId };
  } catch (error) {
    console.error("[uploadEventImage] upload threw:", error);
    return { ok: false, message: "Gagal mengunggah gambar. Coba lagi." };
  }
}
