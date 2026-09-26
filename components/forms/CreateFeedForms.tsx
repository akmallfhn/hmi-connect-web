"use client";

import EmojiPicker, {
  EmojiClickData,
  EmojiStyle,
  Theme,
} from "emoji-picker-react";
import {
  IconBrandYoutube,
  IconLink,
  IconLoader2,
  IconMoodSmile,
  IconPhoto,
  IconX,
} from "@tabler/icons-react";
import Image from "next/image";
import {
  FormEvent,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import Avatar from "../common/Avatar";
import Dropdown from "../common/Dropdown";
import Button from "../buttons/Button";
import Modal from "../modals/Modal";
import LinkPreviewCard from "../feeds/LinkPreviewCard";
import ArticleAttachmentCard from "../feeds/ArticleAttachmentCard";
import NewsAttachmentCard from "../feeds/NewsAttachmentCard";
import QuotedFeed from "../feeds/QuotedFeed";
import YouTubeEmbed from "../feeds/YouTubeEmbed";
import { createFeed } from "@/lib/actions";
import { compressImage } from "@/lib/compress-image";
import { supabase } from "@/lib/supabase";
import { parseYouTubeId, youTubeWatchUrl } from "@/lib/youtube";
import {
  isSuccessStatus,
  type AccessEntityTypeEnum,
  type FeedAttachmentTypeEnum,
  type FeedUploadAttachmentTypeEnum,
} from "@/lib/types";
import type {
  CreateFeedPayload,
  Feed,
  FeedArticleAttachment,
  FeedNewsAttachment,
} from "@/apis/feeds";
import LogoHmi from "../svg/LogoHmi";

// Set on the official-account pages, where a post is published under the entity instead of the caller.
export type ComposerAuthorEntity = {
  type: AccessEntityTypeEnum;
  id: string;
  name: string;
  imageUrl?: string | null;
};

// Plain entity logo here — the ring and official badge mark a published feed, not a compose box.
function ComposerAvatar({
  authorEntity,
  fullName,
  avatar,
}: {
  authorEntity?: ComposerAuthorEntity;
  fullName?: string;
  avatar?: string;
}) {
  if (!authorEntity) {
    return <Avatar src={avatar} name={fullName ?? "Kader"} size={44} />;
  }

  return (
    <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f5f7fb]">
      {authorEntity.imageUrl ? (
        <Image
          src={authorEntity.imageUrl}
          alt={authorEntity.name}
          width={44}
          height={44}
          className="h-full w-full object-cover"
        />
      ) : (
        <LogoHmi className="size-6" />
      )}
    </span>
  );
}

// What a "bagikan ke feed" hand-off carries: the article id the backend links, plus enough to preview it.
export type ComposerNewsDraft = {
  id: string;
  title: string;
  sourceUrl: string;
  sourceName?: string;
  sourceLogoUrl?: string;
  imageUrl?: string;
  summary?: string;
};

// The article twin of the above — article_id is what feeds/create links, the rest only previews it.
export type ComposerArticleDraft = {
  id: string;
  title: string;
  slugUrl?: string;
  imageUrl?: string;
  description?: string;
  categoryName?: string;
  authorName?: string;
  authorAvatar?: string;
};

interface CreateFeedFormsProps {
  fullName?: string;
  avatar?: string;
  userId?: string;
  authorEntity?: ComposerAuthorEntity;
  onCreated?: (feed: Feed) => void;
  forceOpenSignal?: number;
  forceOpenNews?: ComposerNewsDraft;
  forceOpenArticle?: ComposerArticleDraft;
}

type PhotoDraft = {
  id: string;
  file: File;
  previewUrl: string;
};

const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const PHOTO_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif"];
const MAX_PHOTOS = 5;
const MAX_RAW_PHOTO_BYTES = 20 * 1024 * 1024;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

// The feed card's quick actions keep their labels; only the open composer goes icon-only.
const ACTIONS = [
  {
    label: "Foto",
    mode: "photo" as const,
    icon: IconPhoto,
    color: "text-primary",
  },
  {
    label: "Video",
    mode: "video" as const,
    icon: IconBrandYoutube,
    color: "text-secondary",
  },
  {
    label: "URL",
    mode: "url" as const,
    icon: IconLink,
    color: "text-[#5f6573]",
  },
];

// Layered on Button's ghost/icon variant: a round, muted glyph that stays flat while disabled.
const TOOL_BUTTON_CLASS =
  "size-9 rounded-full text-[#5f6573] hover:bg-[#f5f7fb] hover:text-[#172033] disabled:hover:bg-transparent";

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

