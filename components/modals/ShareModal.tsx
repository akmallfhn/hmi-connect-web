"use client";

import { socialIconUrl } from "@/lib/constants";
import { Check, Copy, Share2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import Modal from "./Modal";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  url: string;
  text?: string;
}

export type SharePlatform = {
  name: string;
  icon: string;
  buildHref: (url: string, text: string) => string;
};

// Each assets/ tile already carries its own brand fill, so the button needs no colored circle of its own.
export const SHARE_PLATFORMS: SharePlatform[] = [
  {
    name: "WhatsApp",
    icon: "whatsapp",
    buildHref: (url, text) =>
      `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  },
  {
    name: "Facebook",
    icon: "facebook",
    buildHref: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: "X",
    icon: "x",
    buildHref: (url, text) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    name: "Telegram",
    icon: "telegram",
    buildHref: (url, text) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    name: "Email",
    icon: "gmail",
    buildHref: (url, text) =>
      `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`,
  },
];

export default function ShareModal({ open, onClose, url, text = "Lihat postingan ini di HMI Connect" }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Tautan disalin.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin tautan.");
    }
  }

  function handleNativeShare() {
    if (typeof navigator === "undefined" || !navigator.share) return;
    navigator.share({ url, text }).catch(() => {});
  }

  return (
    <Modal open={open} onClose={onClose} title="Bagikan Postingan">
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
        {SHARE_PLATFORMS.map((platform) => (
          <a
            key={platform.name}
            href={platform.buildHref(url, text)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5"
          >
            <Image
              src={socialIconUrl(platform.icon)}
              alt={platform.name}
              width={44}
              height={44}
              // A hairline keeps the near-white Gmail tile from bleeding into the modal.
              className="size-11 rounded-full object-cover ring-1 ring-inset ring-black/5"
            />
            <span className="text-xs text-[#5f6573]">{platform.name}</span>
          </a>
        ))}
        {typeof navigator !== "undefined" && Boolean(navigator.share) && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="flex flex-col items-center gap-1.5"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-[#f5f7fb] text-[#5f6573]">
              <Share2 className="size-5" />
            </span>
            <span className="text-xs text-[#5f6573]">Lainnya</span>
          </button>
        )}
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-xl border border-[#e6e9ef] bg-[#f5f7fb] px-3 py-2">
        <input
          readOnly
          value={url}
          className="flex-1 truncate bg-transparent text-sm text-[#172033] outline-none"
        />
        <button
          type="button"
          onClick={handleCopyLink}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-primary shadow-sm hover:bg-primary-soft"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Tersalin" : "Salin"}
        </button>
      </div>
    </Modal>
  );
}
