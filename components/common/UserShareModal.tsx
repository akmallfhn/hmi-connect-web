"use client";

import { IconDownload, IconLink, IconShare3 } from "@tabler/icons-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import Button from "../buttons/Button";
import {
  CARD_BACKGROUND_URL,
  formatCardNumber,
} from "../membership/MembershipCard";
import Modal from "../modals/Modal";
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
} from "@/lib/share-canvas";
import { getInitials } from "./Avatar";

const SHARE_BACKGROUND_URL = "/images/share/share-background.jpg";
const HMI_CONNECT_LOGO_URL = "/images/share/logo-hmi-connect-white.svg";
const HMI_OUTLINE_LOGO_URL = "/images/share/logo-hmi-outline-white.svg";

type UserShareModalProps = {
  fullName?: string;
  username?: string;
  avatar?: string;
  memberCard?: string;
  registrationNumber?: number;
  shareUrl?: string;
  renderTrigger?: (openModal: () => void) => ReactNode;
  buttonLabel?: string;
  buttonClassName?: string;
  buttonVariant?: "primary" | "light" | "ghost";
};

function profileUrl(username?: string) {
  if (!username) return "";
  if (typeof window === "undefined") return `/profile/${username}`;
  return `${window.location.origin}/profile/${username}`;
}

function crayonizeFont(size: number) {
  return fontFromVariable("--font-crayonize", size, 700);
}

function interfaceFont(size: number, weight: number) {
  return fontFromVariable("--font-google-sans", size, weight);
}

function monoFont(size: number, weight: number) {
  return fontFromVariable("--font-geist-mono", size, weight);
}

function loadShareFonts() {
  return loadCanvasFonts([
    crayonizeFont(42),
    interfaceFont(30, 700),
    interfaceFont(22, 400),
    interfaceFont(18, 400),
    interfaceFont(18, 500),
    interfaceFont(18, 700),
    interfaceFont(12, 600),
    monoFont(24, 700),
  ]);
}

async function createShareImage({
  fullName,
  username,
  avatar,
  memberCard,
  registrationNumber,
}: Required<Pick<UserShareModalProps, "fullName">> &
  Pick<
    UserShareModalProps,
    "username" | "avatar" | "memberCard" | "registrationNumber"
  >) {
  const width = 720;
  const height = 1280;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas tidak tersedia.");

  await loadShareFonts();

  try {
    const background = await loadImage(SHARE_BACKGROUND_URL);
    coverImage(context, background, 0, 0, width, height);
  } catch {
    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#005cbf");
    gradient.addColorStop(0.55, "#08b7d1");
    gradient.addColorStop(1, "#031326");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
  }

  context.fillStyle = "rgba(0, 0, 0, 0.3)";
  context.fillRect(0, 0, width, height);

  const panelX = 84;
  const panelY = 320;
  const panelWidth = width - panelX * 2;
  const panelHeight = 610;
  roundRect(context, panelX, panelY, panelWidth, panelHeight, 28);
  context.fillStyle = "#ffffff";
  context.fill();

  const avatarSize = 128;
  const avatarX = width / 2 - avatarSize / 2;
  const avatarY = panelY - avatarSize / 2;
  context.save();
  context.beginPath();
  context.arc(
    avatarX + avatarSize / 2,
    avatarY + avatarSize / 2,
    avatarSize / 2 + 8,
    0,
    Math.PI * 2,
  );
  context.fillStyle = "#ffffff";
  context.fill();
  context.restore();

  context.save();
  context.beginPath();
  context.arc(
    avatarX + avatarSize / 2,
    avatarY + avatarSize / 2,
    avatarSize / 2,
    0,
    Math.PI * 2,
  );
  context.clip();
  if (avatar) {
    try {
      const avatarImage = await loadImage(avatar);
      coverImage(
        context,
        avatarImage,
        avatarX,
        avatarY,
        avatarSize,
        avatarSize,
      );
    } catch {
      drawAvatarFallback(
        context,
        avatarX + avatarSize / 2,
        avatarY + avatarSize / 2,
        avatarSize / 2,
        fullName,
      );
    }
  } else {
    drawAvatarFallback(
      context,
      avatarX + avatarSize / 2,
      avatarY + avatarSize / 2,
      avatarSize / 2,
      fullName,
    );
  }
  context.restore();

  const contentX = panelX + 46;
  context.textAlign = "center";
  context.fillStyle = "#ffffff";
  context.font = crayonizeFont(42);
  context.fillText("Gue Udah Terdaftar di", width / 2, 188);
  context.fillText("HMI Connect", width / 2, 226);

  context.textAlign = "center";
  context.fillStyle = "#0a0a0a";
  context.font = interfaceFont(30, 700);
  context.fillText(
    truncateText(context, fullName, panelWidth - 64),
    width / 2,
    panelY + 150,
  );

  context.fillStyle = "#8a909d";
  context.font = interfaceFont(22, 400);
  context.fillText(
    truncateText(
      context,
      username ? `@${username}` : "@hmiconnect",
      panelWidth - 64,
    ),
    width / 2,
    panelY + 188,
  );

  context.fillStyle = "#8a909d";
  context.font = interfaceFont(18, 400);
  context.fillText(
    truncateText(
      context,
      registrationNumber
        ? `User ke-${registrationNumber.toLocaleString("id-ID")} HMI Connect`
        : "User HMI Connect",
      panelWidth - 64,
    ),
    width / 2,
    panelY + 220,
  );

  await drawMembershipCard(
    context,
    contentX,
    panelY + 252,
    panelWidth - 92,
    290,
    fullName,
    memberCard,
  );

  context.fillStyle = "#ffffff";
  context.font = interfaceFont(24, 500);
  context.textAlign = "center";
  context.fillText(
    "Registrasi Keanggotaan HMI hanya di hmiconnect.id",
    width / 2,
    panelY + panelHeight + 64,
  );

  return canvasToPngBlob(canvas);
}

