"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  FeedArticleAttachment,
  FeedAttachment,
  FeedNewsAttachment,
  FeedTrainingAttachment,
  FeedUploadAttachment,
} from "@/apis/feeds";
import { parseYouTubeId } from "@/lib/youtube";
import ArticleAttachmentCard from "./ArticleAttachmentCard";
import AutoplayVideo from "./AutoplayVideo";
import LinkPreviewCard from "./LinkPreviewCard";
import NewsAttachmentCard from "./NewsAttachmentCard";
import TrainingAttachmentCard from "./TrainingAttachmentCard";
import YouTubeEmbed from "./YouTubeEmbed";

function PhotoGrid({
  photos: unsorted,
  onPreview,
}: {
  photos: FeedUploadAttachment[];
  onPreview: (photo: FeedUploadAttachment) => void;
}) {
  const photos = [...unsorted].sort(
    (a, b) => a.reference_index - b.reference_index,
  );

  if (photos.length === 1) {
    return (
      <button
        type="button"
        onClick={() => onPreview(photos[0])}
        className="relative mt-3 aspect-video w-full cursor-zoom-in overflow-hidden rounded-xl bg-surface-muted"
        aria-label="Buka pratinjau gambar"
      >
        <Image
          src={photos[0].reference_url}
          alt=""
          fill
          className="object-cover"
          unoptimized
        />
      </button>
    );
  }

  return (
    <div className="mt-3 flex h-72 snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain [scrollbar-width:none] sm:h-80 lg:h-96 [&::-webkit-scrollbar]:hidden">
      {photos.map((photo, index) => (
        <ScrollablePhoto
          key={photo.id}
          photo={photo}
          index={index}
          total={photos.length}
          onPreview={onPreview}
        />
      ))}
    </div>
  );
}

function ScrollablePhoto({
  photo,
  index,
  total,
  onPreview,
}: {
  photo: FeedUploadAttachment;
  index: number;
  total: number;
  onPreview: (photo: FeedUploadAttachment) => void;
}) {
  const [aspectRatio, setAspectRatio] = useState(4 / 5);

  return (
    <button
      type="button"
      onClick={() => onPreview(photo)}
      style={{ aspectRatio }}
      className="relative h-full shrink-0 snap-start overflow-hidden rounded-xl bg-surface-muted"
      aria-label={`Buka pratinjau gambar ${index + 1} dari ${total}`}
    >
      <Image
        src={photo.reference_url}
        alt=""
        fill
        className="object-cover"
        onLoad={(event) => {
          const { naturalHeight, naturalWidth } = event.currentTarget;
          if (naturalWidth && naturalHeight) {
            setAspectRatio(naturalWidth / naturalHeight);
          }
        }}
        unoptimized
      />
    </button>
  );
}

function ImagePreviewModal({
  photo,
  photos,
  onPhotoChange,
  onClose,
}: {
  photo: FeedUploadAttachment | null;
  photos: FeedUploadAttachment[];
  onPhotoChange: (photo: FeedUploadAttachment) => void;
  onClose: () => void;
}) {
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const isOpen = photo !== null;
  const orderedPhotos = useMemo(
    () =>
      [...photos].sort((a, b) => a.reference_index - b.reference_index),
    [photos],
  );
  const currentIndex = photo
    ? orderedPhotos.findIndex((item) => item.id === photo.id)
    : -1;
  const currentPhoto =
    currentIndex >= 0 ? orderedPhotos[currentIndex] : photo;
  const canNavigate = orderedPhotos.length > 1 && currentIndex >= 0;

  const movePhoto = useCallback(
    (direction: -1 | 1) => {
      if (!canNavigate) return;
      const nextIndex =
        (currentIndex + direction + orderedPhotos.length) % orderedPhotos.length;
      onPhotoChange(orderedPhotos[nextIndex]);
    },
    [canNavigate, currentIndex, onPhotoChange, orderedPhotos],
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
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        movePhoto(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        movePhoto(1);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, movePhoto]);

  if (!currentPhoto) return null;

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
    movePhoto(horizontalDistance > 0 ? -1 : 1);
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
            src={currentPhoto.reference_url}
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
            onClick={() => movePhoto(-1)}
            className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-media-backdrop/45 text-on-dark backdrop-blur-sm transition hover:bg-on-dark/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:left-6 sm:size-11"
            aria-label="Gambar sebelumnya"
          >
            <ChevronLeft className="size-6" />
          </button>
          <button
            type="button"
            onClick={() => movePhoto(1)}
            className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-media-backdrop/45 text-on-dark backdrop-blur-sm transition hover:bg-on-dark/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:right-6 sm:size-11"
            aria-label="Gambar berikutnya"
          >
            <ChevronRight className="size-6" />
          </button>
          <p className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-media-backdrop/45 px-3 py-1 text-xs font-medium text-on-dark backdrop-blur-sm">
            {currentIndex + 1} / {orderedPhotos.length}
          </p>
        </>
      )}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-on-dark/10 text-on-dark transition hover:bg-on-dark/20"
        aria-label="Tutup"
      >
        <X className="size-5" />
      </button>
    </div>
  );
}

interface FeedAttachmentsProps {
  attachments?: FeedAttachment[];
  isSignedIn: boolean;
  showTrainingReminder?: boolean;
}

export default function FeedAttachments({
  attachments = [],
  isSignedIn,
  showTrainingReminder = true,
}: FeedAttachmentsProps) {
  const [previewPhoto, setPreviewPhoto] = useState<FeedUploadAttachment | null>(
    null,
  );
  const photoAttachments = attachments.filter(
    (item): item is FeedUploadAttachment => item.type === "photo",
  );
  const videoAttachment = attachments.find(
    (item): item is FeedUploadAttachment => item.type === "video",
  );
  const videoYouTubeId = videoAttachment
    ? parseYouTubeId(videoAttachment.reference_url)
    : null;
  const urlAttachment = attachments.find(
    (item): item is FeedUploadAttachment => item.type === "url",
  );
  const newsAttachment = attachments.find(
    (item): item is FeedNewsAttachment => item.type === "news",
  );
  const trainingAttachment = attachments.find(
    (item): item is FeedTrainingAttachment => item.type === "training",
  );
  const articleAttachment = attachments.find(
    (item): item is FeedArticleAttachment => item.type === "article",
  );

  return (
    <>
      {photoAttachments.length > 0 && (
        <PhotoGrid photos={photoAttachments} onPreview={setPreviewPhoto} />
      )}
      {videoAttachment &&
        (videoYouTubeId ? (
          <YouTubeEmbed
            videoId={videoYouTubeId}
            className="mt-3"
            autoPlayInView
          />
        ) : (
          <AutoplayVideo
            src={videoAttachment.reference_url}
            className="mt-3 w-full rounded-xl bg-media-backdrop"
          />
        ))}
      {urlAttachment && <LinkPreviewCard url={urlAttachment.reference_url} />}
      {newsAttachment && <NewsAttachmentCard attachment={newsAttachment} />}
      {articleAttachment && (
        <ArticleAttachmentCard attachment={articleAttachment} />
      )}
      {trainingAttachment && (
        <TrainingAttachmentCard
          attachment={trainingAttachment}
          isSignedIn={isSignedIn}
          showReminder={showTrainingReminder}
        />
      )}
      <ImagePreviewModal
        photo={previewPhoto}
        photos={photoAttachments}
        onPhotoChange={setPreviewPhoto}
        onClose={() => setPreviewPhoto(null)}
      />
    </>
  );
}
