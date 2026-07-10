"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Quote,
  Repeat2,
  Share2,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import Avatar from "../common/Avatar";
import Dropdown from "../common/Dropdown";
import Button from "../buttons/Button";
import CommentItem from "./CommentItem";
import CommentSubmitter from "./CommentSubmitter";
import LinkPreviewCard from "./LinkPreviewCard";
import QuotedFeed from "./QuotedFeed";
import EditFeedForm from "../forms/EditFeedForm";
import { FeedComposerModal } from "../forms/CreateFeedForms";
import AlertConfirmation from "../modals/AlertConfirmation";
import ReactionPickerModal from "../modals/ReactionPickerModal";
import ReactorsListModal from "../modals/ReactorsListModal";
import ShareModal from "../modals/ShareModal";
import { useReaction } from "@/hooks/useReaction";
import type { Feed, FeedComment, FeedMedia } from "@/apis/feeds";
import {
  createFeedComment,
  deleteFeed,
  listFeedComments,
  repostFeed,
  unrepostFeed,
} from "@/lib/actions";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import { isSuccessStatus } from "@/lib/types";

interface FeedItemCardProps {
  feed: Feed;
  currentUserId?: string;
  currentUserName?: string;
  currentUserAvatar?: string;
  isVerified?: boolean;
  initialComments?: FeedComment[];
  defaultShowComments?: boolean;
  initialReposted?: boolean;
  onDeleted?: (feedId: string) => void;
  onFeedCreated?: (feed: Feed) => void;
}