function drawAvatarFallback(
  context: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  name: string,
) {
  context.fillStyle = "#e3f6f6";
  context.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
  context.fillStyle = "#159fa2";
  context.font = "700 42px Arial, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(getInitials(name), centerX, centerY);
  context.textBaseline = "alphabetic";
}

async function drawMembershipCard(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  fullName: string,
  memberCard?: string,
) {
  roundRect(context, x, y, width, height, 14);
  try {
    const background = await loadImage(CARD_BACKGROUND_URL);
    context.save();
    roundRect(context, x, y, width, height, 14);
    context.clip();
    coverImage(context, background, x, y, width, height);
    context.restore();
  } catch {
    const gradient = context.createLinearGradient(x, y, x + width, y + height);
    gradient.addColorStop(0, "#159fa2");
    gradient.addColorStop(0.6, "#172033");
    gradient.addColorStop(1, "#ff5c53");
    context.fillStyle = gradient;
    context.fill();
  }

  roundRect(context, x, y, width, height, 14);
  context.fillStyle = "rgba(0, 0, 0, 0.34)";
  context.fill();

  try {
    const [hmiConnectLogo, hmiOutlineLogo] = await Promise.all([
      loadImage(HMI_CONNECT_LOGO_URL),
      loadImage(HMI_OUTLINE_LOGO_URL),
    ]);
    context.drawImage(hmiConnectLogo, x + 26, y + 25, 140, 28);
    context.drawImage(hmiOutlineLogo, x + width - 42, y + 20, 16, 43);
  } catch {
    context.fillStyle = "#ffffff";
    context.font = interfaceFont(18, 700);
    context.textAlign = "left";
    context.fillText("HMI Connect", x + 26, y + 42);
  }

  context.fillStyle = "#ffffff";
  context.font = interfaceFont(12, 600);
  context.textAlign = "right";
  context.fillText("KARTU TANDA", x + width - 54, y + 34);
  context.fillText("ANGGOTA HMI", x + width - 54, y + 50);

  roundRect(context, x + 26, y + 95, 56, 42, 8);
  const chipGradient = context.createLinearGradient(
    x + 26,
    y + 95,
    x + 82,
    y + 137,
  );
  chipGradient.addColorStop(0, "#fff4b8");
  chipGradient.addColorStop(1, "#d7a920");
  context.fillStyle = chipGradient;
  context.fill();

  context.fillStyle = "#ffffff";
  context.textAlign = "left";
  context.font = monoFont(24, 700);
  context.fillText(formatCardNumber(memberCard), x + 26, y + height - 64);
  context.font = interfaceFont(18, 700);
  context.fillText(
    fullName.toUpperCase().slice(0, 26),
    x + 26,
    y + height - 32,
  );
}

