import assert from "node:assert/strict";
import { test } from "node:test";
import { proxyMediaUpload } from "../lib/media-upload-edge";
import { MEDIA_UPLOAD_TARGET_HEADER } from "../lib/media-upload-transport";

const target =
  "https://0123456789abcdef0123456789abcdef.r2.cloudflarestorage.com/hmi-connect/avatars/user/file.jpg?X-Amz-Credential=test&X-Amz-Signature=test&X-Amz-Expires=300";

test("same-origin upload edge forwards bytes and safe headers", async () => {
  let forwardedURL = "";
  let forwardedInit: RequestInit | undefined;
  const request = new Request("https://hmiconnect.id/api/media/upload-edge", {
    method: "PUT",
    headers: {
      Origin: "https://hmiconnect.id",
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=3600",
      "X-Amz-Meta-Asset-Id": "asset-1",
      "X-Untrusted-Header": "must-not-forward",
      [MEDIA_UPLOAD_TARGET_HEADER]: target,
    },
    body: new Uint8Array([1, 2, 3]),
  });

  const response = await proxyMediaUpload(request, async (input, init) => {
    forwardedURL = String(input);
    forwardedInit = init;
    return new Response(null, { status: 200, headers: { ETag: '"etag"' } });
  });

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("ETag"), '"etag"');
  assert.equal(forwardedURL, target);
  assert.equal(forwardedInit?.method, "PUT");
  const forwardedHeaders = new Headers(forwardedInit?.headers);
  assert.equal(forwardedHeaders.get("Content-Type"), "image/jpeg");
  assert.equal(forwardedHeaders.get("Cache-Control"), "public, max-age=3600");
  assert.equal(forwardedHeaders.get("X-Amz-Meta-Asset-Id"), "asset-1");
  assert.equal(forwardedHeaders.has("X-Untrusted-Header"), false);
  assert.deepEqual(
    new Uint8Array(forwardedInit?.body as ArrayBuffer),
    new Uint8Array([1, 2, 3]),
  );
});

test("upload edge rejects oversized bodies without Content-Length", async () => {
  let calls = 0;
  const request = new Request("https://hmiconnect.id/api/media/upload-edge", {
    method: "PUT",
    headers: {
      Origin: "https://hmiconnect.id",
      "Content-Type": "image/jpeg",
      [MEDIA_UPLOAD_TARGET_HEADER]: target,
    },
    body: new Uint8Array(10 * 1024 * 1024 + 1),
  });

  const response = await proxyMediaUpload(request, async () => {
    calls += 1;
    return new Response(null, { status: 200 });
  });

  assert.equal(response.status, 413);
  assert.equal(calls, 0);
});

test("upload edge rejects cross-origin and invalid storage targets", async () => {
  let calls = 0;
  const fetcher = async () => {
    calls += 1;
    return new Response(null, { status: 200 });
  };

  const crossOrigin = await proxyMediaUpload(
    new Request("https://hmiconnect.id/api/media/upload-edge", {
      method: "PUT",
      headers: {
        Origin: "https://attacker.example",
        "Content-Type": "image/jpeg",
        [MEDIA_UPLOAD_TARGET_HEADER]: target,
      },
      body: new Uint8Array([1]),
    }),
    fetcher,
  );
  assert.equal(crossOrigin.status, 403);

  const malformedOrigin = await proxyMediaUpload(
    new Request("https://hmiconnect.id/api/media/upload-edge", {
      method: "PUT",
      headers: {
        Origin: "https://hmiconnect.id/attacker-path",
        "Content-Type": "image/jpeg",
        [MEDIA_UPLOAD_TARGET_HEADER]: target,
      },
      body: new Uint8Array([1]),
    }),
    fetcher,
  );
  assert.equal(malformedOrigin.status, 403);

  const invalidTarget = await proxyMediaUpload(
    new Request("https://hmiconnect.id/api/media/upload-edge", {
      method: "PUT",
      headers: {
        Origin: "https://hmiconnect.id",
        "Content-Type": "image/jpeg",
        [MEDIA_UPLOAD_TARGET_HEADER]: "https://example.com/upload",
      },
      body: new Uint8Array([1]),
    }),
    fetcher,
  );
  assert.equal(invalidTarget.status, 400);
  assert.equal(calls, 0);
});

test("upload edge validates origin against forwarded public host", async () => {
  const request = new Request(
    "http://railway-internal:3000/api/media/upload-edge",
    {
      method: "PUT",
      headers: {
        Origin: "https://www.hmiconnect.id",
        "x-forwarded-host": "www.hmiconnect.id",
        "x-forwarded-proto": "https",
        Host: "railway-internal:3000",
        "Content-Type": "image/jpeg",
        [MEDIA_UPLOAD_TARGET_HEADER]: target,
      },
      body: new Uint8Array([1]),
    },
  );

  const response = await proxyMediaUpload(
    request,
    async () => new Response(null, { status: 200 }),
  );

  assert.equal(response.status, 200);
});

test("upload edge preserves storage rejection status", async () => {
  const request = new Request("https://admin.hmiconnect.id/api/media/upload-edge", {
    method: "PUT",
    headers: {
      Origin: "https://admin.hmiconnect.id",
      "Content-Type": "image/png",
      [MEDIA_UPLOAD_TARGET_HEADER]: target,
    },
    body: new Uint8Array([1]),
  });
  const response = await proxyMediaUpload(
    request,
    async () => new Response(null, { status: 403 }),
  );
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { message: "Storage rejected the upload." });
});

test("upload edge accepts only the configured Supabase S3 project", async () => {
  const previousURL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://projectref.supabase.co";
  try {
    const validTarget =
      "https://projectref.storage.supabase.co/storage/v1/s3/hmi-connect/avatars/user/file.jpg?X-Amz-Credential=test&X-Amz-Signature=test&X-Amz-Expires=300";
    let forwardedURL = "";
    const valid = await proxyMediaUpload(
      new Request("https://hmiconnect.id/api/media/upload-edge", {
        method: "PUT",
        headers: {
          Origin: "https://hmiconnect.id",
          "Content-Type": "image/jpeg",
          [MEDIA_UPLOAD_TARGET_HEADER]: validTarget,
        },
        body: new Uint8Array([1]),
      }),
      async (input) => {
        forwardedURL = String(input);
        return new Response(null, { status: 200 });
      },
    );
    assert.equal(valid.status, 200);
    assert.equal(forwardedURL, validTarget);

    const lookalike = await proxyMediaUpload(
      new Request("https://hmiconnect.id/api/media/upload-edge", {
        method: "PUT",
        headers: {
          Origin: "https://hmiconnect.id",
          "Content-Type": "image/jpeg",
          [MEDIA_UPLOAD_TARGET_HEADER]: validTarget.replace(
            "projectref.storage.supabase.co",
            "other-project.storage.supabase.co",
          ),
        },
        body: new Uint8Array([1]),
      }),
      async () => new Response(null, { status: 200 }),
    );
    assert.equal(lookalike.status, 400);
  } finally {
    if (previousURL === undefined) {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    } else {
      process.env.NEXT_PUBLIC_SUPABASE_URL = previousURL;
    }
  }
});
