"use client";

import Image from "next/image";
import {
  IconHeart,
  IconMessageCircle,
  IconRepeat,
  IconShare,
} from "@tabler/icons-react";
import Link from "next/link";
import {
  Ban,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreHorizontal,
  Pencil,
  Quote,
  Trash2,
  X,
} from "lucide-react";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";
import Avatar from "../common/Avatar";
import Dropdown from "../common/Dropdown";
import Button from "../buttons/Button";
import CommentItem from "./CommentItem";
import CommentSubmitter from "./CommentSubmitter";
import AutoplayVideo from "./AutoplayVideo";
import YouTubeEmbed from "./YouTubeEmbed";
import { parseYouTubeId } from "@/lib/youtube";
import LinkPreviewCard from "./LinkPreviewCard";
import ArticleAttachmentCard from "./ArticleAttachmentCard";
import NewsAttachmentCard from "./NewsAttachmentCard";
import TrainingAttachmentCard from "./TrainingAttachmentCard";
import QuotedFeed from "./QuotedFeed";
import FeedAuthorAvatar from "./FeedAuthorAvatar";
import EditFeedForm from "../forms/EditFeedForm";
import {
  FeedComposerModal,
  type ComposerAuthorEntity,
} from "../forms/CreateFeedForms";
import AlertConfirmation from "../modals/AlertConfirmation";
import ReactionPickerModal from "../modals/ReactionPickerModal";
import ReactorsListModal from "../modals/ReactorsListModal";
import FeedShareModal from "./FeedShareModal";
import { useReaction } from "@/hooks/useReaction";
import type {
  Feed,
  FeedArticleAttachment,
  FeedComment,
  FeedNewsAttachment,
  FeedTrainingAttachment,
  FeedUploadAttachment,
} from "@/apis/feeds";
import {
  createFeedComment,
  deleteFeed,
  listFeedComments,
  repostFeed,
  unrepostFeed,
} from "@/lib/actions";
import { resolveFeedAuthor } from "@/lib/feed-author";
import { formatRelativeTime } from "@/lib/time-manipulation";
import { useInteractionGuard } from "@/hooks/useInteractionGuard";
import {
  isSuccessStatus,
  type UserStatusEnum,
  type VerificationStatusEnum,
} from "@/lib/types";
import { useActingHref } from "@/hooks/useActingEntity";

interface FeedItemCardProps {
  surface?: "card" | "flat";
  feed: Feed;
  currentUserId?: string;
  currentUserName?: string;
  currentUserAvatar?: string;
  userStatus?: UserStatusEnum;
  verificationStatus?: VerificationStatusEnum;
  initialComments?: FeedComment[];
  defaultShowComments?: boolean;
  showViewPostAction?: boolean;
  initialReposted?: boolean;
  repostedBy?: { fullName: string; avatar?: string };
  onDeleted?: (feedId: string) => void;
  onFeedCreated?: (feed: Feed) => void;
  // Official-account pages pass this to every interaction so the entity, not
  // the human administrator, is the public actor.
  authorEntity?: ComposerAuthorEntity;
}

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
        className="relative mt-3 aspect-video w-full cursor-zoom-in overflow-hidden rounded-xl bg-[#f5f7fb]"
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
  // A temporary portrait ratio prevents a zero-width item while the image loads.
  const [aspectRatio, setAspectRatio] = useState(4 / 5);

  return (
    <button
      type="button"
      onClick={() => onPreview(photo)}
      style={{ aspectRatio }}
      className="relative h-full shrink-0 snap-start overflow-hidden rounded-xl bg-[#f5f7fb]"
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
      className="fixed inset-0 z-[80] bg-black/90"
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
            className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:left-6 sm:size-11"
            aria-label="Gambar sebelumnya"
          >
            <ChevronLeft className="size-6" />
          </button>
          <button
            type="button"
            onClick={() => movePhoto(1)}
            className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:right-6 sm:size-11"
            aria-label="Gambar berikutnya"
          >
            <ChevronRight className="size-6" />
          </button>
          <p className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-black/45 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {currentIndex + 1} / {orderedPhotos.length}
          </p>
        </>
      )}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        aria-label="Tutup"
      >
        <X className="size-5" />
      </button>
    </div>
  );
}

