import assert from "node:assert/strict";
import { File } from "node:buffer";
import { test } from "node:test";
import {
  MediaUploadError,
  uploadMediaFileWithDependencies,
} from "../lib/media-upload-core";
import {
  MEDIA_UPLOAD_EDGE_PATH,
  MEDIA_UPLOAD_TARGET_HEADER,
} from "../lib/media-upload-transport";

test("direct upload presigns the final file and sends every signed header", async () => {
  const file = new File([new Uint8Array(123)], "optimized.webp", {
    type: "image/webp",
  }) as unknown as globalThis.File;
  let requestPayload: unknown;
  let uploadInput: RequestInfo | URL | undefined;
  let uploadInit: RequestInit | undefined;
  const result = await uploadMediaFileWithDependencies(file, "feed_image", {
    async presign(payload) {
      requestPayload = payload;
      return {
        status: "CREATED",
        data: {
          asset_id: "asset-1",
          upload_url: "https://r2.example/signed",
          required_headers: {
            "Content-Type": "image/webp",
            "X-Amz-Meta-Asset-Id": "asset-1",
          },
          expires_at: new Date().toISOString(),
        },
      };
    },
    async confirm(assetId) {
      assert.equal(assetId, "asset-1");
      return {
        status: "OK",
        data: { asset_id: assetId, public_url: "https://cdn.example/file.webp" },
      };
    },
    async remove() {
      return { status: "OK" };
    },
    async fetcher(input, init) {
      uploadInput = input;
      uploadInit = init;
      return new Response(null, { status: 200 });
    },
  });

  assert.deepEqual(requestPayload, {
    filename: "optimized.webp",
    contentType: "image/webp",
    size: 123,
    category: "feed_image",
  });
  assert.equal(uploadInit?.method, "PUT");
  assert.equal(uploadInit?.body, file);
  assert.equal(uploadInput, MEDIA_UPLOAD_EDGE_PATH);
  assert.equal(
    new Headers(uploadInit?.headers).get(MEDIA_UPLOAD_TARGET_HEADER),
    "https://r2.example/signed",
  );
  assert.equal(
    new Headers(uploadInit?.headers).get("X-Amz-Meta-Asset-Id"),
    "asset-1",
  );
  assert.deepEqual(result, {
    assetId: "asset-1",
    publicUrl: "https://cdn.example/file.webp",
  });
});

test("legacy gateway response is normalized to the same-origin upload route", async () => {
  const file = new File([new Uint8Array(4)], "avatar.jpg", {
    type: "image/jpeg",
  }) as unknown as globalThis.File;
  let uploadHeaders = new Headers();

  await uploadMediaFileWithDependencies(file, "avatar", {
    async presign() {
      return {
        status: "CREATED",
        data: {
          asset_id: "asset-legacy",
          upload_url: "https://upload.hmiconnect.id",
          required_headers: {
            "Content-Type": "image/jpeg",
            "X-R2-Upload-URL": "https://account.r2.cloudflarestorage.com/hmi-connect/avatars/file.jpg?signed=1",
          },
          expires_at: new Date().toISOString(),
        },
      };
    },
    async confirm(assetId) {
      return { status: "OK", data: { asset_id: assetId } };
    },
    async remove() {
      return { status: "OK" };
    },
    async fetcher(input, init) {
      assert.equal(input, MEDIA_UPLOAD_EDGE_PATH);
      uploadHeaders = new Headers(init?.headers);
      return new Response(null, { status: 200 });
    },
  });

  assert.equal(
    uploadHeaders.get(MEDIA_UPLOAD_TARGET_HEADER),
    "https://account.r2.cloudflarestorage.com/hmi-connect/avatars/file.jpg?signed=1",
  );
  assert.equal(uploadHeaders.has("X-R2-Upload-URL"), false);
});

test("failed direct upload cleans up pending metadata", async () => {
  const file = new File([new Uint8Array(1)], "avatar.jpg", {
    type: "image/jpeg",
  }) as unknown as globalThis.File;
  const removed: string[] = [];
  let uploadAttempts = 0;
  await assert.rejects(
    uploadMediaFileWithDependencies(file, "avatar", {
      async presign() {
        return {
          status: "CREATED",
          data: {
            asset_id: "asset-2",
            upload_url: "https://r2.example/signed",
            required_headers: {},
            expires_at: new Date().toISOString(),
          },
        };
      },
      async confirm() {
        throw new Error("should not confirm");
      },
      async remove(assetId) {
        removed.push(assetId);
        return { status: "OK" };
      },
      async fetcher() {
        uploadAttempts += 1;
        return Response.json(
          { message: "Upload origin is not allowed." },
          { status: 403 },
        );
      },
    }),
    (error: unknown) => {
      assert.ok(error instanceof MediaUploadError);
      assert.equal(
        error.message,
        "Upload media gagal (403): Upload origin is not allowed.",
      );
      return true;
    },
  );
  assert.deepEqual(removed, ["asset-2"]);
  assert.equal(uploadAttempts, 1);
});

