"use client";

import Image from "next/image";
import ImagePreviewOverlay from "../modals/ImagePreviewOverlay";
import {
  IconHeart,
  IconMessageCircle,
  IconRefresh,
  IconShare2,
} from "@tabler/icons-react";
import Link from "next/link";
import {
  Ban,
  Eye,
  MoreHorizontal,
  Pencil,
  Quote,
  Trash2,
} from "lucide-react";
import {
  FormEvent,
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

function formatActionCount(count: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(count).toLowerCase();
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
  // A temporary portrait ratio prevents a zero-width item while the image loads.
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
  const reactionButtonRef = useRef<HTMLButtonElement>(null);
  const [showReactorsModal, setShowReactorsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showQuoteRepost, setShowQuoteRepost] = useState(false);
  const [content, setContent] = useState(feed.content);
  const [updatedAt, setUpdatedAt] = useState(feed.updated_at);
  const isEdited = updatedAt !== feed.created_at;
  const [previewPhotoId, setPreviewPhotoId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [reposted, setReposted] = useState(Boolean(initialReposted));
  const [repostCount, setRepostCount] = useState(feed.repost_count ?? 0);
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

  const [comments, setComments] = useState<FeedComment[]>(
    initialComments ?? [],
  );
  const [commentCount, setCommentCount] = useState(feed.comment_count);
  const [commentText, setCommentText] = useState("");
  const [postingComment, startCommentTransition] = useTransition();

  const attachments = feed.attachments ?? [];
  const actingHref = useActingHref();
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
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/feeds/${feed.id}`
      : "";
  const totalCommentCount = commentCount + feed.comment_reply_count;
  const actionClassName =
    "inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full px-2.5 text-sm text-muted-foreground transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60 sm:px-3";

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
    setRepostCount((count) => Math.max(0, count + (nextReposted ? 1 : -1)));

    startRepostTransition(async () => {
      const result = nextReposted
        ? await repostFeed(feed.id, authorEntity)
        : await unrepostFeed(feed.id, authorEntity);

      if (!isSuccessStatus(result.status)) {
        setReposted(!nextReposted);
        setRepostCount((count) => Math.max(0, count + (nextReposted ? -1 : 1)));
        toast.error(result.message ?? "Gagal memperbarui repost.");
      }
    });
  }

  function handleQuoteRepost() {
    if (!requireVerified()) return;
    setShowQuoteRepost(true);
  }

  function handleCommentDeleted(commentId: string) {
    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    setCommentCount((prev) => Math.max(0, prev - 1));
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
      ? "border-b border-border bg-surface py-5"
      : "border border-x-0 border-border bg-surface p-5 lg:rounded-2xl lg:border-x"}>
      {repostedBy && (
        <div className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground xl:text-[13px]">
          <IconRefresh className="size-3.5" />
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
            <p className={`font-semibold text-heading ${surface === "flat" ? "text-sm" : ""}`}>{author.name}</p>
            <p className={`text-xs text-muted-foreground ${surface === "flat" ? "" : "xl:text-[13px]"}`}>
              {formatRelativeTime(feed.created_at)}
              {isEdited && " • Diedit"}
            </p>
          </div>
        </Link>
        {hasOverflowActions && (
          <Dropdown
            align="right"
            closeOnScroll
            trigger={({ toggle }) => (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggle}
                className="size-8 shrink-0 rounded-full text-muted-foreground hover:bg-surface-muted"
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
                  className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-heading transition hover:bg-surface-muted xl:text-[15px]"
                >
                  <Eye className="size-4 text-muted-foreground" />
                  Lihat post
                </Link>
              )}
              {canManageFeed && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowEditForm(true)}
                    className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-heading transition hover:bg-surface-muted xl:text-[15px]"
                  >
                    <Pencil className="size-4 text-muted-foreground" />
                    Edit post
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-destructive-foreground transition hover:bg-destructive-soft xl:text-[15px]"
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

      <p className={`mt-3 whitespace-pre-line break-words text-content-foreground ${surface === "flat" ? "text-[13px] leading-5 sm:text-sm" : "text-sm leading-6 xl:text-[15px]"}`}>
        {content}
      </p>

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
          // Feeds posted before the YouTube-only composer still carry an uploaded file.
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
          isSignedIn={Boolean(currentUserId)}
        />
      )}
      {feed.repost_of ? (
        <QuotedFeed feed={feed.repost_of} linkToDetail />
      ) : (
        feed.repost_of_id && <DeletedQuotedFeed />
      )}

      <div className="mt-4 flex items-center gap-1 overflow-x-auto [scrollbar-width:none] lg:overflow-visible [&::-webkit-scrollbar]:hidden">
        <div className="relative flex shrink-0 items-center rounded-full transition-colors hover:bg-surface-muted focus-within:bg-surface-muted">
          <button
            ref={reactionButtonRef}
            type="button"
            onClick={handleReactionButtonClick}
            disabled={reaction.reacting}
            aria-label={reaction.activeReaction ? `Batalkan reaksi ${reaction.activeReactionInfo?.label ?? ""}`.trim() : "Beri reaksi"}
            className={`inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full ${showViewPostAction ? "px-2.5 sm:px-3" : "pl-2.5"} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60`}
          >
            {reaction.activeReactionInfo ? (
              <span className="text-xl leading-none" role="img" aria-label={reaction.activeReactionInfo.label}>
                {reaction.activeReactionInfo.emoji}
              </span>
            ) : (
              <IconHeart className="size-5 text-muted-foreground" />
            )}
            {showViewPostAction && (
              <span className="text-sm text-muted-foreground">{formatActionCount(reaction.reactionCount)}</span>
            )}
          </button>
          {!showViewPostAction && (reaction.reactionCount > 0 ? (
            <button
              type="button"
              onClick={() => setShowReactorsModal(true)}
              aria-label={`Lihat ${reaction.reactionCount.toLocaleString("id-ID")} reaksi`}
              className="h-10 cursor-pointer rounded-r-full pr-3 text-sm text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              {formatActionCount(reaction.reactionCount)}
            </button>
          ) : (
            <span className="pr-3 text-sm text-muted-foreground">0</span>
          ))}
          <ReactionPickerModal
            open={showReactionPicker}
            anchorRef={reactionButtonRef}
            onClose={() => setShowReactionPicker(false)}
            activeReaction={reaction.activeReaction}
            onSelect={(type) =>
              reaction.apply(reaction.activeReaction === type ? null : type)
            }
          />
        </div>
        {showViewPostAction ? (
          <Link
            href={actingHref(`/feeds/${feed.id}`)}
            aria-label={`Lihat ${totalCommentCount.toLocaleString("id-ID")} komentar`}
            className={actionClassName}
          >
            <IconMessageCircle className="size-5" />
            {formatActionCount(totalCommentCount)}
          </Link>
        ) : (
          <a
            href={`#feed-comments-${feed.id}`}
            aria-label={`Lihat ${totalCommentCount.toLocaleString("id-ID")} komentar`}
            className={actionClassName}
          >
            <IconMessageCircle className="size-5" />
            {formatActionCount(totalCommentCount)}
          </a>
        )}
        <Dropdown
          align="left"
          trigger={({ toggle }) => (
            <button
              type="button"
              onClick={toggle}
              disabled={reposting}
              aria-label={`Bagikan ulang, ${repostCount.toLocaleString("id-ID")} repost`}
              className={`${actionClassName} ${reposted ? "text-secondary-foreground" : ""}`}
            >
              <IconRefresh className="size-5" />
              {formatActionCount(repostCount)}
            </button>
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
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-heading transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:text-disabled-foreground xl:text-[15px]"
            >
              <IconRefresh className="size-4 text-muted-foreground" />
              {reposted ? "Batalkan Repost" : "Repost"}
            </button>
            <button
              type="button"
              onClick={handleQuoteRepost}
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-heading transition hover:bg-surface-muted xl:text-[15px]"
            >
              <Quote className="size-4 text-muted-foreground" />
              Quote Repost
            </button>
          </div>
        </Dropdown>
        <button
          type="button"
          onClick={() => setShowShareModal(true)}
          aria-label="Bagikan postingan"
          className={actionClassName}
        >
          <IconShare2 className="size-5" />
        </button>
      </div>

      {defaultShowComments && (
        <div id={`feed-comments-${feed.id}`} className="mt-3 flex scroll-mt-20 flex-col gap-3 border-t border-border pt-3">
          {comments.length === 0 && (
            <p className="py-4 text-center text-[13px] text-muted-foreground xl:text-sm">
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
            <div className="rounded-xl border border-dashed border-border-strong bg-surface-subtle px-4 py-3 text-sm text-muted-foreground xl:text-[15px]">
              <Link
                href="/auth/login"
                className="font-semibold text-primary-foreground hover:underline"
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
          setRepostCount((count) => count + 1);
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
      <ImagePreviewOverlay
        images={previewImages}
        activeId={previewPhotoId}
        onActiveChange={setPreviewPhotoId}
        onClose={() => setPreviewPhotoId(null)}
        downloadName={`hmi-connect-feed-${feed.id}`}
      />
    </article>
  );
}

// A quote repost keeps its own words after the quoted feed is deleted — say so rather than showing an empty card.
function DeletedQuotedFeed() {
  return (
    <div className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-border bg-surface-subtle px-3 py-4 text-sm text-muted-foreground">
      <Ban className="size-4 shrink-0" />
      Postingan yang dibagikan sudah dihapus.
    </div>
  );
}