export default function FeedItemCard({
  surface = "card",
  feed,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  userStatus,
  verificationStatus,
  initialComments,
  defaultShowComments = false,
  showViewPostAction = true,
  initialReposted,
  repostedBy,
  onDeleted,
  onFeedCreated,
  authorEntity,
}: FeedItemCardProps) {
  const requireVerified = useInteractionGuard({
    userId: currentUserId,
    userStatus,
    verificationStatus,
  });
  const author = resolveFeedAuthor(feed);
  const reaction = useReaction("feed", feed.id, {
    myReaction: feed.my_reaction,
    total: feed.reaction_count.total,
    byType: feed.reaction_count.by_type,
    authorEntity,
  });
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showReactorsModal, setShowReactorsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showQuoteRepost, setShowQuoteRepost] = useState(false);
  const [content, setContent] = useState(feed.content);
  const [updatedAt, setUpdatedAt] = useState(feed.updated_at);
  const isEdited = updatedAt !== feed.created_at;
  const [previewPhoto, setPreviewPhoto] = useState<FeedUploadAttachment | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  const [reposted, setReposted] = useState(Boolean(initialReposted));
  const [reposting, startRepostTransition] = useTransition();
  const isOwnFeed = Boolean(currentUserId) && feed.creator_id === currentUserId;
  // Acting as an entity, your personal posts aren't the entity's to edit or delete.
  const isOwnPersonalFeed =
    !authorEntity && isOwnFeed && !feed.author_entity_type;
  const isOwnEntityFeed =
    Boolean(authorEntity) &&
    feed.author_entity_type === authorEntity?.type &&
    feed.author_entity_id === authorEntity?.id;
  // A grant holder can manage all feeds written as this entity, including a predecessor's.
  const canManageFeed = isOwnPersonalFeed || isOwnEntityFeed;
  const cannotRepost = isOwnPersonalFeed || isOwnEntityFeed;
  const hasOverflowActions = showViewPostAction || canManageFeed;

  const [showComments, setShowComments] = useState(defaultShowComments);
  const [comments, setComments] = useState<FeedComment[]>(
    initialComments ?? [],
  );
  const [commentsLoaded, setCommentsLoaded] = useState(
    initialComments !== undefined,
  );
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentCount, setCommentCount] = useState(feed.comment_count);
  const [topCommentDeleted, setTopCommentDeleted] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [postingComment, startCommentTransition] = useTransition();

  const attachments = feed.attachments ?? [];
  const actingHref = useActingHref();
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
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/feeds/${feed.id}`
      : "";
  const totalCommentCount = commentCount + feed.comment_reply_count;

  function handleReactionButtonClick() {
    if (!requireVerified()) return;
    if (reaction.activeReaction) {
      reaction.apply(null);
      return;
    }
    setShowReactionPicker(true);
  }

  function handleDeleteFeed() {
    setDeleting(true);
    deleteFeed(feed.id)
      .then((result) => {
        if (isSuccessStatus(result.status)) {
          onDeleted?.(feed.id);
        } else {
          toast.error(result.message ?? "Gagal menghapus postingan.");
        }
      })
      .finally(() => {
        setDeleting(false);
        setShowDeleteConfirm(false);
      });
  }

  function toggleRepost() {
    if (!requireVerified()) return;
    if (cannotRepost) return;

    const nextReposted = !reposted;
    setReposted(nextReposted);

    startRepostTransition(async () => {
      const result = nextReposted
        ? await repostFeed(feed.id, authorEntity)
        : await unrepostFeed(feed.id, authorEntity);

      if (!isSuccessStatus(result.status)) {
        setReposted(!nextReposted);
        toast.error(result.message ?? "Gagal memperbarui repost.");
      }
    });
  }

  function handleQuoteRepost() {
    if (!requireVerified()) return;
    setShowQuoteRepost(true);
  }

  function handleToggleComments() {
    const nextShow = !showComments;
    setShowComments(nextShow);

    if (nextShow && !commentsLoaded) {
      setLoadingComments(true);
      listFeedComments(feed.id)
        .then((result) => {
          setComments(result.list);
          setCommentsLoaded(true);
        })
        .finally(() => setLoadingComments(false));
    }
  }

  function handleCommentDeleted(commentId: string) {
    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    setCommentCount((prev) => Math.max(0, prev - 1));
    if (feed.top_comment?.id === commentId) {
      setTopCommentDeleted(true);
    }
  }

  function handleSubmitComment(event: FormEvent) {
    event.preventDefault();
    if (!requireVerified()) return;

    const trimmed = commentText.trim();
    if (!trimmed) return;

    startCommentTransition(async () => {
      const result = await createFeedComment(feed.id, trimmed, authorEntity);
      if (isSuccessStatus(result.status) && result.data) {
        setComments((prev) => [...prev, result.data as FeedComment]);
        setCommentCount((prev) => prev + 1);
        setCommentText("");
      } else {
        toast.error(result.message ?? "Gagal mengirim komentar.");
      }
    });
  }

  return (
    <article className={surface === "flat"
      ? "border-b border-[#e6e9ef] bg-white py-5"
      : "border border-x-0 border-[#e6e9ef] bg-white p-5 lg:rounded-2xl lg:border-x"}>
      {repostedBy && (
        <div className="mb-3 flex items-center gap-2 text-xs font-medium text-[#5f6573] xl:text-[13px]">
          <IconRepeat className="size-3.5" />
          <Avatar
            src={repostedBy.avatar}
            name={repostedBy.fullName}
            size={18}
          />
          <span>{repostedBy.fullName} membagikan ulang</span>
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <Link
          href={actingHref(author.href)}
          className="flex min-w-0 items-start gap-3"
        >
          {/* Two instances, not one CSS-scaled node: Avatar sizes itself with inline width/height. */}
          <span className="lg:hidden">
            <FeedAuthorAvatar author={author} size={surface === "flat" ? 36 : 40} />
          </span>
          <span className="hidden lg:block">
            <FeedAuthorAvatar author={author} size={surface === "flat" ? 36 : 44} />
          </span>
          <div className="min-w-0">
            <p className={`font-semibold text-[#172033] ${surface === "flat" ? "text-sm" : ""}`}>{author.name}</p>
            <p className={`text-xs text-[#5f6573] ${surface === "flat" ? "" : "xl:text-[13px]"}`}>
              {formatRelativeTime(feed.created_at)}
              {isEdited && " • Diedit"}
            </p>
          </div>
        </Link>
        {hasOverflowActions && (
          <Dropdown
            align="right"
            trigger={({ toggle }) => (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggle}
                className="size-8 shrink-0 rounded-full text-[#5f6573] hover:bg-[#f5f7fb]"
                aria-label="Opsi lainnya"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            )}
          >
            <div className="flex flex-col py-1">
              {showViewPostAction && (
                <Link
                  href={actingHref(`/feeds/${feed.id}`)}
                  className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-[#172033] transition hover:bg-[#f5f7fb] xl:text-[15px]"
                >
                  <Eye className="size-4 text-[#5f6573]" />
                  Lihat post
                </Link>
              )}
              {canManageFeed && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowEditForm(true)}
                    className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-[#172033] transition hover:bg-[#f5f7fb] xl:text-[15px]"
                  >
                    <Pencil className="size-4 text-[#5f6573]" />
                    Edit post
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-destructive transition hover:bg-destructive-soft xl:text-[15px]"
                  >
                    <Trash2 className="size-4" />
                    Delete post
                  </button>
                </>
              )}
            </div>
          </Dropdown>
        )}
      </div>

      <p className={`mt-3 whitespace-pre-line break-words text-[#172033] ${surface === "flat" ? "text-[13px] leading-5 sm:text-sm" : "text-sm leading-6 xl:text-[15px]"}`}>
        {content}
      </p>

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
          // Feeds posted before the YouTube-only composer still carry an uploaded file.
          <AutoplayVideo
            src={videoAttachment.reference_url}
            className="mt-3 w-full rounded-xl bg-black"
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
          isSignedIn={Boolean(currentUserId)}
        />
      )}
      {feed.repost_of ? (
        <QuotedFeed feed={feed.repost_of} linkToDetail />
      ) : (
        feed.repost_of_id && <DeletedQuotedFeed />
      )}

      {reaction.reactionCount > 0 && (
        <button
          type="button"
          onClick={() => setShowReactorsModal(true)}
          className="mt-3 flex cursor-pointer items-center gap-1 text-xs text-[#5f6573] xl:text-[13px]"
        >
          <span className="flex items-center -space-x-1">
            {(reaction.reactionEmojis.length > 0
              ? reaction.reactionEmojis
              : ["👍"]
            ).map((emoji, index) => (
              <span
                key={`${emoji}-${index}`}
                className="flex size-4 items-center justify-center rounded-full bg-white text-[10px] leading-none ring-1 ring-white"
              >
                {emoji}
              </span>
            ))}
          </span>
          {reaction.reactionCount}
        </button>
      )}

      <div className="mt-3 grid grid-cols-4 gap-1 border-t border-[#e6e9ef] pt-2">
        <div className="relative">
          <Button
            variant="ghost"
            onClick={handleReactionButtonClick}
            disabled={reaction.reacting}
            className={`w-full gap-1.5 rounded-lg py-2 hover:bg-[#f5f7fb] ${surface === "flat" ? "text-[13px]" : "text-sm xl:text-[15px]"} ${
              reaction.activeReaction ? "text-secondary" : "text-[#5f6573]"
            }`}
          >
            {reaction.activeReactionInfo ? (
              <span className="text-base leading-none">
                {reaction.activeReactionInfo.emoji}
              </span>
            ) : (
              <IconHeart className="size-4" />
            )}
            {reaction.reactionCount > 0 && reaction.reactionCount}
          </Button>
          <ReactionPickerModal
            open={showReactionPicker}
            onClose={() => setShowReactionPicker(false)}
            activeReaction={reaction.activeReaction}
            onSelect={(type) =>
              reaction.apply(reaction.activeReaction === type ? null : type)
            }
          />
        </div>
        <Button
          variant="ghost"
          onClick={handleToggleComments}
          className={`gap-1.5 rounded-lg py-2 text-[#5f6573] hover:bg-[#f5f7fb] ${surface === "flat" ? "text-[13px]" : "text-sm xl:text-[15px]"}`}
        >
          <IconMessageCircle className="size-4" />
          {totalCommentCount > 0 && totalCommentCount}
        </Button>
        <Dropdown
          align="right"
          trigger={({ toggle }) => (
            <Button
              variant="ghost"
              onClick={toggle}
              disabled={reposting}
              className={`w-full rounded-lg py-2 hover:bg-[#f5f7fb] ${surface === "flat" ? "text-[13px]" : "text-sm xl:text-[15px]"} ${
                reposted ? "text-secondary" : "text-[#5f6573]"
              }`}
            >
              <IconRepeat className="size-4" />
            </Button>
          )}
        >
          <div className="flex flex-col py-1">
            <button
              type="button"
              onClick={toggleRepost}
              disabled={cannotRepost}
              title={
                cannotRepost
                  ? "Tidak bisa me-repost postingan sendiri"
                  : undefined
              }
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-[#172033] transition hover:bg-[#f5f7fb] disabled:cursor-not-allowed disabled:text-[#c3c7d1] xl:text-[15px]"
            >
              <IconRepeat className="size-4 text-[#5f6573]" />
              {reposted ? "Batalkan Repost" : "Repost"}
            </button>
            <button
              type="button"
              onClick={handleQuoteRepost}
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-[#172033] transition hover:bg-[#f5f7fb] xl:text-[15px]"
            >
              <Quote className="size-4 text-[#5f6573]" />
              Quote Repost
            </button>
          </div>
        </Dropdown>
        <Button
          variant="ghost"
          onClick={() => setShowShareModal(true)}
          className={`rounded-lg py-2 text-[#5f6573] hover:bg-[#f5f7fb] ${surface === "flat" ? "text-[13px]" : "text-sm xl:text-[15px]"}`}
        >
          <IconShare className="size-4" />
        </Button>
      </div>

      {!showComments && feed.top_comment && !topCommentDeleted && (
        <div className="mt-3 border-t border-[#e6e9ef] pt-3">
          <CommentItem
            comment={feed.top_comment}
            userStatus={userStatus}
            verificationStatus={verificationStatus}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            currentUserAvatar={currentUserAvatar}
            authorEntity={authorEntity}
            onDeleted={handleCommentDeleted}
          />
          {commentCount > 1 && (
            <button
              type="button"
              onClick={handleToggleComments}
              className="mt-2 pl-3 text-xs font-semibold text-[#5f6573] hover:underline xl:text-[13px]"
            >
              Lihat {commentCount - 1} komentar lainnya
            </button>
          )}
        </div>
      )}

      {showComments && (
        <div className="mt-3 flex flex-col gap-3 border-t border-[#e6e9ef] pt-3">
          {loadingComments && (
            <p className="text-xs text-[#5f6573] xl:text-[13px]">
              Memuat komentar...
            </p>
          )}
          {!loadingComments && commentsLoaded && comments.length === 0 && (
            <p className="py-4 text-center text-[13px] text-[#5f6573] xl:text-sm">
              Jadilah yang pertama berkomentar!
            </p>
          )}
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              userStatus={userStatus}
              verificationStatus={verificationStatus}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              currentUserAvatar={currentUserAvatar}
              authorEntity={authorEntity}
              onDeleted={handleCommentDeleted}
            />
          ))}

          {currentUserId ? (
            <CommentSubmitter
              avatar={authorEntity?.imageUrl ?? currentUserAvatar}
              name={authorEntity?.name ?? currentUserName}
              value={commentText}
              onChange={setCommentText}
              onSubmit={handleSubmitComment}
              placeholder="Tulis komentar..."
              disabled={postingComment}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-[#dbe3ef] bg-[#f8fafc] px-4 py-3 text-sm text-[#5f6573] xl:text-[15px]">
              <Link
                href="/auth/login"
                className="font-semibold text-primary hover:underline"
              >
                Login
              </Link>{" "}
              untuk menambahkan komentar.
            </div>
          )}
        </div>
      )}

      <EditFeedForm
        open={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSaved={(updated) => {
          setContent(updated.content);
          setUpdatedAt(updated.updated_at);
          setShowEditForm(false);
        }}
        feedId={feed.id}
        initialContent={content}
      />
      <FeedComposerModal
        open={showQuoteRepost}
        onClose={() => setShowQuoteRepost(false)}
        fullName={currentUserName}
        avatar={currentUserAvatar}
        userId={currentUserId}
        quoteFeed={feed}
        authorEntity={authorEntity}
        onCreated={(created) => {
          setShowQuoteRepost(false);
          onFeedCreated?.(created);
        }}
      />
      <AlertConfirmation
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteFeed}
        title="Hapus Postingan?"
        message="Postingan yang sudah dihapus tidak bisa dikembalikan lagi."
        confirmLabel="Hapus"
        loading={deleting}
      />
      <ReactorsListModal
        open={showReactorsModal}
        onClose={() => setShowReactorsModal(false)}
        targetType="feed"
        targetId={feed.id}
      />
      <FeedShareModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        feed={feed}
        content={content}
        url={shareUrl}
      />
      <ImagePreviewModal
        photo={previewPhoto}
        photos={photoAttachments}
        onPhotoChange={setPreviewPhoto}
        onClose={() => setPreviewPhoto(null)}
      />
    </article>
  );
}

// A quote repost keeps its own words after the quoted feed is deleted — say so rather than showing an empty card.
function DeletedQuotedFeed() {
  return (
    <div className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-[#e6e9ef] bg-[#f9fafc] px-3 py-4 text-sm text-[#5f6573]">
      <Ban className="size-4 shrink-0" />
      Postingan yang dibagikan sudah dihapus.
    </div>
  );
}
