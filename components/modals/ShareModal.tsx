"use client";

import { Check, Copy, Mail, MessageCircle, Send, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Modal from "./Modal";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  url: string;
  text?: string;
}

type SharePlatform = {
  name: string;
  bg: string;
  render: () => React.ReactNode;
  buildHref: (url: string, text: string) => string;
};

const PLATFORMS: SharePlatform[] = [
  {
    name: "WhatsApp",
    bg: "#25D366",
    render: () => <MessageCircle className="size-5 text-white" />,
    buildHref: (url, text) =>
      `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  },
  {
    name: "Facebook",
    bg: "#1877F2",
    render: () => <span className="text-lg font-bold text-white">f</span>,
    buildHref: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: "X",
    bg: "#000000",
    render: () => <span className="text-lg font-bold text-white">X</span>,
    buildHref: (url, text) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    name: "Telegram",
    bg: "#26A5E4",
    render: () => <Send className="size-5 text-white" />,
    buildHref: (url, text) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    name: "Email",
    bg: "#5f6573",
    render: () => <Mail className="size-5 text-white" />,
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
        {PLATFORMS.map((platform) => (
          <a
            key={platform.name}
            href={platform.buildHref(url, text)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5"
          >
            <span
              className="flex size-11 items-center justify-center rounded-full"
              style={{ backgroundColor: platform.bg }}
            >
              {platform.render()}
            </span>
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
