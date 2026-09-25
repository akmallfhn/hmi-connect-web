// Canvas and file-share helpers shared by every downloadable share card.

export function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + width, y, safeRadius);
  context.closePath();
}

export function coverImage(
  context: CanvasRenderingContext2D,
  image: CanvasImageSource & { width: number; height: number },
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  context.drawImage(
    image,
    x + (width - drawWidth) / 2,
    y + (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}

export function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

export function truncateText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  let nextText = text;
  while (
    context.measureText(nextText).width > maxWidth &&
    nextText.length > 4
  ) {
    nextText = `${nextText.slice(0, -4)}...`;
  }
  return nextText;
}

// Word-wraps into at most maxLines, ellipsizing the last line when the text runs over.
export function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
) {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (let index = 0; index < words.length; index++) {
    const candidate = current ? `${current} ${words[index]}` : words[index];
    if (context.measureText(candidate).width <= maxWidth || !current) {
      current = candidate;
      continue;
    }

    lines.push(current);
    current = words[index];
    if (lines.length === maxLines) {
      current = "";
      const rest = [lines.pop(), ...words.slice(index)].join(" ");
      lines.push(truncateText(context, `${rest}...`, maxWidth));
      break;
    }
  }

  if (current) lines.push(truncateText(context, current, maxWidth));
  return lines;
}

export function fontFromVariable(
  variable: string,
  size: number,
  weight: number,
) {
  const fontFamily = getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();

  return `${weight} ${size}px ${fontFamily || "Arial, sans-serif"}`;
}

export async function loadCanvasFonts(fonts: string[]) {
  if (!document.fonts) return;
  await Promise.allSettled(fonts.map((font) => document.fonts.load(font)));
  await document.fonts.ready;
}

export function canvasToPngBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Gagal membuat gambar."));
    }, "image/png");
  });
}

export function canShareImageFile(file: File) {
  const nav = navigator as Omit<Navigator, "share"> & {
    canShare?: (data: ShareData) => boolean;
    share?: (data?: ShareData) => Promise<void>;
  };

  return Boolean(nav.share && nav.canShare?.({ files: [file] }));
}

export function isIOSBrowser() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

// iOS ignores Blob URL downloads, so there the share sheet's Save Image is the download.
export async function downloadImageBlob(
  blob: Blob,
  fileName: string,
  shareTitle: string,
) {
  const file = new File([blob], fileName, { type: "image/png" });
  if (isIOSBrowser() && canShareImageFile(file)) {
    await navigator.share({ title: shareTitle, files: [file] });
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
