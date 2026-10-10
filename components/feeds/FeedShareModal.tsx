"use client";

import { IconDownload, IconLink, IconShare3 } from "@tabler/icons-react";
import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { LinkPreview } from "@/app/(www)/www/api/link-preview/route";
import type {
  Feed,
  FeedArticleAttachment,
  FeedAttachment,
  FeedNewsAttachment,
  FeedTrainingAttachment,
  FeedUploadAttachment,
} from "@/apis/feeds";
import Button from "@/components/buttons/Button";
import { getInitials } from "@/components/common/Avatar";
import { DesktopAction } from "@/components/common/UserShareModal";
import Modal from "@/components/modals/Modal";
import { SHARE_PLATFORMS } from "@/components/modals/ShareModal";
import { requestAttachmentColor } from "@/hooks/useAttachmentPalette";
import { DEFAULT_ATTACHMENT_COLOR } from "@/lib/attachment-palette";
import { socialIconUrl } from "@/lib/constants";
import { resolveFeedAuthor } from "@/lib/feed-author";
import {
  canShareImageFile,
  canvasToPngBlob,
  coverImage,
  downloadImageBlob,
  fontFromVariable,
  loadCanvasFonts,
  loadImage,
  roundRect,
  truncateText,
  wrapText,
} from "@/lib/share-canvas";
import { formatDateRange } from "@/lib/time-manipulation";
import { parseYouTubeId } from "@/lib/youtube";

const WIDTH = 720;
const HEIGHT = 1280;
const CARD_X = 76;
const CARD_WIDTH = WIDTH - CARD_X * 2;
const CARD_RADIUS = 24;
const BORDER = 1.5;
const PADDING = 28;
const MEDIA_WIDTH = CARD_WIDTH - PADDING * 2;
const MEDIA_RADIUS = 14;
const FOOTER_HEIGHT = 66;
const TEXT = "#f5f5f6";
const MUTED = "#aaaab0";
const DIVIDER = "rgba(255,255,255,0.1)";
const PRIMARY = "#159fa2";

type FeedShareModalProps = {
  open: boolean;
  onClose: () => void;
  feed: Feed;
  content: string;
  url: string;
};

type Ctx = CanvasRenderingContext2D;

// Everything async is loaded up front so the card height is known before anything is drawn.
type PreparedAttachment = {
  height: number;
  draw: (context: Ctx, x: number, y: number) => void;
};

function uiFont(size: number, weight: number) {
  return fontFromVariable("--font-google-sans", size, weight);
}

function headlineFont(size: number, weight: number) {
  return fontFromVariable("--font-stack-sans-headline", size, weight);
}

async function optionalImage(src?: string | null) {
  if (!src) return null;
  try {
    return await loadImage(src);
  } catch {
    return null;
  }
}

// Older feeds can contain an uploaded video. Capture a frame when CORS permits it.
async function uploadedVideoFrame(src: string): Promise<HTMLVideoElement | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    let finished = false;
    const finish = (value: HTMLVideoElement | null) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      video.onloadeddata = null;
      video.onseeked = null;
      video.onerror = null;
      resolve(value);
    };
    const timeout = window.setTimeout(() => finish(null), 5000);
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.preload = "auto";
    video.onloadeddata = () => {
      if (video.duration > 0.2) {
        video.onseeked = () => finish(video);
        video.currentTime = Math.min(0.5, video.duration / 2);
      } else {
        finish(video);
      }
    };
    video.onerror = () => finish(null);
    video.src = src;
  });
}

function drawPlay(context: Ctx, x: number, y: number) {
  context.beginPath();
  context.arc(x, y, 38, 0, Math.PI * 2);
  context.fillStyle = "rgba(0, 0, 0, 0.7)";
  context.fill();
  context.beginPath();
  context.moveTo(x - 10, y - 16);
  context.lineTo(x + 17, y);
  context.lineTo(x - 10, y + 16);
  context.closePath();
  context.fillStyle = "#ffffff";
  context.fill();
}

