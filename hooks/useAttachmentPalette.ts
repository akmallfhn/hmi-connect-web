"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_ATTACHMENT_COLOR,
  isAttachmentPaletteColor,
} from "@/lib/attachment-palette";

const colorRequests = new Map<string, Promise<string>>();

function requestColor(imageUrl: string) {
  const cached = colorRequests.get(imageUrl);
  if (cached) return cached;

  const request = fetch(
    `/api/attachment-palette?url=${encodeURIComponent(imageUrl)}`,
  )
    .then(async (response) => {
      if (!response.ok) return DEFAULT_ATTACHMENT_COLOR;
      const data: unknown = await response.json();
      if (typeof data !== "object" || data === null || !("color" in data)) {
        return DEFAULT_ATTACHMENT_COLOR;
      }
      return isAttachmentPaletteColor(data.color)
        ? data.color
        : DEFAULT_ATTACHMENT_COLOR;
    })
    .catch(() => DEFAULT_ATTACHMENT_COLOR);

  if (colorRequests.size >= 200) {
    const oldest = colorRequests.keys().next().value;
    if (oldest) colorRequests.delete(oldest);
  }
  colorRequests.set(imageUrl, request);
  return request;
}

export function useAttachmentPalette(imageUrl: string | null) {
  const [result, setResult] = useState<{
    imageUrl: string;
    color: string;
  } | null>(null);

  useEffect(() => {
    if (!imageUrl) return;
    let active = true;
    void requestColor(imageUrl).then((selected) => {
      if (active) setResult({ imageUrl, color: selected });
    });
    return () => {
      active = false;
    };
  }, [imageUrl]);

  return imageUrl && result?.imageUrl === imageUrl
    ? result.color
    : DEFAULT_ATTACHMENT_COLOR;
}
