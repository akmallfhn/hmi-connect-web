import { MEDIA_UPLOAD_TARGET_HEADER } from "@/lib/media-upload-transport";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const R2_HOST_SUFFIX = ".r2.cloudflarestorage.com";
const R2_BUCKET_PATH = "/hmi-connect/";
const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const ALLOWED_R2_HEADERS = new Set([
  "cache-control",
  "content-type",
  "x-amz-meta-asset-id",
]);

type Fetcher = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

type UploadBodyResult =
  | { ok: true; body: ArrayBuffer }
  | { ok: false; reason: "empty" | "too_large" | "invalid" };

export async function proxyMediaUpload(
  request: Request,
  fetcher: Fetcher = fetch,
) {
  if (!isSameOrigin(request)) {
    return errorResponse(403, "Upload origin is not allowed.");
  }

  const target = request.headers.get(MEDIA_UPLOAD_TARGET_HEADER);
  if (!target || !isValidR2Target(target)) {
    return errorResponse(400, "Upload target is invalid.");
  }

  const contentType = request.headers.get("Content-Type")?.split(";", 1)[0];
  if (!contentType || !ALLOWED_CONTENT_TYPES.has(contentType)) {
    return errorResponse(415, "Upload content type is not supported.");
  }

  const contentLength = request.headers.get("Content-Length");
  if (contentLength !== null) {
    if (!/^\d+$/.test(contentLength)) {
      return errorResponse(400, "Upload size is invalid.");
    }
    if (Number(contentLength) > MAX_UPLOAD_BYTES) {
      return errorResponse(413, "Upload is too large.");
    }
  }

  let bodyResult: UploadBodyResult;
  try {
    bodyResult = await readUploadBody(request);
  } catch {
    return errorResponse(400, "Upload body could not be read.");
  }
  if (!bodyResult.ok) {
    if (bodyResult.reason === "too_large") {
      return errorResponse(413, "Upload is too large.");
    }
    return errorResponse(400, "Upload size is invalid.");
  }

  const headers = new Headers();
  for (const [name, value] of request.headers) {
    const normalizedName = name.toLowerCase();
    if (
      ALLOWED_R2_HEADERS.has(normalizedName) &&
      normalizedName !== "content-type"
    ) {
      headers.set(name, value);
    }
  }
  headers.set("Content-Type", contentType);

  let upstream: Response;
  try {
    upstream = await fetcher(target, {
      method: "PUT",
      headers,
      body: bodyResult.body,
    });
  } catch {
    return errorResponse(502, "Storage request failed.");
  }

  if (!upstream.ok) {
    return errorResponse(upstream.status, "Storage rejected the upload.");
  }

  const responseHeaders = new Headers();
  const etag = upstream.headers.get("ETag");
  if (etag) responseHeaders.set("ETag", etag);
  return new Response(null, { status: upstream.status, headers: responseHeaders });
}

async function readUploadBody(request: Request): Promise<UploadBodyResult> {
  if (!request.body) return { ok: false, reason: "empty" };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let byteLength = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      byteLength += value.byteLength;
      if (byteLength > MAX_UPLOAD_BYTES) {
        await reader.cancel();
        return { ok: false, reason: "too_large" };
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  if (byteLength === 0) return { ok: false, reason: "empty" };
  const body = new ArrayBuffer(byteLength);
  const bytes = new Uint8Array(body);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { ok: true, body };
}

function isSameOrigin(request: Request) {
  const origin = request.headers.get("Origin");
  if (origin === null) return false;

  try {
    const requestURL = new URL(request.url);
    const forwardedHost = firstForwardedValue(
      request.headers.get("x-forwarded-host"),
    );
    const host =
      forwardedHost ?? request.headers.get("host") ?? requestURL.host;
    const protocol =
      firstForwardedValue(request.headers.get("x-forwarded-proto")) ??
      requestURL.protocol.slice(0, -1);
    if (!host || (protocol !== "http" && protocol !== "https")) return false;

    const originURL = new URL(origin);
    return (
      originURL.origin === origin &&
      originURL.origin === `${protocol}://${host}` &&
      originURL.username === "" &&
      originURL.password === ""
    );
  } catch {
    return false;
  }
}

function firstForwardedValue(value: string | null) {
  return value?.split(",", 1)[0]?.trim() || null;
}

function isValidR2Target(value: string) {
  try {
    const target = new URL(value);
    return (
      target.protocol === "https:" &&
      target.hostname.endsWith(R2_HOST_SUFFIX) &&
      target.port === "" &&
      target.username === "" &&
      target.password === "" &&
      target.pathname.startsWith(R2_BUCKET_PATH) &&
      target.pathname.length > R2_BUCKET_PATH.length &&
      target.searchParams.has("X-Amz-Credential") &&
      target.searchParams.has("X-Amz-Signature") &&
      target.searchParams.has("X-Amz-Expires")
    );
  } catch {
    return false;
  }
}

function errorResponse(status: number, message: string) {
  return Response.json({ message }, { status });
}