function drawLines(context: Ctx, lines: string[], x: number, y: number, lineHeight: number) {
  context.textBaseline = "top";
  context.textAlign = "left";
  lines.forEach((line, index) => context.fillText(line, x, y + index * lineHeight));
}

function drawCircleImage(
  context: Ctx,
  image: HTMLImageElement | null,
  name: string,
  x: number,
  y: number,
  size: number,
  background: string,
) {
  context.save();
  context.beginPath();
  context.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  context.clip();
  context.fillStyle = image ? background : "#d7eeee";
  context.fillRect(x, y, size, size);
  if (image) {
    coverImage(context, image, x, y, size, size);
  } else {
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = uiFont(Math.round(size * 0.4), 700);
    context.fillStyle = PRIMARY;
    context.fillText(getInitials(name), x + size / 2, y + size / 2);
  }
  context.restore();
}

function mediaFor(feed: Feed): FeedAttachment | null {
  const attachments = [...(feed.attachments ?? [])].sort(
    (a, b) => a.reference_index - b.reference_index,
  );
  return attachments.find((item) => item.type === "photo") ??
    attachments.find((item) => item.type === "video") ??
    attachments.find((item) => item.type !== "url") ??
    attachments[0] ?? null;
}

function deletedStrip(label: string): PreparedAttachment {
  return {
    height: 60,
    draw(context, x, y) {
      roundRect(context, x, y, MEDIA_WIDTH, 60, MEDIA_RADIUS);
      context.fillStyle = "#303034";
      context.fill();
      context.fillStyle = MUTED;
      context.font = uiFont(17, 400);
      context.textAlign = "left";
      context.textBaseline = "middle";
      context.fillText(label, x + 18, y + 30);
    },
  };
}

