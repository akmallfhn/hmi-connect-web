const MAX_DIMENSION = 1920;
const TARGET_BYTES = 500 * 1024;
const MIN_QUALITY = 0.5;
const QUALITY_STEP = 0.1;

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );
}

// Re-encodes as JPEG, stepping quality down until it fits — GIFs are skipped (would flatten to one frame).
export async function compressImage(file: File): Promise<File> {
  if (file.type === "image/gif") return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(
    1,
    MAX_DIMENSION / Math.max(bitmap.width, bitmap.height)
  );
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let quality = 0.8;
  let blob = await canvasToBlob(canvas, quality);
  while (blob && blob.size > TARGET_BYTES && quality > MIN_QUALITY) {
    quality -= QUALITY_STEP;
    blob = await canvasToBlob(canvas, quality);
  }

  if (!blob || blob.size >= file.size) return file;

  const fileName = `${file.name.replace(/\.[^.]+$/, "")}.jpg`;
  return new File([blob], fileName, { type: "image/jpeg" });
}