export function DesktopAction({
  icon,
  title,
  description,
  onClick,
  disabled,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center gap-3 rounded-xl border border-[#e6e9ef] p-3 text-left transition hover:border-[#bfe6e7] hover:bg-[#e3f6f6]/50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#e3f6f6] text-[#0f6f72]">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-[#172033]">
          {title}
        </span>
        <span className="block text-xs text-[#8a909d]">{description}</span>
      </span>
    </button>
  );
}

export default function UserShareModal({
  fullName,
  username,
  avatar,
  memberCard,
  registrationNumber,
  shareUrl,
  renderTrigger,
  buttonLabel = "Bagikan",
  buttonClassName,
  buttonVariant = "light",
}: UserShareModalProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<"copy" | "download" | "share" | null>(null);
  const displayName = fullName ?? "Kader HMI";
  const profileShareUrl = useMemo(() => profileUrl(username), [username]);
  const resolvedShareUrl = shareUrl ?? profileShareUrl;
  const imageKey = useMemo(
    () =>
      JSON.stringify([
        displayName,
        username,
        avatar,
        memberCard,
        registrationNumber,
      ]),
    [avatar, displayName, memberCard, registrationNumber, username],
  );
  const [preparedImage, setPreparedImage] = useState<{
    key: string;
    blob: Blob;
    url: string;
  } | null>(null);
  const [failedImageKey, setFailedImageKey] = useState<string | null>(null);
  const imageBlob = preparedImage?.key === imageKey ? preparedImage.blob : null;
  const previewUrl = preparedImage?.key === imageKey ? preparedImage.url : null;
  const preparedUrl = preparedImage?.url;

  useEffect(() => {
    if (!preparedUrl) return;
    return () => URL.revokeObjectURL(preparedUrl);
  }, [preparedUrl]);

  useEffect(() => {
    if (!open || imageBlob || failedImageKey === imageKey) return;

    let cancelled = false;
    void createShareImage({
      fullName: displayName,
      username,
      avatar,
      memberCard,
      registrationNumber,
    })
      .then((blob) => {
        if (!cancelled) {
          setPreparedImage({
            key: imageKey,
            blob,
            url: URL.createObjectURL(blob),
          });
        }
      })
      .catch((error) => {
        console.error("[UserShareModal] image preparation failed:", error);
        if (!cancelled) {
          setFailedImageKey(imageKey);
          toast.error("Gagal menyiapkan gambar. Tutup lalu coba lagi.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    avatar,
    displayName,
    failedImageKey,
    imageBlob,
    imageKey,
    memberCard,
    open,
    registrationNumber,
    username,
  ]);

  function createImageFile(blob: Blob) {
    return new File([blob], `hmi-connect-${username ?? "profile"}.png`, {
      type: "image/png",
    });
  }

  async function handleDownload() {
    if (!imageBlob) return;

    setBusy("download");
    try {
      await downloadImageBlob(
        imageBlob,
        `hmi-connect-${username ?? "profile"}.png`,
        `${displayName} di HMI Connect`,
      );
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("[UserShareModal] download failed:", error);
        toast.error("Gagal mengunduh gambar. Coba lagi.");
      }
    } finally {
      setBusy(null);
    }
  }

  async function handleCopyLink() {
    if (!username) return;

    setBusy("copy");
    try {
      await navigator.clipboard.writeText(profileShareUrl);
      toast.success("Tautan profil disalin.");
    } catch (error) {
      console.error("[UserShareModal] copy link failed:", error);
      toast.error("Gagal menyalin tautan. Coba lagi.");
    } finally {
      setBusy(null);
    }
  }

  async function handleNativeShare() {
    if (!imageBlob) return;

    setBusy("share");
    try {
      const file = createImageFile(imageBlob);
      if (canShareImageFile(file)) {
        await navigator.share({
          title: `${displayName} di HMI Connect`,
          text: `Lihat profil ${displayName} di HMI Connect.`,
          files: [file],
        });
      } else if (navigator.share) {
        await navigator.share({
          title: `${displayName} di HMI Connect`,
          text: `Lihat profil ${displayName} di HMI Connect.`,
          url: resolvedShareUrl,
        });
      } else {
        await navigator.clipboard.writeText(resolvedShareUrl);
        toast.success("Tautan profil disalin.");
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("[UserShareModal] share failed:", error);
        toast.error("Gagal membuka share native. Coba lagi.");
      }
    } finally {
      setBusy(null);
    }
  }

  const imagePreparing = open && !imageBlob && failedImageKey !== imageKey;

  function handleOpen() {
    setFailedImageKey(null);
    setOpen(true);
  }

  return (
    <>
      {renderTrigger ? (
        renderTrigger(handleOpen)
      ) : (
        <Button
          variant={buttonVariant}
          onClick={handleOpen}
          className={buttonClassName}
        >
          <IconShare3 className="size-4" stroke={2} />
          {buttonLabel}
        </Button>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Bagikan"
        variant="bottomSheet"
        panelClassName="rounded-t-xl sm:rounded-xl lg:max-w-[760px]"
      >
        <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-stretch lg:gap-8 lg:p-2">
          {/* The exact PNG that downloads, so it scales down whole when the sheet is short. */}
          <div className="relative aspect-[9/16] h-[min(587px,calc(100dvh-14rem))] max-w-full shrink-0 overflow-hidden rounded-lg bg-[#e6e9ef] shadow-2xl sm:h-[min(587px,calc(85dvh-12rem))] lg:h-auto lg:w-[288px]">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt={`Kartu profil ${displayName} di HMI Connect`}
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[#7b8190]">
                {imagePreparing ? (
                  <span className="animate-pulse">Menyiapkan gambar...</span>
                ) : (
                  "Gambar tidak tersedia"
                )}
              </div>
            )}
          </div>

          <div className="grid w-full max-w-[320px] shrink-0 grid-cols-3 gap-1 lg:hidden">
            <button
              type="button"
              aria-label="Salin tautan profil"
              title="Salin tautan"
              onClick={handleCopyLink}
              disabled={!username || busy !== null}
              className="flex h-20 flex-col items-center justify-center gap-1.5 rounded-lg px-2 text-sm font-medium text-[#172033] transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <IconLink className="size-6" stroke={2} />
              {busy === "copy" ? "Menyalin..." : "Copy Link"}
            </button>
            <button
              type="button"
              aria-label="Download gambar"
              title="Download"
              onClick={handleDownload}
              disabled={busy !== null || !imageBlob}
              className="flex h-20 flex-col items-center justify-center gap-1.5 rounded-lg px-2 text-sm font-medium text-[#172033] transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <IconDownload className="size-6" stroke={2} />
              {busy === "download" || imagePreparing
                ? "Menyiapkan..."
                : "Download"}
            </button>
            <button
              type="button"
              aria-label="Bagikan gambar"
              title="Bagikan"
              onClick={handleNativeShare}
              disabled={busy !== null || !imageBlob}
              className="flex h-20 flex-col items-center justify-center gap-1.5 rounded-lg px-2 text-sm font-medium text-[#172033] transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <IconShare3 className="size-6" stroke={2} />
              {busy === "share" || imagePreparing ? "Menyiapkan..." : "Share"}
            </button>
          </div>

          <div className="hidden min-w-0 flex-1 flex-col lg:flex">
            <h3 className="font-stack-sans-headline text-xl font-semibold text-[#172033]">
              Bagikan profil kamu
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[#5f6573]">
              Unduh kartu ini untuk Story atau postingan, atau kirim tautan
              profil ke teman seperjuangan.
            </p>

            {username && (
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#8a909d]">
                  Tautan profil
                </p>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-[#e6e9ef] bg-[#f8fafc] py-1.5 pl-3 pr-1.5">
                  <IconLink
                    className="size-4 shrink-0 text-[#8a909d]"
                    stroke={2}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm text-[#172033]">
                    {profileShareUrl.replace(/^https?:\/\//, "")}
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
            )}

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8a909d]">
                Gambar
              </p>
              <div className="mt-2 flex flex-col gap-2">
                <DesktopAction
                  icon={<IconDownload className="size-5" stroke={2} />}
                  title={
                    busy === "download" || imagePreparing
                      ? "Menyiapkan..."
                      : "Download gambar"
                  }
                  description="PNG 720 × 1280, pas untuk Story"
                  onClick={handleDownload}
                  disabled={busy !== null || !imageBlob}
                />
                <DesktopAction
                  icon={<IconShare3 className="size-5" stroke={2} />}
                  title={
                    busy === "share" || imagePreparing
                      ? "Menyiapkan..."
                      : "Bagikan ke aplikasi lain"
                  }
                  description="Buka menu berbagi di perangkat kamu"
                  onClick={handleNativeShare}
                  disabled={busy !== null || !imageBlob}
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
