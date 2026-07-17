"use client";

import EmojiPicker, {
  EmojiClickData,
  EmojiStyle,
  Theme,
} from "emoji-picker-react";
import {
  ImageIcon,
  Link2,
  Loader2,
  Play,
  Send,
  SmilePlus,
  Trash2,
  Video,
  X,
} from "lucide-react";
import Image from "next/image";
import {
  FormEvent,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { toast } from "sonner";
import Avatar from "../common/Avatar";
import Button from "../buttons/Button";
import Modal from "../modals/Modal";
import LinkPreviewCard from "../feeds/LinkPreviewCard";
import QuotedFeed from "../feeds/QuotedFeed";
import { createFeed } from "@/lib/actions";
import { supabase } from "@/lib/supabase";
import { isSuccessStatus, type FeedMediaTypeEnum } from "@/lib/types";
import type { Feed } from "@/apis/feeds";

interface CreateFeedFormsProps {
  fullName?: string;
  avatar?: string;
  userId?: string;
  onCreated?: (feed: Feed) => void;
  /** Bump this (e.g. from a counter) to force the composer open from outside — see BottomNav. */
  forceOpenSignal?: number;
}

type PhotoDraft = {
  id: string;
  file: File;
  previewUrl: string;
};

type VideoDraft = {
  file: File;
  previewUrl: string;
};

const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const PHOTO_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const VIDEO_EXTENSIONS = ["mp4", "webm", "mov"];
const MAX_PHOTOS = 5;
const MAX_PHOTO_BYTES = 1 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

const ACTIONS = [
  {
    label: "Foto",
    mode: "photo" as const,
    icon: ImageIcon,
    color: "text-primary",
  },
  {
    label: "Video",
    mode: "video" as const,
    icon: Video,
    color: "text-secondary",
  },
  { label: "URL", mode: "url" as const, icon: Link2, color: "text-[#5f6573]" },
];

function getExtension(file: File) {
  return file.name.split(".").pop()?.toLowerCase() ?? "";
}

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function isValidUrl(value: string) {
  try {
    const parsed = new URL(normalizeUrl(value));
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

async function uploadPublicStorageFile(filePath: string, file: File) {
  const { error } = await supabase.storage
    .from("hmi-connect")
    .upload(filePath, file, { cacheControl: "3600", upsert: false });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("hmi-connect").getPublicUrl(filePath);
  if (!data?.publicUrl) throw new Error("missing public url");

  return data.publicUrl;
}

function isStoragePolicyError(error: unknown) {
  return (
    error instanceof Error &&
    error.message.toLowerCase().includes("row-level security")
  );
}

async function uploadFeedMedia(
  file: File,
  userId: string | undefined,
  kind: "photo" | "video"
) {
  const extension = getExtension(file);
  const fileName = `${kind}-${Date.now()}-${randomId()}.${extension}`;
  const primaryPath = `feed_media/${userId ?? "anonymous"}/${fileName}`;

  try {
    return await uploadPublicStorageFile(primaryPath, file);
  } catch (error) {
    if (!isStoragePolicyError(error)) throw error;

    const fallbackPath = `avatars/feed_media/${userId ?? "anonymous"}/${fileName}`;
    return uploadPublicStorageFile(fallbackPath, file);
  }
}

export default function CreateFeedForms({
  fullName,
  avatar,
  userId,
  onCreated,
  forceOpenSignal,
}: CreateFeedFormsProps) {
  const [open, setOpen] = useState(false);
  const [initialMode, setInitialMode] = useState<FeedMediaTypeEnum | null>(
    null
  );
  const [seenForceOpenSignal, setSeenForceOpenSignal] =
    useState(forceOpenSignal);
  const firstName = (fullName ?? "Kader").split(" ")[0];

  function openComposer(mode: FeedMediaTypeEnum | null = null) {
    setInitialMode(mode);
    setOpen(true);
  }

  if (forceOpenSignal !== seenForceOpenSignal) {
    setSeenForceOpenSignal(forceOpenSignal);
    if (forceOpenSignal) openComposer();
  }

  return (
    <>
      <div className="-mt-16 mx-4 rounded-2xl border border-[#e6e9ef] bg-white p-4 shadow-sm lg:mx-0 lg:mt-0">
        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            <Avatar src={avatar} name={fullName ?? "Kader"} size={44} />
          </div>
          <div
            role="button"
            tabIndex={0}
            onClick={() => openComposer()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openComposer();
              }
            }}
            className="flex-1 cursor-pointer rounded-full bg-[#f5f7fb] px-4 py-2.5 text-sm font-medium text-[#5f6573] transition hover:bg-[#eef1f6] focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            Apa yang ingin kamu bagikan, {firstName}?
          </div>
        </div>
        <div className="mt-3 flex items-center justify-around border-t border-[#e6e9ef] pt-3">
          {ACTIONS.map(({ label, mode, icon: Icon, color }) => (
            <Button
              key={label}
              variant="ghost"
              onClick={() => openComposer(mode)}
              className="gap-2 rounded-lg px-3 py-1.5 text-sm text-[#5f6573] hover:bg-[#f5f7fb]"
            >
              <Icon className={`size-4 ${color}`} />
              {label}
            </Button>
          ))}
        </div>
      </div>

      <FeedComposerModal
        open={open}
        onClose={() => setOpen(false)}
        fullName={fullName}
        avatar={avatar}
        userId={userId}
        initialMode={initialMode}
        onCreated={onCreated}
      />
    </>
  );
}

interface FeedComposerModalProps {
  open: boolean;
  onClose: () => void;
  fullName?: string;
  avatar?: string;
  userId?: string;
  initialMode?: FeedMediaTypeEnum | null;
  /** When set, the composer becomes a quote-repost of this feed: no attachment UI, and the
   *  quoted feed renders read-only below the textarea (see QuotedFeed). */
  quoteFeed?: Feed;
  onCreated?: (feed: Feed) => void;
}

// Exported so FeedItemCard's "Quote Repost" action can open this same modal externally,
// controlled by its own open state, without rendering CreateFeedForms's trigger card.
export function FeedComposerModal({
  open,
  onClose,
  fullName,
  avatar,
  userId,
  initialMode,
  quoteFeed,
  onCreated,
}: FeedComposerModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={quoteFeed ? "Quote Repost" : "Buat Postingan"}
      panelClassName="max-w-2xl lg:max-w-3xl"
    >
      {open && (
        <FeedComposerFields
          fullName={fullName}
          avatar={avatar}
          userId={userId}
          initialMode={initialMode}
          quoteFeed={quoteFeed}
          onClose={onClose}
          onCreated={onCreated}
        />
      )}
    </Modal>
  );
}

