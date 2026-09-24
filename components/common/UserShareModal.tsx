"use client";

import { IconDownload, IconLink, IconShare3 } from "@tabler/icons-react";
import { type ReactNode, useMemo, useState } from "react";
import { toast } from "sonner";
import Button from "../buttons/Button";
import MembershipCard, {
  CARD_BACKGROUND_URL,
  formatCardNumber,
} from "../membership/MembershipCard";
import Modal from "../modals/Modal";
import Avatar, { getInitials } from "./Avatar";

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

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
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

function coverImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  context.drawImage(
    image,
    x + (width - drawWidth) / 2,
    y + (height - drawHeight) / 2,
    drawWidth,
    drawHeight
  );
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function truncateText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
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

function fontFromVariable(variable: string, size: number, weight: number) {
  const fontFamily = getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();

  return `${weight} ${size}px ${fontFamily || "Arial, sans-serif"}`;
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

  await Promise.all([
    document.fonts.load(crayonizeFont(42)),
    document.fonts.load(interfaceFont(30, 700)),
    document.fonts.load(interfaceFont(22, 400)),
    document.fonts.load(interfaceFont(18, 400)),
    document.fonts.load(interfaceFont(18, 500)),
    document.fonts.load(interfaceFont(18, 700)),
    document.fonts.load(interfaceFont(12, 600)),
    document.fonts.load(monoFont(24, 700)),
  ]);
  await document.fonts.ready;

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
    Math.PI * 2
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
    Math.PI * 2
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
        avatarSize
      );
    } catch {
      drawAvatarFallback(
        context,
        avatarX + avatarSize / 2,
        avatarY + avatarSize / 2,
        avatarSize / 2,
        fullName
      );
    }
  } else {
    drawAvatarFallback(
      context,
      avatarX + avatarSize / 2,
      avatarY + avatarSize / 2,
      avatarSize / 2,
      fullName
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
    panelY + 150
  );

  context.fillStyle = "#8a909d";
  context.font = interfaceFont(22, 400);
  context.fillText(
    truncateText(
      context,
      username ? `@${username}` : "@hmiconnect",
      panelWidth - 64
    ),
    width / 2,
    panelY + 188
  );

  context.fillStyle = "#8a909d";
  context.font = interfaceFont(18, 400);
  context.fillText(
    truncateText(
      context,
      registrationNumber
        ? `User ke-${registrationNumber.toLocaleString("id-ID")} HMI Connect`
        : "User HMI Connect",
      panelWidth - 64
    ),
    width / 2,
    panelY + 220
  );

  await drawMembershipCard(
    context,
    contentX,
    panelY + 252,
    panelWidth - 92,
    290,
    fullName,
    memberCard
  );

  context.fillStyle = "#ffffff";
  context.font = interfaceFont(24, 500);
  context.textAlign = "center";
  context.fillText(
    "Registrasi Keanggotaan HMI hanya di hmiconnect.id",
    width / 2,
    panelY + panelHeight + 64
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Gagal membuat gambar."));
    }, "image/png");
  });
}

