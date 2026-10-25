export type ImageUploadCategory = "avatar" | "feed_image" | "event_banner";

export class ImageOptimizationError extends Error {}

export type DecodedImage = {
  width: number;
  height: number;
  value: unknown;
  close: () => void;
};

export type EncodeImageInput = {
  width: number;
  height: number;
  mimeType: SupportedImageMime;
  quality?: number;
};

export type ImageOptimizationRuntime = {
  decode: (file: File) => Promise<DecodedImage>;
  hasTransparency: (image: DecodedImage) => Promise<boolean>;
  encode: (
    image: DecodedImage,
    input: EncodeImageInput,
  ) => Promise<Blob | null>;
  yieldToBrowser?: () => Promise<void>;
};

type SupportedImageMime = "image/jpeg" | "image/png" | "image/webp";

type ImagePolicy = {
  maxDimension: number;
  maxBytes: number;
  jpegQuality: number;
  webpQuality: number;
};

const RAW_MAX_BYTES = 20 * 1024 * 1024;
const SKIP_REENCODE_BELOW_BYTES = 128 * 1024;
const MINIMUM_SAVINGS_RATIO = 0.08;

export const IMAGE_POLICIES: Record<ImageUploadCategory, ImagePolicy> = {
  avatar: {
    maxDimension: 512,
    maxBytes: 2 * 1024 * 1024,
    jpegQuality: 0.84,
    webpQuality: 0.82,
  },
  feed_image: {
    maxDimension: 1920,
    maxBytes: 5 * 1024 * 1024,
    jpegQuality: 0.84,
    webpQuality: 0.82,
  },
  event_banner: {
    maxDimension: 1920,
    maxBytes: 5 * 1024 * 1024,
    jpegQuality: 0.87,
    webpQuality: 0.85,
  },
};

const EXTENSIONS: Record<SupportedImageMime, readonly string[]> = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
};

const OUTPUT_EXTENSION: Record<SupportedImageMime, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function optimizeImage(
  file: File,
  category: ImageUploadCategory,
  runtime: ImageOptimizationRuntime = browserImageRuntime,
): Promise<File> {
  const mimeType = validateImageFile(file);
  const detected = await detectImageMime(file);
  if (detected !== mimeType) {
    throw new ImageOptimizationError("Isi file tidak sesuai dengan tipe gambar.");
  }

  const policy = IMAGE_POLICIES[category];
  let decoded: DecodedImage;
  try {
    decoded = await runtime.decode(file);
  } catch {
    throw new ImageOptimizationError("Gambar tidak dapat diproses.");
  }

  try {
    if (decoded.width < 1 || decoded.height < 1) {
      throw new ImageOptimizationError("Dimensi gambar tidak valid.");
    }
    const scale = Math.min(
      1,
      policy.maxDimension / Math.max(decoded.width, decoded.height),
    );
    const width = Math.max(1, Math.round(decoded.width * scale));
    const height = Math.max(1, Math.round(decoded.height * scale));
    const resized = scale < 1;

    if (!resized && file.size <= SKIP_REENCODE_BELOW_BYTES) {
      return file;
    }

    await runtime.yieldToBrowser?.();
    const transparent = await runtime.hasTransparency(decoded);
    const formats = candidateFormats(mimeType, transparent);
    const candidates: { blob: Blob; mimeType: SupportedImageMime }[] = [];

    for (const format of formats) {
      const blob = await runtime.encode(decoded, {
        width,
        height,
        mimeType: format,
        quality:
          format === "image/jpeg"
            ? policy.jpegQuality
            : format === "image/webp"
              ? policy.webpQuality
              : undefined,
      });
      if (blob?.type === format) candidates.push({ blob, mimeType: format });
    }

    if (candidates.length === 0) {
      if (!resized) return file;
      throw new ImageOptimizationError("Browser tidak dapat mengoptimalkan gambar.");
    }

    const smallest = candidates.reduce((best, candidate) =>
      candidate.blob.size < best.blob.size ? candidate : best,
    );
    if (
      !resized &&
      file.size <= policy.maxBytes &&
      smallest.blob.size >= file.size * (1 - MINIMUM_SAVINGS_RATIO)
    ) {
      return file;
    }
    if (smallest.blob.size > policy.maxBytes) {
      throw new ImageOptimizationError(
        "Gambar masih terlalu besar setelah dioptimalkan.",
      );
    }

    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File(
      [smallest.blob],
      `${baseName}.${OUTPUT_EXTENSION[smallest.mimeType]}`,
      { type: smallest.mimeType, lastModified: Date.now() },
    );
  } finally {
    decoded.close();
  }
}

export function validateImageFile(file: File): SupportedImageMime {
  const mimeType = file.type.toLowerCase() as SupportedImageMime;
  const allowedExtensions = EXTENSIONS[mimeType];
  if (!allowedExtensions) {
    throw new ImageOptimizationError("Format gambar harus JPG, PNG, atau WebP.");
  }
  if (file.size <= 0 || file.size > RAW_MAX_BYTES) {
    throw new ImageOptimizationError("Ukuran gambar awal maksimal 20MB.");
  }
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !allowedExtensions.includes(extension)) {
    throw new ImageOptimizationError("Ekstensi gambar tidak sesuai dengan tipe file.");
  }
  return mimeType;
}

export async function detectImageMime(
  file: Pick<File, "slice">,
): Promise<SupportedImageMime | null> {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    ascii(bytes, 0, 4) === "RIFF" &&
    ascii(bytes, 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

function candidateFormats(
  source: SupportedImageMime,
  transparent: boolean,
): SupportedImageMime[] {
  if (transparent) return ["image/webp", "image/png"];
  if (source === "image/png") {
    return ["image/webp", "image/jpeg", "image/png"];
  }
  return ["image/webp", "image/jpeg"];
}

function ascii(bytes: Uint8Array, start: number, end: number) {
  return String.fromCharCode(...bytes.slice(start, end));
}

const browserImageRuntime: ImageOptimizationRuntime = {
  async decode(file) {
    const bitmap = await createImageBitmap(file);
    return {
      width: bitmap.width,
      height: bitmap.height,
      value: bitmap,
      close: () => bitmap.close(),
    };
  },
  async hasTransparency(image) {
    const bitmap = image.value as ImageBitmap;
    const scale = Math.min(1, 256 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new ImageOptimizationError("Canvas tidak tersedia.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let index = 3; index < pixels.length; index += 4) {
      if (pixels[index] < 255) return true;
    }
    return false;
  },
  async encode(image, input) {
    const canvas = document.createElement("canvas");
    canvas.width = input.width;
    canvas.height = input.height;
    const context = canvas.getContext("2d");
    if (!context) throw new ImageOptimizationError("Canvas tidak tersedia.");
    context.drawImage(
      image.value as ImageBitmap,
      0,
      0,
      input.width,
      input.height,
    );
    return new Promise((resolve) =>
      canvas.toBlob(resolve, input.mimeType, input.quality),
    );
  },
  async yieldToBrowser() {
    if (typeof requestAnimationFrame === "function") {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }
  },
};
