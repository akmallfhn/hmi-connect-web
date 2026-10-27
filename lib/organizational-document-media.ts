"use client";

import type { PDFRawStream as PdfRawStream, PDFRef } from "pdf-lib";

const COVER_RATIO = 16 / 9;
const COVER_TARGET_BYTES = 100 * 1024;
// Widest first; quality only drops to 0.62, so a hard photo ends a little over target instead of blocky.
const COVER_WIDTHS = [1280, 1120, 960];
const COVER_QUALITIES = [0.86, 0.8, 0.74, 0.68, 0.62];

export const PDF_TARGET_BYTES = 500 * 1024;
// Gentlest first; the last level is the floor, so a text-heavy PDF stops there instead of turning blurry.
const PDF_IMAGE_LEVELS = [
  { edge: 1600, quality: 0.8 },
  { edge: 1400, quality: 0.72 },
  { edge: 1200, quality: 0.66 },
  { edge: 1000, quality: 0.6 },
];

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
) {
  return new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, quality)
  );
}

// Center-crops a cover to 16:9 and steps width and quality down until it lands near 100KB.
export async function prepareDocumentCover(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  try {
    let sx = 0;
    let sy = 0;
    let sw = bitmap.width;
    let sh = bitmap.height;
    if (sw / sh > COVER_RATIO) {
      sw = Math.round(sh * COVER_RATIO);
      sx = Math.round((bitmap.width - sw) / 2);
    } else {
      sh = Math.round(sw / COVER_RATIO);
      sy = Math.round((bitmap.height - sh) / 2);
    }

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas context is unavailable");
    let smallest: Blob | null = null;

    for (const maxWidth of COVER_WIDTHS) {
      const width = Math.min(maxWidth, sw);
      const height = Math.round(width / COVER_RATIO);
      canvas.width = width;
      canvas.height = height;
      context.imageSmoothingQuality = "high";
      context.drawImage(bitmap, sx, sy, sw, sh, 0, 0, width, height);
      for (const quality of COVER_QUALITIES) {
        const blob =
          (await canvasToBlob(canvas, "image/webp", quality)) ??
          (await canvasToBlob(canvas, "image/jpeg", quality));
        if (!blob) continue;
        if (!smallest || blob.size < smallest.size) smallest = blob;
        if (blob.size <= COVER_TARGET_BYTES) return toFile(blob, file.name);
      }
      if (width === sw) break;
    }
    if (!smallest) throw new Error("Cover could not be encoded");
    return toFile(smallest, file.name);
  } finally {
    bitmap.close();
  }
}

function toFile(blob: Blob, originalName: string) {
  const extension = blob.type === "image/webp" ? "webp" : "jpg";
  const base = originalName.replace(/\.[^.]+$/, "") || "sampul";
  return new File([blob], `${base}.${extension}`, { type: blob.type });
}

// Re-encodes the PDF's JPEG images one level at a time until the file fits PDF_TARGET_BYTES or hits the floor.
export async function compressPdf(file: File): Promise<File> {
  if (file.size <= PDF_TARGET_BYTES) return file;
  const { PDFArray, PDFDocument, PDFName, PDFNumber, PDFRawStream } =
    await import("pdf-lib");
  const original = new Uint8Array(await file.arrayBuffer());
  let pdf: Awaited<ReturnType<typeof PDFDocument.load>>;
  try {
    pdf = await PDFDocument.load(original, { updateMetadata: false });
  } catch {
    return file;
  }

  const dct = PDFName.of("DCTDecode");
  const rgb = PDFName.of("DeviceRGB");
  const gray = PDFName.of("DeviceGray");
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return file;

  type Candidate = { ref: PDFRef; stream: PdfRawStream; bitmap: ImageBitmap };
  const candidates: Candidate[] = [];
  for (const [ref, object] of pdf.context.enumerateIndirectObjects()) {
    if (!(object instanceof PDFRawStream)) continue;
    const dict = object.dict;
    if (dict.get(PDFName.of("Subtype")) !== PDFName.of("Image")) continue;
    const filter = dict.get(PDFName.of("Filter"));
    const isJpeg =
      filter === dct ||
      (filter instanceof PDFArray &&
        filter.size() === 1 &&
        filter.get(0) === dct);
    const colorSpace = pdf.context.lookup(dict.get(PDFName.of("ColorSpace")));
    // Anything with a Decode array, a mask flag, or an unusual colour space is left exactly as is.
    if (
      !isJpeg ||
      (colorSpace !== rgb && colorSpace !== gray) ||
      dict.has(PDFName.of("Decode")) ||
      dict.has(PDFName.of("ImageMask"))
    )
      continue;
    try {
      const bitmap = await createImageBitmap(
        new Blob([object.contents.slice()], { type: "image/jpeg" })
      );
      candidates.push({ ref, stream: object, bitmap });
    } catch {
      continue;
    }
  }

  let best: Uint8Array | null = null;
  try {
    for (const level of PDF_IMAGE_LEVELS) {
      for (const { ref, stream, bitmap } of candidates) {
        const scale = Math.min(
          1,
          level.edge / Math.max(bitmap.width, bitmap.height)
        );
        const width = Math.max(1, Math.round(bitmap.width * scale));
        const height = Math.max(1, Math.round(bitmap.height * scale));
        canvas.width = width;
        canvas.height = height;
        context.imageSmoothingQuality = "high";
        context.drawImage(bitmap, 0, 0, width, height);
        const blob = await canvasToBlob(canvas, "image/jpeg", level.quality);
        // Each level starts from the original image, and never swaps in something larger.
        if (!blob || blob.size >= stream.contents.length) {
          pdf.context.assign(ref, stream);
          continue;
        }
        const bytes = new Uint8Array(await blob.arrayBuffer());
        const nextDict = stream.dict.clone(pdf.context);
        nextDict.set(PDFName.of("Width"), PDFNumber.of(width));
        nextDict.set(PDFName.of("Height"), PDFNumber.of(height));
        nextDict.set(PDFName.of("ColorSpace"), rgb);
        nextDict.set(PDFName.of("BitsPerComponent"), PDFNumber.of(8));
        nextDict.set(PDFName.of("Filter"), dct);
        nextDict.delete(PDFName.of("DecodeParms"));
        nextDict.set(PDFName.of("Length"), PDFNumber.of(bytes.length));
        pdf.context.assign(ref, PDFRawStream.of(nextDict, bytes));
      }
      const saved = await pdf.save({ useObjectStreams: true });
      if (!best || saved.length < best.length) best = saved;
      if (saved.length <= PDF_TARGET_BYTES || candidates.length === 0) break;
    }
  } finally {
    candidates.forEach(({ bitmap }) => bitmap.close());
  }

  if (!best || best.length >= original.length * 0.97) return file;
  return new File([best.slice()], file.name, { type: "application/pdf" });
}