function drawAvatarFallback(
  context: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  name: string
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
  memberCard?: string
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
    y + 137
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
    y + height - 32
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

  async function getImageBlob() {
    return createShareImage({
      fullName: displayName,
      username,
      avatar,
      memberCard,
      registrationNumber,
    });
  }

  async function handleDownload() {
    setBusy("download");
    try {
      const blob = await getImageBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `hmi-connect-${username ?? "profile"}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      console.error("[UserShareModal] download failed:", error);
      toast.error("Gagal mengunduh gambar. Coba lagi.");
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
    setBusy("share");
    try {
      const blob = await getImageBlob();
      const file = new File(
        [blob],
        `hmi-connect-${username ?? "profile"}.png`,
        {
          type: "image/png",
        }
      );
      const nav = navigator as Navigator & {
        canShare?: (data: ShareData) => boolean;
      };
      if (navigator.share && nav.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `${displayName} di HMI Connect`,
          text: `Lihat profil ${displayName} di HMI Connect.`,
          url: resolvedShareUrl,
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

  return (
    <>
      {renderTrigger ? (
        renderTrigger(() => setOpen(true))
      ) : (
        <Button
          variant={buttonVariant}
          onClick={() => setOpen(true)}
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
        panelClassName="rounded-t-xl sm:rounded-xl lg:max-w-[560px]"
      >
        <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:justify-center">
          <div
            className="relative aspect-[9/16] w-full max-w-[330px] overflow-hidden rounded-lg bg-cover bg-center p-4 shadow-2xl lg:w-[min(225px,calc((85vh-6rem)*9/16))]"
            style={{ backgroundImage: `url('${SHARE_BACKGROUND_URL}')` }}
          >
            <div className="absolute inset-0 bg-black/25" />
            <div className="relative flex h-full flex-col px-2 pb-6 pt-7 lg:px-1 lg:pb-3 lg:pt-4">
              <p
                className="text-center text-2xl leading-tight text-white drop-shadow-md lg:text-base"
                style={{ fontFamily: "var(--font-crayonize)" }}
              >
                <span className="block">Gue Udah Terdaftar di</span>
                <span className="block">HMI Connect</span>
              </p>

              <div className="relative mt-16 rounded-xl bg-white px-5 pb-6 pt-14 text-[#172033] shadow-lg lg:mt-12 lg:px-3 lg:pb-4 lg:pt-12">
                <Avatar
                  src={avatar}
                  name={displayName}
                  size={96}
                  className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 border-4 border-white lg:hidden"
                />
                <Avatar
                  src={avatar}
                  name={displayName}
                  size={56}
                  className="absolute left-1/2 top-0 hidden -translate-x-1/2 -translate-y-1/2 border-2 border-white lg:block"
                />

                <div className="flex flex-col items-center">
                  <h3 className="truncate text-lg font-bold leading-tight lg:text-xs">
                    {displayName}
                  </h3>
                  <p className="mt-1 truncate text-sm text-[#8a909d] lg:text-xs">
                    {username ? `@${username}` : "@hmiconnect"}
                  </p>
                  <p className="mt-1 text-xs text-[#8a909d] lg:text-[10px]">
                    {registrationNumber
                      ? `User ke-${registrationNumber.toLocaleString("id-ID")} HMI Connect`
                      : "User HMI Connect"}
                  </p>
                </div>

                <MembershipCard
                  fullName={displayName}
                  memberCard={memberCard}
                  variant="share"
                  className="mt-4 rounded-xl shadow-none lg:mt-3 lg:rounded-lg lg:p-3 lg:[&_span]:text-[6px] lg:[&_p:first-child]:text-[8px] lg:[&_p:last-child]:text-[8px]"
                />
              </div>

              <p className="mt-4 text-center text-[11px] font-medium leading-relaxed text-white drop-shadow-md lg:mt-3 lg:text-[9px]">
                Registrasi Keanggotaan HMI hanya di hmiconnect.id
              </p>
            </div>
          </div>

          <div className="grid w-full max-w-[320px] grid-cols-3 gap-1 lg:w-[136px] lg:grid-cols-1 lg:gap-2">
            <button
              type="button"
              aria-label="Salin tautan profil"
              title="Salin tautan"
              onClick={handleCopyLink}
              disabled={!username || busy !== null}
              className="flex h-20 flex-col items-center justify-center gap-1.5 rounded-lg px-2 text-sm font-medium text-[#172033] transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50 lg:h-[68px]"
            >
              <IconLink className="size-6" stroke={2} />
              {busy === "copy" ? "Menyalin..." : "Copy Link"}
            </button>
            <button
              type="button"
              aria-label="Download gambar"
              title="Download"
              onClick={handleDownload}
              disabled={busy !== null}
              className="flex h-20 flex-col items-center justify-center gap-1.5 rounded-lg px-2 text-sm font-medium text-[#172033] transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50 lg:h-[68px]"
            >
              <IconDownload className="size-6" stroke={2} />
              {busy === "download" ? "Menyiapkan..." : "Download"}
            </button>
            <button
              type="button"
              aria-label="Bagikan gambar"
              title="Bagikan"
              onClick={handleNativeShare}
              disabled={busy !== null}
              className="flex h-20 flex-col items-center justify-center gap-1.5 rounded-lg px-2 text-sm font-medium text-[#172033] transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50 lg:h-[68px]"
            >
              <IconShare3 className="size-6" stroke={2} />
              {busy === "share" ? "Menyiapkan..." : "Share"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
