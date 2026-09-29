import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import sharp from "sharp";
import { NextResponse } from "next/server";
import {
  DEFAULT_ATTACHMENT_COLOR,
  matchAttachmentPalette,
} from "@/lib/attachment-palette";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const SUCCESS_CACHE = "public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800";
const FALLBACK_CACHE = "public, max-age=300";

function publicAddress(address: string) {
  if (isIP(address) === 6) {
    const firstSegment = Number.parseInt(address.split(":")[0], 16);
    return firstSegment >= 0x2000 && firstSegment <= 0x3fff;
  }
  if (isIP(address) !== 4) return false;

  const [a, b, c] = address.split(".").map(Number);
  return !(
    a === 0 ||
    a === 10 ||
    a === 127 ||
    a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && (b === 0 || (b === 168) || (b === 88 && c === 99))) ||
    (a === 198 && (b === 18 || b === 19))
  );
}

async function safeImageUrl(raw: string) {
  if (raw.length > 2048) return null;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  if (
    (url.protocol !== "https:" && url.protocol !== "http:") ||
    url.port ||
    url.username ||
    url.password ||
    !url.hostname.includes(".") ||
    isIP(url.hostname) ||
    /\.(?:localhost|local|internal|test|invalid)$/i.test(url.hostname)
  ) {
    return null;
  }

  try {
    const addresses = await lookup(url.hostname, { all: true });
    return addresses.length > 0 && addresses.every(({ address }) => publicAddress(address))
      ? url
      : null;
  } catch {
    return null;
  }
}

async function fetchImage(raw: string) {
  let target = raw;
  for (let redirects = 0; redirects < 3; redirects++) {
    const url = await safeImageUrl(target);
    if (!url) return null;

    const response = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(6000),
      headers: { Accept: "image/avif,image/webp,image/png,image/jpeg,image/gif" },
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) return null;
      target = new URL(location, url).toString();
      continue;
    }

    const contentType = response.headers.get("content-type")?.split(";")[0];
    if (
      !response.ok ||
      !response.body ||
      !contentType ||
      !["image/avif", "image/webp", "image/png", "image/jpeg", "image/gif", "application/octet-stream"].includes(contentType) ||
      Number(response.headers.get("content-length") ?? 0) > MAX_IMAGE_BYTES
    ) {
      return null;
    }

    const reader = response.body.getReader();
    const chunks: Buffer[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_IMAGE_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(Buffer.from(value));
    }
    return Buffer.concat(chunks);
  }
  return null;
}

export async function GET(request: Request) {
  const target = new URL(request.url).searchParams.get("url");
  if (!target) {
    return NextResponse.json({ color: DEFAULT_ATTACHMENT_COLOR }, {
      headers: { "Cache-Control": FALLBACK_CACHE },
    });
  }

  try {
    const bytes = await fetchImage(target);
    if (!bytes) throw new Error("Thumbnail unavailable");

    const { data, info } = await sharp(bytes, { limitInputPixels: 25_000_000 })
      .rotate()
      .resize(32, 18, { fit: "fill" })
      .flatten({ background: "#ffffff" })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    return NextResponse.json(
      { color: matchAttachmentPalette(data, info.channels) },
      { headers: { "Cache-Control": SUCCESS_CACHE } },
    );
  } catch {
    return NextResponse.json(
      { color: DEFAULT_ATTACHMENT_COLOR },
      { headers: { "Cache-Control": FALLBACK_CACHE } },
    );
  }
}
