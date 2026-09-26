"use client";

import { useRef } from "react";
import { prefersReducedMotion, useInViewport } from "@/hooks/useInViewport";

// For feeds posted back when videos were uploaded files rather than YouTube links.
export default function AutoplayVideo({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useInViewport(videoRef, (visible) => {
    const video = videoRef.current;
    if (!video || prefersReducedMotion()) return;
    if (visible) void video.play().catch(() => {});
    else video.pause();
  });

  return (
    <video
      ref={videoRef}
      src={src}
      controls
      muted
      playsInline
      preload="metadata"
      className={className}
    />
  );
}
