import { uploadMediaFile } from "@/lib/media-upload";
import { optimizeImage } from "@/lib/optimize-image";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
const MAX_RAW_BYTES = 20 * 1024 * 1024;
const MAX_BYTES = 5 * 1024 * 1024;

export const TRAINING_POSTER_ACCEPT = ".jpg,.jpeg,.png,.webp";

export type TrainingPosterUploadResult =
  | { ok: true; url: string }
  | { ok: false; message: string };

// Validates, optimizes, and uploads a training poster through the media service.
export async function uploadTrainingPoster(
  file: File
): Promise<TrainingPosterUploadResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, message: "Format hanya boleh JPG, PNG, atau WEBP." };
  }
  const fileExt = file.name.split(".").pop()?.toLowerCase();
  if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt)) {
    return { ok: false, message: "Ekstensi file tidak valid." };
  }
  if (file.size > MAX_RAW_BYTES) {
    return { ok: false, message: "Ukuran gambar maksimal 20MB." };
  }

  try {
    const compressed = await optimizeImage(file, "event_banner");
    if (compressed.size > MAX_BYTES) {
      return { ok: false, message: "Gambar masih terlalu besar setelah dikompres." };
    }
    const uploaded = await uploadMediaFile(compressed, "event_banner");
    if (!uploaded.publicUrl) throw new Error("missing public url");
    return { ok: true, url: uploaded.publicUrl };
  } catch (error) {
    console.error("[uploadTrainingPoster] upload threw:", error);
    return { ok: false, message: "Gagal mengunggah gambar. Coba lagi." };
  }
}