function MediaGrid({
  media,
  onPreview,
}: {
  media: NonNullable<Feed["media"]>;
  onPreview: (photo: FeedMedia) => void;
}) {
  const photos = [...media].sort((a, b) => a.index - b.index);
  const visible = photos.slice(0, 4);
  const overflow = photos.length - visible.length;

  if (photos.length === 1) {
    return (
      <button
        type="button"
        onClick={() => onPreview(photos[0])}
        className="relative mt-3 aspect-video w-full cursor-zoom-in overflow-hidden rounded-xl bg-[#f5f7fb]"
        aria-label="Buka pratinjau gambar"
      >
        <Image src={photos[0].url} alt="" fill className="object-cover" unoptimized />
      </button>
    );
  }

  return (
    <div className="mt-3 grid grid-cols-2 gap-1 overflow-hidden rounded-xl">
      {visible.map((photo, idx) => {
        const isLastVisible = idx === visible.length - 1;
        const spanFull = photos.length === 3 && idx === 0;
        return (
          <button
            type="button"
            key={photo.id}
            onClick={() => onPreview(photo)}
            className={`relative aspect-square bg-[#f5f7fb] ${spanFull ? "col-span-2" : ""}`}
            aria-label="Buka pratinjau gambar"
          >
            <Image src={photo.url} alt="" fill className="object-cover" unoptimized />
            {isLastVisible && overflow > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-semibold text-white">
                +{overflow}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function ImagePreviewModal({
  photo,
  onClose,
}: {
  photo: FeedMedia | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!photo) return;

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

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousOverflow;
      document.body.style.position = previousPosition;
      document.body.style.top = previousTop;
      document.body.style.width = previousWidth;
      window.scrollTo(0, scrollY);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [photo, onClose]);

  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-black/90">
      <button
        type="button"
        className="absolute inset-0 cursor-zoom-out"
        onClick={onClose}
        aria-label="Tutup pratinjau gambar"
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-3 sm:p-8">
        <div className="relative max-h-full w-full max-w-6xl">
          <Image
            src={photo.url}
            alt=""
            width={1600}
            height={1200}
            className="mx-auto max-h-[92vh] w-auto max-w-full object-contain"
            unoptimized
          />
        </div>
      </div>
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
  feed,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  isVerified,
  initialComments,
  defaultShowComments = false,
  initialReposted,
  onDeleted,
  onFeedCreated,
}: FeedItemCardProps) {
  const router = useRouter();
  const reaction = useReaction("feed", feed.id, {
    myReaction: feed.my_reaction,
    total: feed.reaction_count.total,
    byType: feed.reaction_count.by_type,
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
  const [previewPhoto, setPreviewPhoto] = useState<FeedMedia | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [reposted, setReposted] = useState(Boolean(initialReposted));
  const [reposting, startRepostTransition] = useTransition();
  const isOwnFeed = Boolean(currentUserId) && feed.creator_id === currentUserId;

  const [showComments, setShowComments] = useState(defaultShowComments);
  const [comments, setComments] = useState<FeedComment[]>(initialComments ?? []);
  const [commentsLoaded, setCommentsLoaded] = useState(
    initialComments !== undefined
  );
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentCount, setCommentCount] = useState(feed.comment_count);
  const [topCommentDeleted, setTopCommentDeleted] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [postingComment, startCommentTransition] = useTransition();

  const photoMedia = feed.media?.filter((item) => item.type === "photo");
  const videoMedia = feed.media?.find((item) => item.type === "video");
  const urlMedia = feed.media?.find((item) => item.type === "url");
  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}/feeds/${feed.id}` : "";
  const totalCommentCount = commentCount + feed.comment_reply_count;

  function requireVerified(): boolean {
    if (!currentUserId) {
      router.push("/auth/login");
      return false;
    }
    if (isVerified) return true;
    router.push("/verification");
    return false;
  }

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
    if (isOwnFeed) return;

    const nextReposted = !reposted;
    setReposted(nextReposted);

    startRepostTransition(async () => {
      const result = nextReposted ? await repostFeed(feed.id) : await unrepostFeed(feed.id);

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
      const result = await createFeedComment(feed.id, trimmed);
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
    <article className="border border-x-0 border-[#e6e9ef] bg-white p-5 lg:rounded-2xl lg:border-x lg:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <Link
          href={feed.creator_username ? `/profile/${feed.creator_username}` : "#"}
          className="flex items-start gap-3"
        >
          <Avatar src={feed.creator_avatar} name={feed.creator_full_name} size={44} />
          <div>
            <p className="font-semibold text-[#172033]">{feed.creator_full_name}</p>
            <p className="text-xs text-[#5f6573]">
              {formatRelativeTime(feed.created_at)}
              {isEdited && " • Diedit"}
            </p>
          </div>
        </Link>
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
            <Link
              href={`/feeds/${feed.id}`}
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-[#172033] transition hover:bg-[#f5f7fb]"
            >
              <Eye className="size-4 text-[#5f6573]" />
              Lihat post
            </Link>
            {isOwnFeed && (
              <>
                <button
                  type="button"
                  onClick={() => setShowEditForm(true)}
                  className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-[#172033] transition hover:bg-[#f5f7fb]"
                >
                  <Pencil className="size-4 text-[#5f6573]" />
                  Edit post
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-destructive transition hover:bg-destructive-soft"
                >
                  <Trash2 className="size-4" />
                  Delete post
                </button>
              </>
            )}
          </div>
        </Dropdown>
      </div>

      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#172033]">
        {content}
      </p>

      {photoMedia && photoMedia.length > 0 && (
        <MediaGrid media={photoMedia} onPreview={setPreviewPhoto} />
      )}
      {videoMedia && (
        <video controls src={videoMedia.url} className="mt-3 w-full rounded-xl bg-black" />
      )}
      {urlMedia && <LinkPreviewCard url={urlMedia.url} />}
      {feed.repost_of && <QuotedFeed feed={feed.repost_of} />}

      {reaction.reactionCount > 0 && (
        <button
          type="button"
          onClick={() => setShowReactorsModal(true)}
          className="mt-3 flex cursor-pointer items-center gap-1 text-xs text-[#5f6573]"
        >
          <span className="flex items-center -space-x-1">
            {(reaction.reactionEmojis.length > 0 ? reaction.reactionEmojis : ["👍"]).map(
              (emoji, index) => (
                <span
                  key={`${emoji}-${index}`}
                  className="flex size-4 items-center justify-center rounded-full bg-white text-[10px] leading-none ring-1 ring-white"
                >
                  {emoji}
                </span>
              )
            )}
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
            className={`w-full gap-1.5 rounded-lg py-2 text-sm hover:bg-[#f5f7fb] ${
              reaction.activeReaction ? "text-secondary" : "text-[#5f6573]"
            }`}
          >
            {reaction.activeReactionInfo ? (
              <span className="text-base leading-none">{reaction.activeReactionInfo.emoji}</span>
            ) : (
              <Heart className="size-4" />
            )}
            {reaction.reactionCount > 0 && reaction.reactionCount}
          </Button>
          <ReactionPickerModal
            open={showReactionPicker}
            onClose={() => setShowReactionPicker(false)}
            activeReaction={reaction.activeReaction}
            onSelect={(type) => reaction.apply(reaction.activeReaction === type ? null : type)}
          />
        </div>
        <Button
          variant="ghost"
          onClick={handleToggleComments}
          className="gap-1.5 rounded-lg py-2 text-sm text-[#5f6573] hover:bg-[#f5f7fb]"
        >
          <MessageCircle className="size-4" />
          {totalCommentCount > 0 && totalCommentCount}
        </Button>
        <Dropdown
          align="right"
          trigger={({ toggle }) => (
            <Button
              variant="ghost"
              onClick={toggle}
              disabled={reposting}
              className={`w-full rounded-lg py-2 text-sm hover:bg-[#f5f7fb] ${
                reposted ? "text-secondary" : "text-[#5f6573]"
              }`}
            >
              <Repeat2 className="size-4" />
            </Button>
          )}
        >
          <div className="flex flex-col py-1">
            <button
              type="button"
              onClick={toggleRepost}
              disabled={isOwnFeed}
              title={isOwnFeed ? "Tidak bisa me-repost postingan sendiri" : undefined}
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-[#172033] transition hover:bg-[#f5f7fb] disabled:cursor-not-allowed disabled:text-[#c3c7d1]"
            >
              <Repeat2 className="size-4 text-[#5f6573]" />
              {reposted ? "Batalkan Repost" : "Repost"}
            </button>
            <button
              type="button"
              onClick={handleQuoteRepost}
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-[#172033] transition hover:bg-[#f5f7fb]"
            >
              <Quote className="size-4 text-[#5f6573]" />
              Quote Repost
            </button>
          </div>
        </Dropdown>
        <Button
          variant="ghost"
          onClick={() => setShowShareModal(true)}
          className="rounded-lg py-2 text-sm text-[#5f6573] hover:bg-[#f5f7fb]"
        >
          <Share2 className="size-4" />
        </Button>
      </div>

      {!showComments && feed.top_comment && !topCommentDeleted && (
        <div className="mt-3 border-t border-[#e6e9ef] pt-3">
          <CommentItem
            comment={feed.top_comment}
            isVerified={isVerified}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            currentUserAvatar={currentUserAvatar}
            onDeleted={handleCommentDeleted}
          />
          {commentCount > 1 && (
            <button
              type="button"
              onClick={handleToggleComments}
              className="mt-2 pl-3 text-xs font-semibold text-[#5f6573] hover:underline"
            >
              Lihat {commentCount - 1} komentar lainnya
            </button>
          )}
        </div>
      )}

      {showComments && (
        <div className="mt-3 flex flex-col gap-3 border-t border-[#e6e9ef] pt-3">
          {loadingComments && <p className="text-xs text-[#5f6573]">Memuat komentar...</p>}
          {!loadingComments && commentsLoaded && comments.length === 0 && (
            <p className="py-4 text-center text-xs text-[#5f6573]">
              Jadilah yang pertama berkomentar!
            </p>
          )}
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isVerified={isVerified}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              currentUserAvatar={currentUserAvatar}
              onDeleted={handleCommentDeleted}
            />
          ))}

          {currentUserId ? (
            <CommentSubmitter
              avatar={currentUserAvatar}
              name={currentUserName}
              value={commentText}
              onChange={setCommentText}
              onSubmit={handleSubmitComment}
              placeholder="Tulis komentar..."
              disabled={postingComment}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-[#dbe3ef] bg-[#f8fafc] px-4 py-3 text-sm text-[#5f6573]">
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
      <ShareModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        url={shareUrl}
        text={`Lihat postingan dari ${feed.creator_full_name} di HMI Connect`}
      />
      <ImagePreviewModal
        photo={previewPhoto}
        onClose={() => setPreviewPhoto(null)}
      />
    </article>
  );
}
