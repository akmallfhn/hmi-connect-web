import { compressImage } from "@/lib/compress-image";
import { supabase } from "@/lib/supabase";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif"];
const MAX_RAW_BYTES = 20 * 1024 * 1024;
const MAX_BYTES = 5 * 1024 * 1024;

export const TRAINING_POSTER_ACCEPT = ".jpg,.jpeg,.png,.webp,.avif";

export type TrainingPosterUploadResult =
  | { ok: true; url: string }
  | { ok: false; message: string };

// Validates, compresses, and uploads a training poster straight to the public bucket's training/ folder.
export async function uploadTrainingPoster(
  file: File
): Promise<TrainingPosterUploadResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, message: "Format hanya boleh JPG, PNG, WEBP, atau AVIF." };
  }
  const fileExt = file.name.split(".").pop()?.toLowerCase();
  if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt)) {
    return { ok: false, message: "Ekstensi file tidak valid." };
  }
  if (file.size > MAX_RAW_BYTES) {
    return { ok: false, message: "Ukuran gambar maksimal 20MB." };
  }

  try {
    const compressed = await compressImage(file);
    if (compressed.size > MAX_BYTES) {
      return { ok: false, message: "Gambar masih terlalu besar setelah dikompres." };
    }
    const compressedExt =
      compressed.name.split(".").pop()?.toLowerCase() ?? fileExt;
    const filePath = `training/${Date.now()}.${compressedExt}`;

    const { error } = await supabase.storage
      .from("hmi-connect")
      .upload(filePath, compressed, { cacheControl: "3600", upsert: false });
    if (error) throw new Error(error.message);

    const { data } = supabase.storage.from("hmi-connect").getPublicUrl(filePath);
    if (!data?.publicUrl) throw new Error("missing public url");
    return { ok: true, url: data.publicUrl };
  } catch (error) {
    console.error("[uploadTrainingPoster] upload threw:", error);
    return { ok: false, message: "Gagal mengunggah gambar. Coba lagi." };
  }
}