test("network failure retries before confirming and does not clean up", async () => {
  const file = new File([new Uint8Array(10)], "avatar.jpg", {
    type: "image/jpeg",
  }) as unknown as globalThis.File;
  let uploadAttempts = 0;
  let confirmAttempts = 0;
  let removeAttempts = 0;
  const retryDelays: number[] = [];

  const result = await uploadMediaFileWithDependencies(file, "avatar", {
    async presign() {
      return {
        status: "CREATED",
        data: {
          asset_id: "asset-3",
          upload_url: "https://r2.example/signed",
          required_headers: { "Content-Type": "image/jpeg" },
          expires_at: new Date().toISOString(),
        },
      };
    },
    async confirm(assetId) {
      confirmAttempts += 1;
      return {
        status: "OK",
        data: {
          asset_id: assetId,
          public_url: "https://cdn.example/avatar.jpg",
        },
      };
    },
    async remove() {
      removeAttempts += 1;
      return { status: "OK" };
    },
    async fetcher() {
      uploadAttempts += 1;
      if (uploadAttempts < 3) throw new TypeError("Failed to fetch");
      return new Response(null, { status: 200 });
    },
    async wait(milliseconds) {
      retryDelays.push(milliseconds);
    },
  });

  assert.equal(uploadAttempts, 3);
  assert.deepEqual(retryDelays, [500, 1500]);
  assert.equal(confirmAttempts, 1);
  assert.equal(removeAttempts, 0);
  assert.equal(result.assetId, "asset-3");
});

test("ambiguous network failure recovers when R2 already stored the object", async () => {
  const file = new File([new Uint8Array(10)], "avatar.jpg", {
    type: "image/jpeg",
  }) as unknown as globalThis.File;
  let uploadAttempts = 0;
  let removeAttempts = 0;

  const result = await uploadMediaFileWithDependencies(file, "avatar", {
    async presign() {
      return {
        status: "CREATED",
        data: {
          asset_id: "asset-4",
          upload_url: "https://r2.example/signed",
          required_headers: {},
          expires_at: new Date().toISOString(),
        },
      };
    },
    async confirm(assetId) {
      return {
        status: "OK",
        data: {
          asset_id: assetId,
          public_url: "https://cdn.example/avatar.jpg",
        },
      };
    },
    async remove() {
      removeAttempts += 1;
      return { status: "OK" };
    },
    async fetcher() {
      uploadAttempts += 1;
      throw new TypeError("Failed to fetch");
    },
    async wait() {},
  });

  assert.equal(uploadAttempts, 4);
  assert.equal(removeAttempts, 0);
  assert.deepEqual(result, {
    assetId: "asset-4",
    publicUrl: "https://cdn.example/avatar.jpg",
  });
});

test("failed R2 upload switches the same asset id to Supabase", async () => {
  const file = new File([new Uint8Array(10)], "avatar.jpg", {
    type: "image/jpeg",
  }) as unknown as globalThis.File;
  let uploadAttempts = 0;
  let confirmAttempts = 0;
  let fallbackAssetId = "";
  let removeAttempts = 0;

  const result = await uploadMediaFileWithDependencies(file, "avatar", {
    async presign() {
      return {
        status: "CREATED",
        data: {
          asset_id: "asset-fallback",
          upload_url: "https://r2.example/signed",
          required_headers: {},
          expires_at: new Date().toISOString(),
        },
      };
    },
    async fallback(assetId) {
      fallbackAssetId = assetId;
      return {
        status: "OK",
        data: {
          asset_id: assetId,
          upload_url: "https://project.storage.supabase.co/storage/v1/s3/hmi-connect/avatars/file.jpg?signed=1",
          required_headers: { "Content-Type": "image/jpeg" },
          expires_at: new Date().toISOString(),
        },
      };
    },
    async confirm(assetId) {
      confirmAttempts += 1;
      if (confirmAttempts === 1) return { status: "NOT_FOUND" };
      return {
        status: "OK",
        data: {
          asset_id: assetId,
          public_url:
            "https://project.supabase.co/storage/v1/object/public/hmi-connect/avatars/file.jpg",
        },
      };
    },
    async remove() {
      removeAttempts += 1;
      return { status: "OK" };
    },
    async fetcher(_input, init) {
      uploadAttempts += 1;
      const target = new Headers(init?.headers).get(
        MEDIA_UPLOAD_TARGET_HEADER,
      );
      if (target?.includes("storage.supabase.co")) {
        return new Response(null, { status: 200 });
      }
      throw new TypeError("Failed to fetch");
    },
    async wait() {},
  });

  assert.equal(uploadAttempts, 5);
  assert.equal(confirmAttempts, 2);
  assert.equal(fallbackAssetId, "asset-fallback");
  assert.equal(removeAttempts, 0);
  assert.deepEqual(result, {
    assetId: "asset-fallback",
    publicUrl:
      "https://project.supabase.co/storage/v1/object/public/hmi-connect/avatars/file.jpg",
  });
});
