"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Download, Loader2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { downloadRemoteImage } from "@/lib/share-canvas";

export type PreviewImage = { id: string; url: string };

interface ImagePreviewOverlayProps {
  images: PreviewImage[];
  activeId: string | null;
  onActiveChange: (id: string) => void;
  onClose: () => void;
  // File name without extension; a gallery appends the image's position.
  downloadName: string;
}

// Full-screen image viewer shared by feed photos and profile avatars.
export default function ImagePreviewOverlay({
  images,
  activeId,
  onActiveChange,
  onClose,
  downloadName,
}: ImagePreviewOverlayProps) {
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const [downloading, setDownloading] = useState(false);
  const currentIndex = images.findIndex((image) => image.id === activeId);
  const currentImage = currentIndex >= 0 ? images[currentIndex] : null;
  const isOpen = currentImage !== null;
  const canNavigate = images.length > 1 && currentIndex >= 0;

  const moveImage = useCallback(
    (direction: -1 | 1) => {
      if (!canNavigate) return;
      const nextIndex = (currentIndex + direction + images.length) % images.length;
      onActiveChange(images[nextIndex].id);
    },
    [canNavigate, currentIndex, images, onActiveChange],
  );

  useEffect(() => {
    if (!isOpen) return;

    const scrollY = window.scrollY;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousOverflow = document.body.style.overflow;
    const previousPosition = document.body.style.position;
    const previousTop = document.body.style.top;
    const previousWidth = document.body.style.width;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousOverflow;
      document.body.style.position = previousPosition;
      document.body.style.top = previousTop;
      document.body.style.width = previousWidth;
      window.scrollTo({ top: scrollY, left: 0, behavior: "instant" });
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveImage(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        moveImage(1);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, moveImage]);

  if (!currentImage) return null;

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    const touch = event.touches[0];
    swipeStart.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    const start = swipeStart.current;
    const touch = event.changedTouches[0];
    swipeStart.current = null;
    if (!start || !touch) return;

    const horizontalDistance = touch.clientX - start.x;
    const verticalDistance = touch.clientY - start.y;
    if (
      Math.abs(horizontalDistance) < 48 ||
      Math.abs(horizontalDistance) <= Math.abs(verticalDistance)
    ) {
      return;
    }
    moveImage(horizontalDistance > 0 ? -1 : 1);
  }

  async function handleDownload() {
    if (!currentImage || downloading) return;
    setDownloading(true);
    try {
      const name = images.length > 1 ? `${downloadName}-${currentIndex + 1}` : downloadName;
      await downloadRemoteImage(currentImage.url, name);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] bg-media-backdrop/90"
      role="dialog"
      aria-modal="true"
      aria-label="Pratinjau gambar"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-zoom-out"
        onClick={onClose}
        aria-label="Tutup pratinjau gambar"
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-3 sm:p-8">
        <div
          className="pointer-events-auto relative max-h-full w-full max-w-6xl touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <Image
            src={currentImage.url}
            alt=""
            width={1600}
            height={1200}
            className="mx-auto max-h-[92vh] w-auto max-w-full object-contain"
            unoptimized
          />
        </div>
      </div>
      {canNavigate && (
        <>
          <button
            type="button"
            onClick={() => moveImage(-1)}
            className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-media-backdrop/45 text-on-dark backdrop-blur-sm transition hover:bg-on-dark/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:left-6 sm:size-11"
            aria-label="Gambar sebelumnya"
          >
            <ChevronLeft className="size-6" />
          </button>
          <button
            type="button"
            onClick={() => moveImage(1)}
            className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-media-backdrop/45 text-on-dark backdrop-blur-sm transition hover:bg-on-dark/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:right-6 sm:size-11"
            aria-label="Gambar berikutnya"
          >
            <ChevronRight className="size-6" />
          </button>
          <p className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-media-backdrop/45 px-3 py-1 text-xs font-medium text-on-dark backdrop-blur-sm">
            {currentIndex + 1} / {images.length}
          </p>
        </>
      )}
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-on-dark/10 text-on-dark transition hover:bg-on-dark/20 disabled:cursor-wait"
          aria-label="Unduh gambar"
          title="Unduh gambar"
        >
          {downloading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Download className="size-5" />
          )}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-on-dark/10 text-on-dark transition hover:bg-on-dark/20"
          aria-label="Tutup"
        >
          <X className="size-5" />
        </button>
      </div>
    </div>
  );
}
