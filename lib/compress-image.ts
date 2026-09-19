const DEFAULT_MAX_DIMENSION = 1920;
const DEFAULT_TARGET_BYTES = 500 * 1024;
const MIN_DIMENSION = 256;
const INITIAL_QUALITY = 0.82;
const MIN_QUALITY = 0.35;
const QUALITY_STEP = 0.08;
const DIMENSION_STEP = 0.75;

export type CompressImageOptions = {
  maxDimension?: number;
  targetBytes?: number;
};

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );
}

// Re-encodes as JPEG, reducing both quality and dimensions until it reaches the target.
// GIFs are skipped because canvas encoding would flatten an animation to one frame.
export async function compressImage(
  file: File,
  options: CompressImageOptions = {}
): Promise<File> {
  if (file.type === "image/gif") return file;

  const bitmap = await createImageBitmap(file);
  const maxDimension = options.maxDimension ?? DEFAULT_MAX_DIMENSION;
  const targetBytes = options.targetBytes ?? DEFAULT_TARGET_BYTES;
  const scale = Math.min(
    1,
    maxDimension / Math.max(bitmap.width, bitmap.height)
  );
  let width = Math.max(1, Math.round(bitmap.width * scale));
  let height = Math.max(1, Math.round(bitmap.height * scale));

  // Do not re-encode a file that is already small at the requested resolution.
  if (file.size <= targetBytes && scale === 1) {
    bitmap.close();
    return file;
  }

  let output: Blob | null = null;
  while (true) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);

    let quality = INITIAL_QUALITY;
    output = await canvasToBlob(canvas, quality);
    while (output && output.size > targetBytes && quality > MIN_QUALITY) {
      quality = Math.max(MIN_QUALITY, quality - QUALITY_STEP);
      output = await canvasToBlob(canvas, quality);
    }

    if (
      !output ||
      output.size <= targetBytes ||
      Math.max(width, height) <= MIN_DIMENSION
    ) {
      break;
    }

    const nextScale = Math.max(
      DIMENSION_STEP,
      MIN_DIMENSION / Math.max(width, height)
    );
    width = Math.max(1, Math.round(width * nextScale));
    height = Math.max(1, Math.round(height * nextScale));
  }
  bitmap.close();

  if (!output) return file;

  const fileName = `${file.name.replace(/\.[^.]+$/, "")}.jpg`;
  return new File([output], fileName, { type: "image/jpeg" });
}