interface FeedComposerFieldsProps {
  fullName?: string;
  avatar?: string;
  userId?: string;
  initialMode?: FeedMediaTypeEnum | null;
  quoteFeed?: Feed;
  onClose: () => void;
  onCreated?: (feed: Feed) => void;
}

function FeedComposerFields({
  fullName,
  avatar,
  userId,
  initialMode,
  quoteFeed,
  onClose,
  onCreated,
}: FeedComposerFieldsProps) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewUrlsRef = useRef(new Set<string>());
  const [content, setContent] = useState("");
  const [photos, setPhotos] = useState<PhotoDraft[]>([]);
  const [video, setVideo] = useState<VideoDraft | null>(null);
  const [urlValue, setUrlValue] = useState("");
  const [urlActive, setUrlActive] = useState(initialMode === "url");
  const [previewUrl, setPreviewUrl] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const emojiWrapperRef = useRef<HTMLDivElement>(null);
  const attachmentMode: FeedMediaTypeEnum | null = photos.length
    ? "photo"
    : video
      ? "video"
      : urlActive
        ? "url"
        : null;
  const normalizedUrl = normalizeUrl(urlValue);
  const hasValidUrl = urlValue.trim() ? isValidUrl(urlValue) : false;
  const canSubmit =
    Boolean(content.trim()) &&
    !submitting &&
    !(attachmentMode === "url" && !hasValidUrl);
  const isPhotoLocked = attachmentMode !== null && attachmentMode !== "photo";
  const isVideoLocked = attachmentMode !== null && attachmentMode !== "video";
  const isUrlLocked = attachmentMode !== null && attachmentMode !== "url";

  useEffect(() => {
    const previewUrls = previewUrlsRef.current;
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      previewUrls.clear();
    };
  }, []);

  useEffect(() => {
    const nextPreviewUrl = urlActive && hasValidUrl ? normalizedUrl : "";
    const delay = nextPreviewUrl ? 900 : 0;
    const timeoutId = window.setTimeout(
      () => setPreviewUrl(nextPreviewUrl),
      delay
    );
    return () => window.clearTimeout(timeoutId);
  }, [hasValidUrl, normalizedUrl, urlActive]);

  useEffect(() => {
    if (!showEmoji) return;

    function handleClickOutside(event: MouseEvent) {
      if (!emojiWrapperRef.current?.contains(event.target as Node)) {
        setShowEmoji(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmoji]);

  function createPreviewUrl(file: File) {
    const previewUrl = URL.createObjectURL(file);
    previewUrlsRef.current.add(previewUrl);
    return previewUrl;
  }

  function revokePreviewUrl(previewUrl: string) {
    URL.revokeObjectURL(previewUrl);
    previewUrlsRef.current.delete(previewUrl);
  }

  function clearPhotos() {
    photos.forEach((photo) => revokePreviewUrl(photo.previewUrl));
    setPhotos([]);
  }

  function clearVideo() {
    if (video) revokePreviewUrl(video.previewUrl);
    setVideo(null);
  }

  function clearAllMedia() {
    clearPhotos();
    clearVideo();
    setUrlValue("");
    setUrlActive(false);
    setPreviewUrl("");
  }

  function handleClose() {
    clearAllMedia();
    onClose();
  }

  function handleEmojiClick(emojiData: EmojiClickData) {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent((prev) => `${prev}${emojiData.emoji}`);
      setShowEmoji(false);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const next = content.slice(0, start) + emojiData.emoji + content.slice(end);
    setContent(next);
    window.setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd =
        start + emojiData.emoji.length;
      textarea.focus();
    }, 0);
    setShowEmoji(false);
  }

  function handleContentChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const textarea = event.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 220)}px`;
    setContent(textarea.value);
  }

  function handlePhotoFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;
    if (isPhotoLocked) {
      toast.error("Hapus lampiran lain dulu sebelum menambah foto.");
      return;
    }

    const remainingSlots = MAX_PHOTOS - photos.length;
    if (remainingSlots <= 0) {
      toast.error("Foto maksimal 5 item.");
      return;
    }

    const accepted: PhotoDraft[] = [];
    for (const file of files.slice(0, remainingSlots)) {
      const extension = getExtension(file);
      if (
        !PHOTO_TYPES.includes(file.type) ||
        !PHOTO_EXTENSIONS.includes(extension)
      ) {
        toast.error("Format foto hanya JPG, PNG, WEBP, atau AVIF.");
        continue;
      }
      if (file.size > MAX_PHOTO_BYTES) {
        toast.error("Ukuran tiap foto maksimal 1MB.");
        continue;
      }
      accepted.push({
        id: `${file.name}-${file.lastModified}-${randomId()}`,
        file,
        previewUrl: createPreviewUrl(file),
      });
    }

    if (files.length > remainingSlots) {
      toast.error("Foto maksimal 5 item.");
    }
    if (accepted.length > 0) {
      clearVideo();
      setUrlValue("");
      setUrlActive(false);
      setPhotos((prev) => [...prev, ...accepted]);
    }
  }

  function handleVideoFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (isVideoLocked) {
      toast.error("Hapus lampiran lain dulu sebelum menambah video.");
      return;
    }

    const extension = getExtension(file);
    if (
      !VIDEO_TYPES.includes(file.type) ||
      !VIDEO_EXTENSIONS.includes(extension)
    ) {
      toast.error("Format video hanya MP4, WEBM, atau MOV.");
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      toast.error("Ukuran video maksimal 50MB.");
      return;
    }

    clearPhotos();
    setUrlValue("");
    setUrlActive(false);
    if (video) revokePreviewUrl(video.previewUrl);
    setVideo({ file, previewUrl: createPreviewUrl(file) });
  }

  function removePhoto(id: string) {
    setPhotos((prev) => {
      const target = prev.find((photo) => photo.id === id);
      if (target) revokePreviewUrl(target.previewUrl);
      return prev.filter((photo) => photo.id !== id);
    });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!content.trim()) {
      toast.error("Tulis sesuatu dulu sebelum memposting.");
      return;
    }
    if (attachmentMode === "url" && !hasValidUrl) {
      toast.error("URL belum valid.");
      return;
    }

    setSubmitting(true);
    try {
      let media: { type: FeedMediaTypeEnum; urls: string[] } | undefined;

      if (!quoteFeed) {
        if (photos.length > 0) {
          const urls = await Promise.all(
            photos.map((photo) => uploadFeedMedia(photo.file, userId, "photo"))
          );
          media = { type: "photo", urls };
        } else if (video) {
          const url = await uploadFeedMedia(video.file, userId, "video");
          media = { type: "video", urls: [url] };
        } else if (urlActive && urlValue.trim()) {
          media = { type: "url", urls: [normalizedUrl] };
        }
      }

      const result = await createFeed({
        content: content.trim(),
        ...(media ? { media } : {}),
        ...(quoteFeed ? { repost_of_id: quoteFeed.id } : {}),
      });

      if (!isSuccessStatus(result.status) || !result.data) {
        toast.error(
          result.message ??
            (quoteFeed
              ? "Gagal membuat quote repost."
              : "Gagal membuat postingan.")
        );
        return;
      }

      toast.success(
        quoteFeed
          ? "Quote repost berhasil dibuat."
          : "Postingan berhasil dibuat."
      );
      onCreated?.(result.data);
      clearAllMedia();
      setContent("");
      onClose();
    } catch (err) {
      console.error("[CreateFeedForms] create feed threw:", err);
      if (isStoragePolicyError(err)) {
        toast.error(
          "Upload media ditolak Supabase. Izinkan folder feed_media di bucket hmi-connect."
        );
      } else {
        toast.error(
          quoteFeed
            ? "Gagal membuat quote repost. Coba lagi."
            : "Gagal membuat postingan. Coba lagi."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Avatar src={avatar} name={fullName ?? "Kader"} size={44} />
        <div>
          <p className="font-semibold text-[#172033]">{fullName ?? "Kader"}</p>
          <p className="text-[13px] text-[#5f6573]">
            Posting ke feed HMI Connect
          </p>
        </div>
      </div>

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          placeholder={
            quoteFeed ? "Tambahkan komentar..." : "Apa yang ingin kamu bagikan?"
          }
          rows={5}
          disabled={submitting}
          className="max-h-56 min-h-36 w-full resize-none rounded-xl border border-transparent bg-white px-0 py-2 text-base leading-7 text-[#172033] placeholder:text-[#5f6573]/70 focus:outline-none disabled:cursor-not-allowed disabled:text-[#5f6573]"
        />
        <div className="relative" ref={emojiWrapperRef}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowEmoji((prev) => !prev)}
            disabled={submitting}
            className="size-9 rounded-full text-[#5f6573] hover:bg-[#f5f7fb]"
            aria-label="Tambah emoji"
          >
            <SmilePlus className="size-5" />
          </Button>
          {showEmoji && (
            <div className="absolute bottom-full left-0 z-[120] mb-2 overflow-hidden rounded-xl border border-[#e6e9ef] bg-white shadow-xl">
              <EmojiPicker
                open={showEmoji}
                onEmojiClick={handleEmojiClick}
                height={240}
                width={320}
                emojiStyle={EmojiStyle.NATIVE}
                theme={Theme.LIGHT}
                searchDisabled
                previewConfig={{ showPreview: false }}
              />
            </div>
          )}
        </div>
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="group relative aspect-square overflow-hidden rounded-xl bg-[#f5f7fb]"
            >
              <Image
                src={photo.previewUrl}
                alt={`Foto ${index + 1}`}
                fill
                unoptimized
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(photo.id)}
                disabled={submitting}
                className="absolute right-2 top-2 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/75 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Hapus foto"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {video && (
        <div className="relative overflow-hidden rounded-xl bg-black">
          <video
            src={video.previewUrl}
            controls
            className="max-h-80 w-full bg-black"
          />
          <button
            type="button"
            onClick={clearVideo}
            disabled={submitting}
            className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/75 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Hapus video"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {previewUrl && <LinkPreviewCard url={previewUrl} />}

      {quoteFeed && <QuotedFeed feed={quoteFeed} />}

      {!quoteFeed && (
        <div className="rounded-xl border border-[#e6e9ef] p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[#172033]">
              Tambahkan lampiran
            </p>
            {attachmentMode && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearAllMedia}
                disabled={submitting}
                className="text-destructive hover:bg-destructive-soft"
              >
                <Trash2 className="size-3.5" />
                Hapus
              </Button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => photoInputRef.current?.click()}
              disabled={
                submitting || isPhotoLocked || photos.length >= MAX_PHOTOS
              }
              className="h-11 rounded-lg border border-[#e6e9ef] text-[#5f6573] hover:bg-[#f5f7fb]"
            >
              <ImageIcon className="size-4 text-primary" />
              Foto
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => videoInputRef.current?.click()}
              disabled={submitting || isVideoLocked}
              className="h-11 rounded-lg border border-[#e6e9ef] text-[#5f6573] hover:bg-[#f5f7fb]"
            >
              <Video className="size-4 text-secondary" />
              Video
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                if (!isUrlLocked) setUrlActive(true);
              }}
              disabled={submitting || isUrlLocked}
              className="h-11 rounded-lg border border-[#e6e9ef] text-[#5f6573] hover:bg-[#f5f7fb]"
            >
              <Link2 className="size-4 text-[#5f6573]" />
              URL
            </Button>
          </div>

          {attachmentMode === "url" && (
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-[#5f6573]">
                  URL yang dibagikan
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setUrlValue("");
                    setUrlActive(false);
                    setPreviewUrl("");
                  }}
                  disabled={submitting}
                  className="flex size-7 items-center justify-center rounded-full text-[#5f6573] transition hover:bg-[#f5f7fb] hover:text-[#172033] disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Hapus URL"
                >
                  <X className="size-4" />
                </button>
              </div>
              <input
                type="url"
                value={urlValue}
                onChange={(event) => setUrlValue(event.target.value)}
                disabled={submitting}
                placeholder="https://contoh.com/artikel"
                className="w-full rounded-lg border border-[#dbe3ef] px-3 py-2 text-sm text-[#172033] outline-none transition placeholder:text-[#5f6573]/60 focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-[#f5f7fb]"
              />
              {urlValue.trim() && !hasValidUrl && (
                <p className="mt-1 text-xs text-destructive">
                  URL belum valid.
                </p>
              )}
            </div>
          )}

          <input
            ref={photoInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.avif"
            multiple
            className="hidden"
            onChange={handlePhotoFiles}
          />
          <input
            ref={videoInputRef}
            type="file"
            accept=".mp4,.webm,.mov"
            className="hidden"
            onChange={handleVideoFile}
          />
        </div>
      )}

      <div className="flex justify-end gap-2 border-t border-[#e6e9ef] pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={handleClose}
          disabled={submitting}
          className="text-[#5f6573]"
        >
          Batal
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {submitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : attachmentMode === "video" ? (
            <Play className="size-4" />
          ) : (
            <Send className="size-4" />
          )}
          {submitting
            ? "Memposting..."
            : quoteFeed
              ? "Quote Repost"
              : "Posting"}
        </Button>
      </div>
    </form>
  );
}
