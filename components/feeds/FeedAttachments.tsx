"use client";

import Image from "next/image";
import ImagePreviewOverlay from "../modals/ImagePreviewOverlay";
import { useState } from "react";
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
  const [previewPhotoId, setPreviewPhotoId] = useState<string | null>(null);
  const photoAttachments = attachments.filter(
    (item): item is FeedUploadAttachment => item.type === "photo",
  );
  const previewImages = [...photoAttachments]
    .sort((a, b) => a.reference_index - b.reference_index)
    .map((photo) => ({ id: photo.id, url: photo.reference_url }));
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
        <PhotoGrid
          photos={photoAttachments}
          onPreview={(photo) => setPreviewPhotoId(photo.id)}
        />
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
      <ImagePreviewOverlay
        images={previewImages}
        activeId={previewPhotoId}
        onActiveChange={setPreviewPhotoId}
        onClose={() => setPreviewPhotoId(null)}
        downloadName={"hmi-connect-foto"}
      />
    </>
  );
}
