import assert from "node:assert/strict";
import { File } from "node:buffer";
import { test } from "node:test";
import {
  ImageOptimizationError,
  optimizeImage,
  type EncodeImageInput,
  type ImageOptimizationRuntime,
} from "../lib/optimize-image";

const SIGNATURES = {
  "image/jpeg": Uint8Array.from([0xff, 0xd8, 0xff, 0xe0]),
  "image/png": Uint8Array.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]),
  "image/webp": Uint8Array.from([
    0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50,
  ]),
} as const;

function imageFile(
  name: string,
  type: keyof typeof SIGNATURES,
  size: number,
) {
  const signature = SIGNATURES[type];
  return new File([signature, new Uint8Array(size - signature.length)], name, {
    type,
  }) as unknown as globalThis.File;
}

function runtime(options: {
  width: number;
  height: number;
  transparent?: boolean;
  outputs?: Partial<Record<string, number | null>>;
}) {
  const calls: EncodeImageInput[] = [];
  let closed = false;
  const value: ImageOptimizationRuntime = {
    async decode() {
      return {
        width: options.width,
        height: options.height,
        value: {},
        close: () => {
          closed = true;
        },
      };
    },
    async hasTransparency() {
      return options.transparent ?? false;
    },
    async encode(_image, input) {
      calls.push(input);
      const size = options.outputs?.[input.mimeType];
      return typeof size === "number"
        ? new Blob([new Uint8Array(size)], { type: input.mimeType })
        : null;
    },
  };
  return { value, calls, closed: () => closed };
}

test("large JPEG is resized and selects the smaller visual-quality candidate", async () => {
  const fake = runtime({
    width: 3000,
    height: 2000,
    outputs: { "image/jpeg": 140_000, "image/webp": 110_000 },
  });
  const result = await optimizeImage(
    imageFile("large.jpg", "image/jpeg", 600_000),
    "feed_image",
    fake.value,
  );
  assert.equal(result.type, "image/webp");
  assert.equal(result.name, "large.webp");
  assert.equal(result.size, 110_000);
  assert.deepEqual(
    fake.calls.map(({ width, height }) => [width, height]),
    [
      [1920, 1280],
      [1920, 1280],
    ],
  );
  assert.equal(fake.closed(), true);
});

test("small already optimized JPEG is preserved without recompression", async () => {
  const file = imageFile("small.jpeg", "image/jpeg", 40_000);
  const fake = runtime({ width: 800, height: 600 });
  assert.equal(await optimizeImage(file, "feed_image", fake.value), file);
  assert.equal(fake.calls.length, 0);
});

test("WebP input is preserved when candidate savings are negligible", async () => {
  const file = imageFile("photo.webp", "image/webp", 200_000);
  const fake = runtime({
    width: 1200,
    height: 800,
    outputs: { "image/webp": 190_000, "image/jpeg": 210_000 },
  });
  assert.equal(await optimizeImage(file, "feed_image", fake.value), file);
});

test("an oversized original uses a valid candidate despite negligible savings", async () => {
  const file = imageFile("avatar.jpg", "image/jpeg", 2_200_000);
  const fake = runtime({
    width: 500,
    height: 500,
    outputs: { "image/webp": 2_050_000, "image/jpeg": 1_950_000 },
  });
  const result = await optimizeImage(file, "avatar", fake.value);
  assert.notEqual(result, file);
  assert.equal(result.type, "image/jpeg");
  assert.equal(result.size, 1_950_000);
});

test("transparent PNG never considers JPEG and may select WebP", async () => {
  const fake = runtime({
    width: 1600,
    height: 1600,
    transparent: true,
    outputs: { "image/webp": 90_000, "image/png": 240_000 },
  });
  const result = await optimizeImage(
    imageFile("logo.png", "image/png", 400_000),
    "avatar",
    fake.value,
  );
  assert.equal(result.type, "image/webp");
  assert.equal(result.name, "logo.webp");
  assert.deepEqual(
    fake.calls.map((call) => call.mimeType),
    ["image/webp", "image/png"],
  );
});

test("incorrect MIME signature is rejected", async () => {
  const pngBytes = imageFile("fake.jpg", "image/png", 200_000);
  const file = new File([new Uint8Array(await pngBytes.arrayBuffer())], "fake.jpg", {
    type: "image/jpeg",
  }) as unknown as globalThis.File;
  await assert.rejects(
    optimizeImage(file, "feed_image", runtime({ width: 10, height: 10 }).value),
    ImageOptimizationError,
  );
});

test("compression failure is surfaced when resize is required", async () => {
  const fake = runtime({ width: 4000, height: 3000, outputs: {} });
  await assert.rejects(
    optimizeImage(
      imageFile("large.jpg", "image/jpeg", 200_000),
      "avatar",
      fake.value,
    ),
    /tidak dapat mengoptimalkan/,
  );
});