async function preparePhotoOrVideo(feed: Feed, attachment: FeedUploadAttachment): Promise<PreparedAttachment> {
  const height = 360;
  let image: HTMLImageElement | HTMLVideoElement | null = null;
  let second: HTMLImageElement | null = null;
  const photos = feed.attachments?.filter((item): item is FeedUploadAttachment => item.type === "photo")
    .sort((a, b) => a.reference_index - b.reference_index) ?? [];

  if (attachment.type === "photo") {
    [image, second] = await Promise.all([
      optionalImage(attachment.reference_url),
      photos.length > 1 ? optionalImage(photos[1].reference_url) : Promise.resolve(null),
    ]);
  } else {
    const youtubeId = parseYouTubeId(attachment.reference_url);
    image = youtubeId
      ? await optionalImage(`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`)
      : await uploadedVideoFrame(attachment.reference_url);
  }

  return {
    height,
    draw(context, x, y) {
      roundRect(context, x, y, MEDIA_WIDTH, height, MEDIA_RADIUS);
      context.save();
      context.clip();
      context.fillStyle = "#303034";
      context.fillRect(x, y, MEDIA_WIDTH, height);
      try {
        if (image instanceof HTMLVideoElement) {
          const scale = Math.max(MEDIA_WIDTH / image.videoWidth, height / image.videoHeight);
          const drawWidth = image.videoWidth * scale;
          const drawHeight = image.videoHeight * scale;
          context.drawImage(image, x + (MEDIA_WIDTH - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
        } else if (image && second) {
          const firstWidth = Math.round(MEDIA_WIDTH * 0.66);
          const secondX = x + firstWidth + 8;
          context.save();
          context.beginPath();
          context.rect(x, y, firstWidth, height);
          context.clip();
          coverImage(context, image, x, y, firstWidth, height);
          context.restore();
          context.save();
          context.beginPath();
          context.rect(secondX, y, MEDIA_WIDTH - firstWidth - 8, height);
          context.clip();
          coverImage(context, second, secondX, y, MEDIA_WIDTH - firstWidth - 8, height);
          context.restore();
        } else if (image) {
          coverImage(context, image, x, y, MEDIA_WIDTH, height);
        }
      } catch {
        // A tainted or broken frame leaves the neutral placeholder in place.
      }

      if (attachment.type === "video") {
        drawPlay(context, x + MEDIA_WIDTH / 2, y + height / 2);
      } else if (photos.length > 2) {
        roundRect(context, x + MEDIA_WIDTH - 72, y + 14, 58, 34, 17);
        context.fillStyle = "rgba(0,0,0,0.68)";
        context.fill();
        context.fillStyle = "#ffffff";
        context.font = uiFont(17, 600);
        context.textAlign = "center";
        context.textBaseline = "alphabetic";
        context.fillText(`+${photos.length - 2}`, x + MEDIA_WIDTH - 43, y + 37);
      }
      context.restore();
    },
  };
}

// Mirrors ArticleAttachmentCard/NewsAttachmentCard's desktop layout: a 16:9 cover fading into its palette color.
async function prepareEditorial(
  context: Ctx,
  attachment: FeedArticleAttachment | FeedNewsAttachment,
): Promise<PreparedAttachment> {
  const isNews = attachment.type === "news";
  if (attachment.reference_is_deleted) {
    return deletedStrip(isNews ? "Berita yang dibagikan sudah dihapus" : "Artikel yang dibagikan sudah dihapus");
  }

  const byline = isNews
    ? attachment.reference_source_name ?? "Berita"
    : attachment.reference_author_name ?? attachment.reference_category_name ?? "Artikel";
  const bylineSrc = isNews ? attachment.reference_source_logo_url : attachment.reference_author_avatar;
  const [image, bylineImage, color] = await Promise.all([
    optionalImage(attachment.reference_image_url),
    optionalImage(bylineSrc),
    attachment.reference_image_url
      ? requestAttachmentColor(attachment.reference_image_url)
      : Promise.resolve(DEFAULT_ATTACHMENT_COLOR),
  ]);

  const inner = 22;
  const textWidth = MEDIA_WIDTH - inner * 2;
  context.font = headlineFont(23, 500);
  const titleLines = wrapText(context, attachment.reference_title ?? (isNews ? "Berita" : "Artikel"), textWidth, 2);
  const height = Math.round(MEDIA_WIDTH * 9 / 16);

  return {
    height,
    draw(context, x, y) {
      roundRect(context, x, y, MEDIA_WIDTH, height, MEDIA_RADIUS);
      context.save();
      context.clip();
      context.fillStyle = color;
      context.fillRect(x, y, MEDIA_WIDTH, height);
      if (image) coverImage(context, image, x, y, MEDIA_WIDTH, height);
      const fade = context.createLinearGradient(0, y + height, 0, y);
      fade.addColorStop(0, color);
      fade.addColorStop(0.25, color);
      fade.addColorStop(1, `${color}00`);
      context.fillStyle = fade;
      context.fillRect(x, y, MEDIA_WIDTH, height);

      const titleTop = y + height - inner - titleLines.length * 28;
      const bylineTop = titleTop - 12 - 28;

      drawCircleImage(context, bylineImage, byline, x + inner, bylineTop, 28, "#ffffff");
      context.fillStyle = "rgba(255,255,255,0.75)";
      context.font = uiFont(15, 500);
      context.textAlign = "left";
      context.textBaseline = "middle";
      context.fillText(truncateText(context, byline, textWidth - 38), x + inner + 38, bylineTop + 14);

      context.fillStyle = "#ffffff";
      context.font = headlineFont(23, 500);
      drawLines(context, titleLines, x + inner, titleTop, 28);
      context.restore();
    },
  };
}

// Mirrors TrainingAttachmentCard: poster on the left, label/title/organizer/schedule beside it.
async function prepareTraining(context: Ctx, attachment: FeedTrainingAttachment): Promise<PreparedAttachment> {
  if (attachment.reference_is_deleted) return deletedStrip("Latihan kader yang dibagikan sudah dihapus");

  const poster = await optionalImage(attachment.reference_image_url);
  const posterWidth = 112;
  const posterHeight = 140;
  const inner = 16;
  const textX = inner + posterWidth + inner;
  const textWidth = MEDIA_WIDTH - textX - inner;
  const levelNumber = attachment.reference_level?.match(/\d+/)?.[0];
  const label = levelNumber ? `Latihan Kader ${levelNumber}` : "Latihan Kader";
  const organizer = attachment.reference_organizer_entity_name?.trim() || "Penyelenggara HMI";
  const { reference_start_date: start, reference_end_date: end } = attachment;
  const schedule = start ? formatDateRange(start, end ?? start) : null;

  context.font = headlineFont(19, 500);
  const titleLines = wrapText(context, attachment.reference_title ?? "Latihan Kader", textWidth, 2);
  const blockHeight = 26 + 8 + titleLines.length * 24 + 8 + 20 + (schedule ? 6 + 20 : 0);
  const height = posterHeight + inner * 2;

  return {
    height,
    draw(context, x, y) {
      roundRect(context, x, y, MEDIA_WIDTH, height, MEDIA_RADIUS);
      context.fillStyle = "#2c2c30";
      context.fill();
      context.strokeStyle = "rgba(255,255,255,0.08)";
      context.lineWidth = 1.5;
      context.stroke();

      roundRect(context, x + inner, y + inner, posterWidth, posterHeight, 10);
      context.save();
      context.clip();
      context.fillStyle = "#3a3a3f";
      context.fillRect(x + inner, y + inner, posterWidth, posterHeight);
      if (poster) coverImage(context, poster, x + inner, y + inner, posterWidth, posterHeight);
      context.restore();

      let cursor = y + (height - blockHeight) / 2;
      const left = x + textX;
      context.font = uiFont(13, 600);
      const pillWidth = context.measureText(label).width + 20;
      roundRect(context, left, cursor, pillWidth, 26, 13);
      context.fillStyle = "rgba(255,92,83,0.16)";
      context.fill();
      context.fillStyle = "#ff5c53";
      context.textAlign = "left";
      context.textBaseline = "middle";
      context.fillText(label, left + 10, cursor + 13);
      cursor += 26 + 8;

      context.fillStyle = TEXT;
      context.font = headlineFont(19, 500);
      drawLines(context, titleLines, left, cursor, 24);
      cursor += titleLines.length * 24 + 8;

      context.fillStyle = MUTED;
      context.font = uiFont(14, 400);
      context.textBaseline = "top";
      context.fillText(truncateText(context, organizer, textWidth), left, cursor);
      if (schedule) {
        cursor += 20 + 6;
        context.fillText(truncateText(context, schedule, textWidth), left, cursor);
      }
    },
  };
}

// Text-only on purpose: third-party preview images are often blocked by CORS and would taint the canvas.
async function prepareUrl(context: Ctx, url: string): Promise<PreparedAttachment> {
  let hostname = url;
  try {
    hostname = new URL(url).hostname;
  } catch {
    // Keep the raw URL as its own label.
  }
  let preview: LinkPreview | null = null;
  try {
    const response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
    if (response.ok) preview = await response.json();
  } catch {
    // The hostname alone still identifies the link.
  }

  const inner = 18;
  const textWidth = MEDIA_WIDTH - inner * 2;
  context.font = uiFont(18, 600);
  const titleLines = wrapText(context, preview?.title ?? url, textWidth, 2);
  context.font = uiFont(15, 400);
  const descLines = preview?.description ? wrapText(context, preview.description, textWidth, 2) : [];
  const textHeight = 18 + 6 + titleLines.length * 24 + (descLines.length ? 6 + descLines.length * 20 : 0);
  const height = textHeight + inner * 2;

  return {
    height,
    draw(context, x, y) {
      roundRect(context, x, y, MEDIA_WIDTH, height, MEDIA_RADIUS);
      context.fillStyle = "#2c2c30";
      context.fill();
      context.strokeStyle = DIVIDER;
      context.lineWidth = 1.5;
      context.stroke();

      const left = x + inner;
      let cursor = y + inner;
      context.fillStyle = MUTED;
      context.font = uiFont(13, 500);
      context.textAlign = "left";
      context.textBaseline = "top";
      context.fillText(truncateText(context, (preview?.siteName ?? hostname).toUpperCase(), textWidth), left, cursor);
      cursor += 18 + 6;
      context.fillStyle = TEXT;
      context.font = uiFont(18, 600);
      drawLines(context, titleLines, left, cursor, 24);
      cursor += titleLines.length * 24 + 6;
      context.fillStyle = MUTED;
      context.font = uiFont(15, 400);
      drawLines(context, descLines, left, cursor, 20);
    },
  };
}

function prepareAttachment(context: Ctx, feed: Feed, attachment: FeedAttachment) {
  switch (attachment.type) {
    case "photo":
    case "video":
      return preparePhotoOrVideo(feed, attachment);
    case "url":
      return prepareUrl(context, attachment.reference_url);
    case "article":
    case "news":
      return prepareEditorial(context, attachment);
    case "training":
      return prepareTraining(context, attachment);
  }
}

// A black drop shadow plus a hairline frame whose light catches on two diagonal glints.
function drawShinyFrame(context: Ctx, y: number, height: number) {
  const x = CARD_X - BORDER;
  const width = CARD_WIDTH + BORDER * 2;
  const frameHeight = height + BORDER * 2;
  const sheen = context.createLinearGradient(x, y - BORDER, x + width, y - BORDER + frameHeight);
  sheen.addColorStop(0, "rgba(255,255,255,0.55)");
  sheen.addColorStop(0.3, "rgba(255,255,255,0.1)");
  sheen.addColorStop(0.5, "rgba(255,255,255,0.4)");
  sheen.addColorStop(0.7, "rgba(255,255,255,0.08)");
  sheen.addColorStop(1, "rgba(255,255,255,0.45)");

  context.save();
  context.shadowColor = "rgba(0,0,0,0.32)";
  context.shadowBlur = 36;
  context.shadowOffsetY = 14;
  roundRect(context, x, y - BORDER, width, frameHeight, CARD_RADIUS + BORDER);
  context.fillStyle = "#242427";
  context.fill();
  context.restore();

  roundRect(context, x, y - BORDER, width, frameHeight, CARD_RADIUS + BORDER);
  context.fillStyle = sheen;
  context.fill();
}

async function createFeedShareImage(feed: Feed, content: string) {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas tidak tersedia.");

  const author = resolveFeedAuthor(feed);
  const attachment = mediaFor(feed);
  const [, avatar] = await Promise.all([
    loadCanvasFonts([uiFont(25, 600), uiFont(24, 400), uiFont(18, 600), headlineFont(23, 500), headlineFont(19, 500)]),
    optionalImage(author.avatar),
  ]);
  const prepared = attachment ? await prepareAttachment(context, feed, attachment) : null;

  context.font = uiFont(24, 400);
  const textLines = wrapText(context, content, MEDIA_WIDTH, 5);
  const lineHeight = 35;
  const textHeight = textLines.length * lineHeight;
  const textOffset = PADDING + 48 + 22;
  const attachmentOffset = textOffset + textHeight + (textHeight ? 20 : 0);
  const bodyBottom = prepared ? attachmentOffset + prepared.height : textOffset + textHeight;
  const cardHeight = bodyBottom + 24 + FOOTER_HEIGHT;
  const cardY = Math.round((HEIGHT - cardHeight) / 2);

  context.fillStyle = "#1b1b1d";
  context.fillRect(0, 0, WIDTH, HEIGHT);

  drawShinyFrame(context, cardY, cardHeight);
  roundRect(context, CARD_X, cardY, CARD_WIDTH, cardHeight, CARD_RADIUS);
  context.fillStyle = "#242427";
  context.fill();

  const left = CARD_X + PADDING;
  const avatarY = cardY + PADDING;
  drawCircleImage(context, avatar, author.name, left, avatarY, 48, "#ffffff");
  context.fillStyle = TEXT;
  context.font = uiFont(25, 600);
  context.textAlign = "left";
  context.textBaseline = "middle";
  context.fillText(truncateText(context, author.name, MEDIA_WIDTH - 62), left + 62, avatarY + 25);

  context.fillStyle = TEXT;
  context.font = uiFont(24, 400);
  drawLines(context, textLines, left, cardY + textOffset, lineHeight);

  prepared?.draw(context, left, cardY + attachmentOffset);

  const footerY = cardY + cardHeight - FOOTER_HEIGHT;
  context.fillStyle = DIVIDER;
  context.fillRect(left, footerY, MEDIA_WIDTH, 1.5);
  context.fillStyle = PRIMARY;
  context.font = uiFont(18, 600);
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("Lihat selengkapnya di Aplikasi HMI Connect", WIDTH / 2, footerY + FOOTER_HEIGHT / 2);

  return canvasToPngBlob(canvas);
}

function MobileAction({ icon, label, onClick, disabled }: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className="flex w-[68px] shrink-0 snap-start flex-col items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-50">
      <span className="flex size-12 items-center justify-center rounded-full bg-surface-muted text-heading">{icon}</span>
      <span className="w-full truncate text-center text-xs text-muted-foreground">{label}</span>
    </button>
  );
}

export default function FeedShareModal({ open, onClose, feed, content, url }: FeedShareModalProps) {
  const [busy, setBusy] = useState<"copy" | "download" | "share" | null>(null);
  const [prepared, setPrepared] = useState<{ key: string; blob: Blob; previewUrl: string } | null>(null);
  const [failedKey, setFailedKey] = useState<string | null>(null);
  const imageKey = `${feed.id}:${feed.updated_at}:${content}`;
  const ready = prepared?.key === imageKey ? prepared : null;
  const author = resolveFeedAuthor(feed);
  const fileName = `hmi-connect-feed-${feed.id}.png`;
  const shareText = `Lihat postingan dari ${author.name} di HMI Connect`;

  useEffect(() => {
    if (!open || ready || failedKey === imageKey) return;
    let cancelled = false;
    void createFeedShareImage(feed, content).then((blob) => {
      if (!cancelled) setPrepared({ key: imageKey, blob, previewUrl: URL.createObjectURL(blob) });
    }).catch((error) => {
      console.error("[FeedShareModal] image preparation failed:", error);
      if (!cancelled) {
        setFailedKey(imageKey);
        toast.error("Gagal menyiapkan gambar. Tutup lalu coba lagi.");
      }
    });
    return () => { cancelled = true; };
  }, [open, ready, failedKey, imageKey, feed, content]);

  const previewUrl = prepared?.previewUrl;
  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const preparing = open && !ready && failedKey !== imageKey;

  async function handleCopyLink() {
    setBusy("copy");
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Tautan postingan disalin.");
    } catch {
      toast.error("Gagal menyalin tautan.");
    } finally {
      setBusy(null);
    }
  }

  async function handleDownload() {
    if (!ready) return;
    setBusy("download");
    try {
      await downloadImageBlob(ready.blob, fileName, shareText);
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("[FeedShareModal] download failed:", error);
        toast.error("Gagal mengunduh gambar.");
      }
    } finally {
      setBusy(null);
    }
  }

  async function handleNativeShare() {
    setBusy("share");
    try {
      const file = ready ? new File([ready.blob], fileName, { type: "image/png" }) : null;
      if (file && canShareImageFile(file)) {
        await navigator.share({ title: shareText, text: `${shareText} ${url}`, files: [file] });
      } else if (navigator.share) {
        await navigator.share({ title: shareText, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Tautan postingan disalin.");
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("[FeedShareModal] share failed:", error);
        toast.error("Gagal membuka menu berbagi.");
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <Modal open={open} onClose={() => { setFailedKey(null); onClose(); }} title="Bagikan Postingan"
      variant="bottomSheet" panelClassName="rounded-t-xl sm:max-w-lg sm:rounded-xl lg:max-w-[760px]">
      <div className="flex flex-col items-center gap-5 lg:flex-row lg:items-stretch lg:gap-8 lg:p-2">
        <div className="relative aspect-[9/16] h-[min(533px,calc(100dvh-14rem))] max-w-full shrink-0 overflow-hidden rounded-lg bg-media-backdrop shadow-2xl sm:h-[min(533px,calc(85dvh-12rem))] lg:h-auto lg:w-[288px]">
          {ready ? (
            <Image src={ready.previewUrl} alt={`Gambar bagikan postingan ${author.name}`} fill unoptimized className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-subtle-foreground">
              {preparing ? <span className="animate-pulse">Menyiapkan gambar...</span> : "Gambar tidak tersedia"}
            </div>
          )}
        </div>

        <div className="-mx-5 w-[calc(100%+2.5rem)] shrink-0 lg:hidden">
          <div className="flex snap-x gap-2 overflow-x-auto scroll-px-5 px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <MobileAction icon={<IconLink className="size-5" stroke={2} />} label={busy === "copy" ? "Menyalin..." : "Copy Link"} onClick={handleCopyLink} disabled={busy !== null} />
            <MobileAction icon={<IconDownload className="size-5" stroke={2} />} label={preparing || busy === "download" ? "Menyiapkan..." : "Download"} onClick={handleDownload} disabled={busy !== null || !ready} />
            {SHARE_PLATFORMS.map((platform) => (
              <a key={platform.name} href={platform.buildHref(url, shareText)} target="_blank" rel="noopener noreferrer" className="flex w-[68px] shrink-0 snap-start flex-col items-center gap-1.5">
                <Image src={socialIconUrl(platform.icon)} alt="" width={48} height={48} className="size-12 rounded-full object-cover ring-1 ring-inset ring-black/5" />
                <span className="w-full truncate text-center text-xs text-muted-foreground">{platform.name}</span>
              </a>
            ))}
            <MobileAction icon={<IconShare3 className="size-5" stroke={2} />} label="Lainnya" onClick={handleNativeShare} disabled={busy !== null} />
          </div>
        </div>

        <div className="hidden min-w-0 flex-1 flex-col lg:flex">
          <h3 className="font-stack-sans-headline text-xl font-semibold text-heading">Bagikan postingan ini</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">Unduh gambar untuk Story atau postingan, atau kirim tautannya ke teman.</p>
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-disabled-foreground">Tautan postingan</p>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-surface-subtle py-1.5 pl-3 pr-1.5">
              <IconLink className="size-4 shrink-0 text-disabled-foreground" stroke={2} />
              <span className="min-w-0 flex-1 truncate text-sm text-heading">{url.replace(/^https?:\/\//, "")}</span>
              <Button variant="primary" onClick={handleCopyLink} disabled={busy !== null} className="h-9 shrink-0 rounded-lg px-4 text-sm">{busy === "copy" ? "Menyalin..." : "Salin"}</Button>
            </div>
          </div>
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-disabled-foreground">Gambar</p>
            <div className="mt-2">
              <DesktopAction icon={<IconDownload className="size-5" stroke={2} />} title={preparing || busy === "download" ? "Menyiapkan..." : "Download gambar"} description="PNG 720 × 1280, pas untuk Story" onClick={handleDownload} disabled={busy !== null || !ready} />
            </div>
          </div>
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-disabled-foreground">Media sosial</p>
            <div className="mt-2 flex flex-wrap gap-3">
              {SHARE_PLATFORMS.map((platform) => (
                <a key={platform.name} href={platform.buildHref(url, shareText)} target="_blank" rel="noopener noreferrer" title={platform.name} className="flex flex-col items-center gap-1.5">
                  <Image src={socialIconUrl(platform.icon)} alt={platform.name} width={40} height={40} className="size-10 rounded-full object-cover ring-1 ring-inset ring-black/5" />
                  <span className="text-[11px] text-muted-foreground">{platform.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
