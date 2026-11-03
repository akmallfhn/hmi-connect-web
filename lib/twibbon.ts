// Frontend-only twibbon editor: frames are static files under public/images/twibbon, nothing is stored.

// Every frame exports at this width; its height follows the frame's own aspect ratio.
export const TWIBBON_OUTPUT_WIDTH = 1080;
export const TWIBBON_MIN_ZOOM = 0.5;
export const TWIBBON_MAX_ZOOM = 4;

export type TwibbonFrame = {
  id: string;
  name: string;
  src: string;
  // The PNG's intrinsic size; a portrait or landscape frame yields a canvas of that shape.
  width: number;
  height: number;
};

// Add a frame by dropping a PNG with a transparent photo area into public/images/twibbon.
export const TWIBBON_FRAMES: TwibbonFrame[] = [
  {
    id: "kongres-1x1",
    name: "1:1 (Persegi)",
    src: "/images/twibbon/frame-kongres-1x1.png",
    width: 1080,
    height: 1080,
  },
  {
    id: "kongres-9x16",
    name: "9:16 (Story)",
    src: "/images/twibbon/frame-kongres-9x16.png",
    width: 1080,
    height: 1920,
  },
  {
    id: "kongres-3x2",
    name: "3:2 (LinkedIn)",
    src: "/images/twibbon/frame-kongres-3x2.png",
    width: 1080,
    height: 720,
  },
];

export type TwibbonSize = {
  width: number;
  height: number;
};

export function twibbonOutputSize(frame: TwibbonFrame): TwibbonSize {
  return {
    width: TWIBBON_OUTPUT_WIDTH,
    height: Math.round((TWIBBON_OUTPUT_WIDTH * frame.height) / frame.width),
  };
}

export type TwibbonTransform = {
  zoom: number;
  x: number;
  y: number;
};

export const DEFAULT_TWIBBON_TRANSFORM: TwibbonTransform = {
  zoom: 1,
  x: 0,
  y: 0,
};

// At zoom 1 the photo covers the canvas, like object-fit: cover.
function photoSize(photo: HTMLImageElement, size: TwibbonSize, zoom: number) {
  const base = Math.max(
    size.width / photo.naturalWidth,
    size.height / photo.naturalHeight,
  );
  return {
    width: photo.naturalWidth * base * zoom,
    height: photo.naturalHeight * base * zoom,
  };
}

// A photo larger than the canvas can't uncover an edge; a smaller one can't leave it.
export function clampTwibbonTransform(
  transform: TwibbonTransform,
  photo: HTMLImageElement | null,
  size: TwibbonSize,
): TwibbonTransform {
  const zoom = Math.min(
    TWIBBON_MAX_ZOOM,
    Math.max(TWIBBON_MIN_ZOOM, transform.zoom),
  );
  if (!photo) return { zoom, x: 0, y: 0 };

  const drawn = photoSize(photo, size, zoom);
  const maxX = Math.abs(drawn.width - size.width) / 2;
  const maxY = Math.abs(drawn.height - size.height) / 2;
  return {
    zoom,
    x: Math.min(maxX, Math.max(-maxX, transform.x)),
    y: Math.min(maxY, Math.max(-maxY, transform.y)),
  };
}

// The preview leaves uncovered pixels transparent so its checkerboard shows; the export fills white.
export function drawTwibbon(
  context: CanvasRenderingContext2D,
  size: TwibbonSize,
  photo: HTMLImageElement | null,
  frame: HTMLImageElement | null,
  transform: TwibbonTransform,
  fillBackground: boolean,
) {
  context.clearRect(0, 0, size.width, size.height);
  if (fillBackground) {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, size.width, size.height);
  }

  if (photo) {
    const drawn = photoSize(photo, size, transform.zoom);
    context.imageSmoothingQuality = "high";
    context.drawImage(
      photo,
      (size.width - drawn.width) / 2 + transform.x,
      (size.height - drawn.height) / 2 + transform.y,
      drawn.width,
      drawn.height,
    );
  }

  if (frame) context.drawImage(frame, 0, 0, size.width, size.height);
}

export function renderTwibbonBlob(
  size: TwibbonSize,
  photo: HTMLImageElement,
  frame: HTMLImageElement | null,
  transform: TwibbonTransform,
) {
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const context = canvas.getContext("2d");
  if (!context) return Promise.reject(new Error("Canvas tidak tersedia."));

  drawTwibbon(context, size, photo, frame, transform, true);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Gagal membuat twibbon.")),
      "image/jpeg",
      0.92,
    );
  });
}

export function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