async function uploadFeedPhoto(file: File, userId: string | undefined) {
  const extension = getExtension(file);
  const fileName = `photo-${Date.now()}-${randomId()}.${extension}`;
  const filePath = `feed_media/${userId ?? "anonymous"}/${fileName}`;
  return uploadPublicStorageFile(filePath, file);
}

// The composer previews through the same card the published feed renders, so the two can't drift.
function newsPreviewAttachment(news: ComposerNewsDraft): FeedNewsAttachment {
  return {
    id: `news-draft-${news.id}`,
    type: "news",
    reference_id: news.id,
    reference_index: 1,
    reference_url: news.sourceUrl,
    reference_title: news.title,
    reference_description: news.summary ?? null,
    reference_image_url: news.imageUrl ?? null,
    reference_source_name: news.sourceName ?? null,
    reference_source_logo_url: news.sourceLogoUrl ?? null,
    reference_is_deleted: false,
  };
}

// Previewed through the same card the published feed renders, same reasoning as news above.
function articlePreviewAttachment(
  article: ComposerArticleDraft,
): FeedArticleAttachment {
  return {
    id: `article-draft-${article.id}`,
    type: "article",
    article_id: article.id,
    reference_index: 1,
    reference_title: article.title,
    reference_description: article.description ?? null,
    reference_image_url: article.imageUrl ?? null,
    reference_slug_url: article.slugUrl ?? null,
    reference_category_id: null,
    reference_category_name: article.categoryName ?? null,
    reference_author_id: null,
    reference_author_name: article.authorName ?? null,
    reference_author_avatar: article.authorAvatar ?? null,
    reference_is_deleted: false,
  };
}

