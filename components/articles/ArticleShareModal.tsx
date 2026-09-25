"use client";

import { IconDownload, IconLink, IconShare3 } from "@tabler/icons-react";
import Image from "next/image";
import { type ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";
import type { ArticleDetail } from "@/apis/articles";
import Button from "@/components/buttons/Button";
import { getInitials } from "@/components/common/Avatar";
import { DesktopAction } from "@/components/common/UserShareModal";
import Modal from "@/components/modals/Modal";
import { SHARE_PLATFORMS } from "@/components/modals/ShareModal";
import { socialIconUrl } from "@/lib/constants";
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

const HMI_CONNECT_LOGO_URL = "/images/share/logo-hmi-connect-white.svg";
const TITLE_MAX_LINES = 4;

const WIDTH = 720;
const HEIGHT = 1280;

type ShareArticle = Pick<
  ArticleDetail,
  | "id"
  | "title"
  | "image_url"
  | "author_name"
  | "author_avatar"
  | "author_headline"
  | "updated_at"
>;

interface ArticleShareModalProps {
  open: boolean;
  onClose: () => void;
  article: ShareArticle;
  url: string;
}

function headlineFont(size: number, weight: number) {
  return fontFromVariable("--font-stack-sans-headline", size, weight);
}

function interfaceFont(size: number, weight: number) {
  return fontFromVariable("--font-google-sans", size, weight);
}

async function tryLoadImage(src?: string | null) {
  if (!src) return null;
  try {
    return await loadImage(src);
  } catch {
    return null;
  }
}

function drawBlurredBackground(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement | null,
) {
  if (!image) {
    const gradient = context.createLinearGradient(0, 0, WIDTH, HEIGHT);
    gradient.addColorStop(0, "#159fa2");
    gradient.addColorStop(0.6, "#0f4c5c");
    gradient.addColorStop(1, "#172033");
    context.fillStyle = gradient;
    context.fillRect(0, 0, WIDTH, HEIGHT);
    return;
  }

  // Safari has no canvas filter, so blur by drawing a tiny copy back up instead.
  const tiny = document.createElement("canvas");
  tiny.width = 27;
  tiny.height = 48;
  const tinyContext = tiny.getContext("2d");
  if (!tinyContext) return;
  coverImage(tinyContext, image, 0, 0, tiny.width, tiny.height);

  context.save();
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(tiny, -40, -40, WIDTH + 80, HEIGHT + 80);
  context.restore();

  context.fillStyle = "rgba(0, 0, 0, 0.28)";
  context.fillRect(0, 0, WIDTH, HEIGHT);
}

function drawAuthorAvatar(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement | null,
  name: string,
  x: number,
  y: number,
  size: number,
) {
  context.save();
  context.beginPath();
  context.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  context.clip();
  if (image) {
    coverImage(context, image, x, y, size, size);
  } else {
    context.fillStyle = "#e3f6f6";
    context.fillRect(x, y, size, size);
    context.fillStyle = "#159fa2";
    context.font = interfaceFont(size * 0.4, 700);
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(getInitials(name), x + size / 2, y + size / 2);
  }
  context.restore();
  context.textAlign = "left";
  context.textBaseline = "alphabetic";
}

async function createArticleShareImage(article: ShareArticle) {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas tidak tersedia.");

  const [, cover, avatar, logo] = await Promise.all([
    loadCanvasFonts([
      headlineFont(38, 500),
      interfaceFont(22, 700),
      interfaceFont(18, 400),
      interfaceFont(28, 500),
    ]),
    tryLoadImage(article.image_url),
    tryLoadImage(article.author_avatar),
    tryLoadImage(HMI_CONNECT_LOGO_URL),
  ]);

  drawBlurredBackground(context, cover);

  const cardX = 88;
  const cardWidth = WIDTH - cardX * 2;
  const padding = 36;
  const imageHeight = cover ? Math.round((cardWidth * 9) / 16) : 0;
  const titleLineHeight = 50;

  context.font = headlineFont(38, 500);
  const titleLines = wrapText(
    context,
    article.title,
    cardWidth - padding * 2,
    TITLE_MAX_LINES,
  );

  const avatarSize = 60;
  const authorTop =
    imageHeight + padding + titleLines.length * titleLineHeight + 28;
  const cardHeight = authorTop + 24 + avatarSize + padding;

  const logoHeight = 44;
  const logoWidth = logo ? (logo.width / logo.height) * logoHeight : 0;
  const footerHeight = 64 + 30 + 20 + logoHeight;
  const cardY = Math.round((HEIGHT - cardHeight - footerHeight) / 2);

  context.save();
  context.shadowColor = "rgba(0, 0, 0, 0.25)";
  context.shadowBlur = 48;
  context.shadowOffsetY = 16;
  roundRect(context, cardX, cardY, cardWidth, cardHeight, 28);
  context.fillStyle = "#ffffff";
  context.fill();
  context.restore();

  if (cover) {
    context.save();
    roundRect(context, cardX, cardY, cardWidth, cardHeight, 28);
    context.clip();
    // coverImage overflows a non-16:9 photo, so clip it to its own band too.
    context.beginPath();
    context.rect(cardX, cardY, cardWidth, imageHeight);
    context.clip();
    coverImage(context, cover, cardX, cardY, cardWidth, imageHeight);
    context.restore();
  }

  context.fillStyle = "#172033";
  context.font = headlineFont(38, 500);
  context.textAlign = "left";
  // Top baseline anchors each line below the photo, and the clip keeps glyphs inside the title box.
  const titleTop = cardY + imageHeight + padding;
  context.save();
  context.beginPath();
  context.rect(cardX, titleTop, cardWidth, titleLines.length * titleLineHeight);
  context.clip();
  context.textBaseline = "top";
  titleLines.forEach((line, index) => {
    context.fillText(
      line,
      cardX + padding,
      titleTop + 6 + index * titleLineHeight,
    );
  });
  context.restore();

  const dividerY = cardY + authorTop;
  context.fillStyle = "#e6e9ef";
  context.fillRect(cardX + padding, dividerY, cardWidth - padding * 2, 2);

  const avatarY = dividerY + 24;
  drawAuthorAvatar(
    context,
    avatar,
    article.author_name,
    cardX + padding,
    avatarY,
    avatarSize,
  );

  const textX = cardX + padding + avatarSize + 18;
  const textWidth = cardWidth - padding * 2 - avatarSize - 18;
  const headline = article.author_headline?.trim();
  context.fillStyle = "#172033";
  context.font = interfaceFont(22, 700);
  context.fillText(
    truncateText(context, article.author_name, textWidth),
    textX,
    avatarY + (headline ? 26 : 38),
  );
  if (headline) {
    context.fillStyle = "#7b8190";
    context.font = interfaceFont(18, 400);
    context.fillText(
      truncateText(context, headline, textWidth),
      textX,
      avatarY + 52,
    );
  }

  const footerY = cardY + cardHeight + 64;
  context.textAlign = "center";
  context.fillStyle = "#ffffff";
  context.font = interfaceFont(28, 500);
  context.shadowColor = "rgba(0, 0, 0, 0.3)";
  context.shadowBlur = 12;
  context.fillText("Baca selengkapnya di", WIDTH / 2, footerY + 26);
  if (logo) {
    context.drawImage(
      logo,
      (WIDTH - logoWidth) / 2,
      footerY + 50,
      logoWidth,
      logoHeight,
    );
  } else {
    context.font = interfaceFont(36, 700);
    context.fillText("HMI Connect", WIDTH / 2, footerY + 86);
  }

  return canvasToPngBlob(canvas);
}

function MobileAction({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-[68px] shrink-0 snap-start flex-col items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-[#f5f7fb] text-[#172033]">
        {icon}
      </span>
      <span className="w-full truncate text-center text-xs text-[#5f6573]">
        {label}
      </span>
    </button>
  );
}

export default function ArticleShareModal({
  open,
  onClose,
  article,
  url,
}: ArticleShareModalProps) {
  const [busy, setBusy] = useState<"copy" | "download" | "share" | null>(null);
  const imageKey = `${article.id}:${article.updated_at}`;
  const [prepared, setPrepared] = useState<{
    key: string;
    blob: Blob;
    previewUrl: string;
  } | null>(null);
  const [failedKey, setFailedKey] = useState<string | null>(null);
  const ready = prepared?.key === imageKey ? prepared : null;
  const shareText = `Baca artikel ini di HMI Connect: ${article.title}`;
  const fileName = `hmi-connect-artikel-${article.id}.png`;

  useEffect(() => {
    if (!open || ready || failedKey === imageKey) return;

    let cancelled = false;
    void createArticleShareImage(article)
      .then((blob) => {
        if (cancelled) return;
        setPrepared({
          key: imageKey,
          blob,
          previewUrl: URL.createObjectURL(blob),
        });
      })
      .catch((error) => {
        console.error("[ArticleShareModal] image preparation failed:", error);
        if (!cancelled) {
          setFailedKey(imageKey);
          toast.error("Gagal menyiapkan gambar. Tutup lalu coba lagi.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [article, failedKey, imageKey, open, ready]);

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
      toast.success("Tautan artikel disalin.");
    } catch {
      toast.error("Gagal menyalin tautan. Coba lagi.");
    } finally {
      setBusy(null);
    }
  }

  async function handleDownload() {
    if (!ready) return;
    setBusy("download");
    try {
      await downloadImageBlob(ready.blob, fileName, article.title);
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("[ArticleShareModal] download failed:", error);
        toast.error("Gagal mengunduh gambar. Coba lagi.");
      }
    } finally {
      setBusy(null);
    }
  }

  async function handleNativeShare() {
    setBusy("share");
    try {
      const file = ready
        ? new File([ready.blob], fileName, { type: "image/png" })
        : null;
      if (file && canShareImageFile(file)) {
        await navigator.share({
          title: article.title,
          text: `${shareText} ${url}`,
          files: [file],
        });
      } else if (navigator.share) {
        await navigator.share({ title: article.title, text: shareText, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Tautan artikel disalin.");
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("[ArticleShareModal] share failed:", error);
        toast.error("Gagal membuka menu berbagi. Coba lagi.");
      }
    } finally {
      setBusy(null);
    }
  }

  function handleClose() {
    setFailedKey(null);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Bagikan Artikel"
      variant="bottomSheet"
      panelClassName="rounded-t-xl sm:max-w-lg sm:rounded-xl lg:max-w-[760px]"
    >
      <div className="flex flex-col items-center gap-5 lg:flex-row lg:items-stretch lg:gap-8 lg:p-2">
        {/* Natural size when it fits; on a short phone it shrinks so the share row below stays visible. */}
        <div className="relative aspect-[9/16] h-[min(533px,calc(100dvh-14rem))] max-w-full shrink-0 overflow-hidden rounded-lg bg-[#e6e9ef] shadow-2xl sm:h-[min(533px,calc(85dvh-12rem))] lg:h-auto lg:w-[288px]">
          {ready ? (
            // A blob URL needs no optimizer, and the preview must be the exact PNG that downloads.
            <Image
              src={ready.previewUrl}
              alt={`Gambar bagikan untuk artikel ${article.title}`}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[#7b8190]">
              {preparing ? (
                <span className="animate-pulse">Menyiapkan gambar...</span>
              ) : (
                "Gambar tidak tersedia"
              )}
            </div>
          )}
        </div>

        <div className="-mx-5 w-[calc(100%+2.5rem)] shrink-0 lg:hidden">
          <div className="flex snap-x gap-2 overflow-x-auto scroll-px-5 px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <MobileAction
              icon={<IconLink className="size-5" stroke={2} />}
              label={busy === "copy" ? "Menyalin..." : "Copy Link"}
              onClick={handleCopyLink}
              disabled={busy !== null}
            />
            <MobileAction
              icon={<IconDownload className="size-5" stroke={2} />}
              label={
                busy === "download" || preparing ? "Menyiapkan..." : "Download"
              }
              onClick={handleDownload}
              disabled={busy !== null || !ready}
            />
            {SHARE_PLATFORMS.map((platform) => (
              <a
                key={platform.name}
                href={platform.buildHref(url, shareText)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-[68px] shrink-0 snap-start flex-col items-center gap-1.5"
              >
                <Image
                  src={socialIconUrl(platform.icon)}
                  alt=""
                  width={48}
                  height={48}
                  className="size-12 rounded-full object-cover ring-1 ring-inset ring-black/5"
                />
                <span className="w-full truncate text-center text-xs text-[#5f6573]">
                  {platform.name}
                </span>
              </a>
            ))}
            <MobileAction
              icon={<IconShare3 className="size-5" stroke={2} />}
              label="Lainnya"
              onClick={handleNativeShare}
              disabled={busy !== null}
            />
          </div>
        </div>

        <div className="hidden min-w-0 flex-1 flex-col lg:flex">
          <h3 className="font-stack-sans-headline text-xl font-semibold text-[#172033]">
            Bagikan artikel ini
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-[#5f6573]">
            Unduh gambar ini untuk Story atau postingan, atau kirim tautan
            artikelnya langsung ke teman.
          </p>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8a909d]">
              Tautan artikel
            </p>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-[#e6e9ef] bg-[#f8fafc] py-1.5 pl-3 pr-1.5">
              <IconLink className="size-4 shrink-0 text-[#8a909d]" stroke={2} />
              <span className="min-w-0 flex-1 truncate text-sm text-[#172033]">
                {url.replace(/^https?:\/\//, "")}
              </span>
              <Button
                variant="primary"
                onClick={handleCopyLink}
                disabled={busy !== null}
                className="h-9 shrink-0 rounded-lg px-4 text-sm"
              >
                {busy === "copy" ? "Menyalin..." : "Salin"}
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8a909d]">
              Gambar
            </p>
            <div className="mt-2 flex flex-col gap-2">
              <DesktopAction
                icon={<IconDownload className="size-5" stroke={2} />}
                title={
                  busy === "download" || preparing
                    ? "Menyiapkan..."
                    : "Download gambar"
                }
                description="PNG 720 × 1280, pas untuk Story"
                onClick={handleDownload}
                disabled={busy !== null || !ready}
              />
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8a909d]">
              Media sosial
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              {SHARE_PLATFORMS.map((platform) => (
                <a
                  key={platform.name}
                  href={platform.buildHref(url, shareText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={platform.name}
                  className="flex flex-col items-center gap-1.5"
                >
                  <Image
                    src={socialIconUrl(platform.icon)}
                    alt={platform.name}
                    width={40}
                    height={40}
                    className="size-10 rounded-full object-cover ring-1 ring-inset ring-black/5"
                  />
                  <span className="text-[11px] text-[#5f6573]">
                    {platform.name}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
