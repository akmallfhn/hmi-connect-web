const DEFAULT_MAX_DIMENSION = 1920;
const DEFAULT_TARGET_BYTES = 500 * 1024;
const SKIP_BELOW_BYTES = 100 * 1024;
const MIN_DIMENSION = 256;
const INITIAL_QUALITY = 0.82;
const MIN_QUALITY = 0.35;
const QUALITY_STEP = 0.08;
const DIMENSION_STEP = 0.75;
const ALPHA_SAMPLE_DIMENSION = 256;

export type CompressImageOptions = {
  maxDimension?: number;
  targetBytes?: number;
};

type OutputFormat = { type: "image/jpeg" | "image/webp"; extension: string };

const JPEG: OutputFormat = { type: "image/jpeg", extension: "jpg" };
const WEBP: OutputFormat = { type: "image/webp", extension: "webp" };

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

// JPEG sources can't carry alpha, so only the other formats are sampled for transparency.
function hasTransparency(file: File, bitmap: ImageBitmap) {
  if (file.type === "image/jpeg") return false;
  const scale = Math.min(
    1,
    ALPHA_SAMPLE_DIMENSION / Math.max(bitmap.width, bitmap.height)
  );
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) return true;
  }
  return false;
}

// Re-encodes anything above 100KB, reducing quality then dimensions until it reaches the target.
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

  if (file.size <= SKIP_BELOW_BYTES && scale === 1) {
    bitmap.close();
    return file;
  }

  // Transparent images go to WebP so a logo's background isn't flattened to black.
  const transparent = hasTransparency(file, bitmap);
  let format = transparent ? WEBP : JPEG;

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
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      if (transparent && format === JPEG) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
      }
      ctx.drawImage(bitmap, 0, 0, width, height);
    };
    draw();

    let quality = INITIAL_QUALITY;
    output = await canvasToBlob(canvas, format.type, quality);

    // Browsers without a WebP encoder hand back PNG instead, so flatten onto white as JPEG.
    if (output && output.type !== format.type) {
      format = JPEG;
      draw();
      output = await canvasToBlob(canvas, format.type, quality);
    }

    while (output && output.size > targetBytes && quality > MIN_QUALITY) {
      quality = Math.max(MIN_QUALITY, quality - QUALITY_STEP);
      output = await canvasToBlob(canvas, format.type, quality);
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
  const resized = width !== bitmap.width || height !== bitmap.height;
  bitmap.close();

  if (!output) return file;
  // A re-encode at full size can outgrow an already well-compressed source.
  if (!resized && output.size >= file.size) return file;
  // Keep a transparent original rather than one flattened onto white.
  if (transparent && format === JPEG && file.size <= targetBytes) return file;

  const baseName = file.name.replace(/\.[^.]+$/, "");
  return new File([output], `${baseName}.${format.extension}`, {
    type: format.type,
  });
}