export default function CreateFeedForms({
  fullName,
  avatar,
  userId,
  authorEntity,
  onCreated,
  forceOpenSignal,
  forceOpenNews,
  forceOpenArticle,
}: CreateFeedFormsProps) {
  const [open, setOpen] = useState(false);
  const [initialMode, setInitialMode] =
    useState<FeedUploadAttachmentTypeEnum | null>(null);
  const [initialNews, setInitialNews] = useState<ComposerNewsDraft | undefined>(
    undefined,
  );
  const [initialArticle, setInitialArticle] = useState<
    ComposerArticleDraft | undefined
  >(undefined);
  const [seenForceOpenSignal, setSeenForceOpenSignal] =
    useState(forceOpenSignal);
  const firstName = (fullName ?? "Kader").split(" ")[0];
  const composerPrompt = authorEntity
    ? "Bagikan sesuatu..."
    : `Apa yang ingin kamu bagikan, ${firstName}?`;

  function openComposer(
    mode: FeedUploadAttachmentTypeEnum | null = null,
    news?: ComposerNewsDraft,
    article?: ComposerArticleDraft,
  ) {
    setInitialMode(mode);
    setInitialNews(news);
    setInitialArticle(article);
    setOpen(true);
  }

  if (forceOpenSignal !== seenForceOpenSignal) {
    setSeenForceOpenSignal(forceOpenSignal);
    if (forceOpenSignal) {
      if (forceOpenNews) openComposer(null, forceOpenNews);
      else if (forceOpenArticle)
        openComposer(null, undefined, forceOpenArticle);
      else openComposer();
    }
  }

  return (
    <>
      <div className="relative z-20 -mt-16 mx-4 rounded-2xl border border-[#e6e9ef] bg-white p-4 lg:mx-0 lg:mt-0">
        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            <ComposerAvatar
              authorEntity={authorEntity}
              fullName={fullName}
              avatar={avatar}
            />
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
            {composerPrompt}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-around border-t border-[#e6e9ef] pt-3">
          {ACTIONS.map(({ label, mode, icon: Icon, color }) => (
            <Button
              key={mode}
              type="button"
              variant="ghost"
              onClick={() => openComposer(mode)}
              className="gap-2 rounded-lg px-3 py-1.5 text-sm text-[#5f6573] hover:bg-[#f5f7fb]"
            >
              <Icon className={`size-4 ${color}`} stroke={2} />
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
        authorEntity={authorEntity}
        initialMode={initialMode}
        initialNews={initialNews}
        initialArticle={initialArticle}
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
  authorEntity?: ComposerAuthorEntity;
  initialMode?: FeedUploadAttachmentTypeEnum | null;
  initialNews?: ComposerNewsDraft;
  initialArticle?: ComposerArticleDraft;
  quoteFeed?: Feed;
  onCreated?: (feed: Feed) => void;
}

// Exported so FeedItemCard's "Quote Repost" action can open this same modal externally.
export function FeedComposerModal({
  open,
  onClose,
  fullName,
  avatar,
  userId,
  authorEntity,
  initialMode,
  initialNews,
  initialArticle,
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
          initialNews={initialNews}
          initialArticle={initialArticle}
          quoteFeed={quoteFeed}
          authorEntity={authorEntity}
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
  authorEntity?: ComposerAuthorEntity;
  initialMode?: FeedUploadAttachmentTypeEnum | null;
  initialNews?: ComposerNewsDraft;
  initialArticle?: ComposerArticleDraft;
  quoteFeed?: Feed;
  onClose: () => void;
  onCreated?: (feed: Feed) => void;
}

function FeedComposerFields({
  fullName,
  avatar,
  userId,
  authorEntity,
  initialMode,
  initialNews,
  initialArticle,
  quoteFeed,
  onClose,
  onCreated,
}: FeedComposerFieldsProps) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewUrlsRef = useRef(new Set<string>());
  const [content, setContent] = useState("");
  const [photos, setPhotos] = useState<PhotoDraft[]>([]);
  const [compressingPhotos, setCompressingPhotos] = useState(false);
  const [youtubeValue, setYoutubeValue] = useState("");
  const [youtubeActive, setYoutubeActive] = useState(initialMode === "video");
  const [urlValue, setUrlValue] = useState("");
  const [urlActive, setUrlActive] = useState(initialMode === "url");
  const [news, setNews] = useState<ComposerNewsDraft | null>(
    initialNews ?? null,
  );
  const [article, setArticle] = useState<ComposerArticleDraft | null>(
    initialArticle ?? null,
  );
  const [previewUrl, setPreviewUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const attachmentMode: FeedAttachmentTypeEnum | null = photos.length
    ? "photo"
    : youtubeActive
      ? "video"
      : urlActive
        ? "url"
        : news
          ? "news"
          : article
            ? "article"
            : null;
  const normalizedUrl = normalizeUrl(urlValue);
  const hasValidUrl = urlValue.trim() ? isValidUrl(urlValue) : false;
  const youtubeId = parseYouTubeId(youtubeValue);
  const canSubmit =
    Boolean(content.trim()) &&
    !submitting &&
    !(attachmentMode === "url" && !hasValidUrl) &&
    !(attachmentMode === "video" && !youtubeId);
  // Photos stack up to five; video, url, news, and article each fill the one slot alone.
  const isPhotoLocked = attachmentMode !== null && attachmentMode !== "photo";
  const isVideoLocked = attachmentMode !== null;
  const isUrlLocked = attachmentMode !== null;

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
      delay,
    );
    return () => window.clearTimeout(timeoutId);
  }, [hasValidUrl, normalizedUrl, urlActive]);

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

  function clearYouTube() {
    setYoutubeValue("");
    setYoutubeActive(false);
  }

  function clearUrl() {
    setUrlValue("");
    setUrlActive(false);
    setPreviewUrl("");
  }

  function clearAttachment() {
    clearPhotos();
    clearYouTube();
    clearUrl();
    setNews(null);
    setArticle(null);
  }

  function handleClose() {
    clearAttachment();
    onClose();
  }

  function handleEmojiClick(emojiData: EmojiClickData) {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent((prev) => `${prev}${emojiData.emoji}`);
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
  }

  function handleContentChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const textarea = event.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 220)}px`;
    setContent(textarea.value);
  }

  async function handlePhotoFiles(event: ChangeEvent<HTMLInputElement>) {
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

    const candidates = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      toast.error("Foto maksimal 5 item.");
    }

    const accepted: PhotoDraft[] = [];
    setCompressingPhotos(true);
    try {
      // Sequential, not Promise.all — avoids spiking the main thread with several compressions at once.
      for (const file of candidates) {
        const extension = getExtension(file);
        if (
          !PHOTO_TYPES.includes(file.type) ||
          !PHOTO_EXTENSIONS.includes(extension)
        ) {
          toast.error("Format foto hanya JPG, PNG, WEBP, atau AVIF.");
          continue;
        }
        if (file.size > MAX_RAW_PHOTO_BYTES) {
          toast.error("Ukuran foto maksimal 20MB.");
          continue;
        }
        const compressed = await compressImage(file);
        if (compressed.size > MAX_PHOTO_BYTES) {
          toast.error("Foto masih terlalu besar setelah dikompres.");
          continue;
        }
        accepted.push({
          id: `${file.name}-${file.lastModified}-${randomId()}`,
          file: compressed,
          previewUrl: createPreviewUrl(compressed),
        });
      }
    } finally {
      setCompressingPhotos(false);
    }

    if (accepted.length > 0) {
      setPhotos((prev) => [...prev, ...accepted]);
    }
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
    if (attachmentMode === "video" && !youtubeId) {
      toast.error("Link YouTube belum valid.");
      return;
    }

    setSubmitting(true);
    try {
      let attachment: NonNullable<CreateFeedPayload["attachment"]> | undefined;

      if (!quoteFeed) {
        if (photos.length > 0) {
          const urls = await Promise.all(
            photos.map((photo) => uploadFeedPhoto(photo.file, userId)),
          );
          attachment = { type: "photo", urls };
        } else if (youtubeActive && youtubeId) {
          attachment = { type: "video", urls: [youTubeWatchUrl(youtubeId)] };
        } else if (urlActive && urlValue.trim()) {
          attachment = { type: "url", urls: [normalizedUrl] };
        } else if (news) {
          attachment = { type: "news", reference_id: news.id };
        } else if (article) {
          attachment = { type: "article", article_id: article.id };
        }
      }

      const result = await createFeed({
        content: content.trim(),
        ...(attachment ? { attachment } : {}),
        ...(quoteFeed ? { repost_of_id: quoteFeed.id } : {}),
        ...(authorEntity
          ? {
              author_entity_type: authorEntity.type,
              author_entity_id: authorEntity.id,
            }
          : {}),
      });

      if (!isSuccessStatus(result.status) || !result.data) {
        toast.error(
          result.message ??
            (quoteFeed
              ? "Gagal membuat quote repost."
              : "Gagal membuat postingan."),
        );
        return;
      }

      toast.success(
        quoteFeed
          ? "Quote repost berhasil dibuat."
          : "Postingan berhasil dibuat.",
      );
      onCreated?.(result.data);
      clearAttachment();
      setContent("");
      onClose();
    } catch (err) {
      console.error("[CreateFeedForms] create feed threw:", err);
      if (isStoragePolicyError(err)) {
        toast.error(
          "Upload media ditolak Supabase. Izinkan folder feed_media di bucket hmi-connect.",
        );
      } else {
        toast.error(
          quoteFeed
            ? "Gagal membuat quote repost. Coba lagi."
            : "Gagal membuat postingan. Coba lagi.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <ComposerAvatar
          authorEntity={authorEntity}
          fullName={fullName}
          avatar={avatar}
        />
        <div>
          <p className="font-semibold text-[#172033]">
            {authorEntity ? authorEntity.name : (fullName ?? "Kader")}
          </p>
          <p className="text-[13px] text-[#5f6573]">
            {authorEntity
              ? "Posting sebagai akun resmi"
              : "Posting ke feed HMI Connect"}
          </p>
        </div>
      </div>

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
              <Button
                type="button"
                onClick={() => removePhoto(photo.id)}
                disabled={submitting}
                variant="dark"
                size="iconSm"
                className="absolute right-2 top-2"
                aria-label="Hapus foto"
              >
                <IconX className="size-4" stroke={2} />
              </Button>
            </div>
          ))}
        </div>
      )}

      {attachmentMode === "video" && (
        <AttachmentInput
          icon={<IconBrandYoutube className="size-5" stroke={1.75} />}
          value={youtubeValue}
          onChange={setYoutubeValue}
          onRemove={clearYouTube}
          placeholder="Tempel link YouTube"
          invalidMessage={
            youtubeValue.trim() && !youtubeId
              ? "Link YouTube belum valid."
              : undefined
          }
          removeLabel="Hapus video"
          disabled={submitting}
        />
      )}
      {attachmentMode === "video" && youtubeId && (
        <YouTubeEmbed videoId={youtubeId} />
      )}

      {attachmentMode === "url" && (
        <AttachmentInput
          icon={<IconLink className="size-5" stroke={1.75} />}
          value={urlValue}
          onChange={setUrlValue}
          onRemove={clearUrl}
          placeholder="https://contoh.com/artikel"
          invalidMessage={
            urlValue.trim() && !hasValidUrl ? "URL belum valid." : undefined
          }
          removeLabel="Hapus tautan"
          disabled={submitting}
        />
      )}
      {previewUrl && <LinkPreviewCard url={previewUrl} />}

      {news && (
        <div className="relative">
          <NewsAttachmentCard attachment={newsPreviewAttachment(news)} />
          <Button
            type="button"
            onClick={() => setNews(null)}
            disabled={submitting}
            variant="dark"
            size="iconSm"
            className="absolute right-2 top-5"
            aria-label="Hapus berita"
          >
            <IconX className="size-4" stroke={2} />
          </Button>
        </div>
      )}

      {article && (
        <div className="relative">
          <ArticleAttachmentCard
            attachment={articlePreviewAttachment(article)}
          />
          <Button
            type="button"
            onClick={() => setArticle(null)}
            disabled={submitting}
            variant="dark"
            size="iconSm"
            className="absolute right-2 top-5"
            aria-label="Hapus artikel"
          >
            <IconX className="size-4" stroke={2} />
          </Button>
        </div>
      )}

      {quoteFeed && <QuotedFeed feed={quoteFeed} />}

      <div className="flex items-center justify-between gap-3 border-t border-[#e6e9ef] pt-3">
        <div className="flex items-center gap-1">
          {!quoteFeed && (
            <>
              <Button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={
                  submitting ||
                  isPhotoLocked ||
                  photos.length >= MAX_PHOTOS ||
                  compressingPhotos
                }
                aria-label="Tambah foto"
                title="Tambah foto"
                variant="ghost"
                size="icon"
                className={TOOL_BUTTON_CLASS}
              >
                {compressingPhotos ? (
                  <IconLoader2 className="size-5 animate-spin" stroke={1.75} />
                ) : (
                  <IconPhoto className="size-5" stroke={1.75} />
                )}
              </Button>
              <Button
                type="button"
                onClick={() => setYoutubeActive(true)}
                disabled={submitting || isVideoLocked}
                aria-label="Tambah video YouTube"
                title="Tambah video YouTube"
                variant="ghost"
                size="icon"
                className={TOOL_BUTTON_CLASS}
              >
                <IconBrandYoutube className="size-5" stroke={1.75} />
              </Button>
              <Button
                type="button"
                onClick={() => setUrlActive(true)}
                disabled={submitting || isUrlLocked}
                aria-label="Tambah tautan"
                title="Tambah tautan"
                variant="ghost"
                size="icon"
                className={TOOL_BUTTON_CLASS}
              >
                <IconLink className="size-5" stroke={1.75} />
              </Button>
            </>
          )}
          {/* Portaled, so the picker isn't clipped by the modal's own scroll area. */}
          <Dropdown
            align="left"
            trigger={({ toggle }) => (
              <Button
                type="button"
                onClick={toggle}
                disabled={submitting}
                aria-label="Tambah emoji"
                title="Tambah emoji"
                variant="ghost"
                size="icon"
                className={TOOL_BUTTON_CLASS}
              >
                <IconMoodSmile className="size-5" stroke={1.75} />
              </Button>
            )}
          >
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              height={320}
              width="100%"
              emojiStyle={EmojiStyle.NATIVE}
              theme={Theme.LIGHT}
              searchDisabled
              previewConfig={{ showPreview: false }}
            />
          </Dropdown>
        </div>

        <div className="flex items-center gap-2">
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
            {submitting && <IconLoader2 className="size-4 animate-spin" />}
            {submitting
              ? "Memposting..."
              : quoteFeed
                ? "Quote Repost"
                : "Posting"}
          </Button>
        </div>
      </div>

      <input
        ref={photoInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.avif"
        multiple
        className="hidden"
        onChange={handlePhotoFiles}
      />
    </form>
  );
}

function AttachmentInput({
  icon,
  value,
  onChange,
  onRemove,
  placeholder,
  invalidMessage,
  removeLabel,
  disabled,
}: {
  icon: ReactNode;
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  placeholder: string;
  invalidMessage?: string;
  removeLabel: string;
  disabled: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 rounded-xl border border-[#dbe3ef] py-1 pl-3 pr-1 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
        <span className="shrink-0 text-[#5f6573]">{icon}</span>
        <input
          type="url"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          autoFocus
          className="min-w-0 flex-1 bg-transparent py-1.5 text-sm text-[#172033] outline-none placeholder:text-[#5f6573]/60 disabled:cursor-not-allowed"
        />
        <Button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          aria-label={removeLabel}
          variant="ghost"
          size="iconSm"
          className="size-8 shrink-0 text-[#5f6573] hover:bg-[#f5f7fb] hover:text-[#172033]"
        >
          <IconX className="size-4" stroke={2} />
        </Button>
      </div>
      {invalidMessage && (
        <p className="mt-1 text-xs text-destructive">{invalidMessage}</p>
      )}
    </div>
  );
}
