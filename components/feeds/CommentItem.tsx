"use client";

import Link from "next/link";
import { IconHeart, IconMessageCircle } from "@tabler/icons-react";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { toast } from "sonner";
import CommentSubmitter from "./CommentSubmitter";
import FeedAuthorAvatar from "./FeedAuthorAvatar";
import Dropdown from "../common/Dropdown";
import type { ComposerAuthorEntity } from "../forms/CreateFeedForms";
import AlertConfirmation from "../modals/AlertConfirmation";
import ReactionPickerModal from "../modals/ReactionPickerModal";
import ReactorsListModal from "../modals/ReactorsListModal";
import { useReaction } from "@/hooks/useReaction";
import type { FeedComment } from "@/apis/feeds";
import {
  createCommentReply,
  deleteComment,
  deleteCommentReply,
} from "@/lib/actions";
import { formatCompactTime, formatShortDateTime } from "@/lib/time-manipulation";
import { resolveCommentAuthor } from "@/lib/feed-author";
import { useInteractionGuard } from "@/hooks/useInteractionGuard";
import {
  isSuccessStatus,
  type UserStatusEnum,
  type VerificationStatusEnum,
} from "@/lib/types";
import { useActingHref } from "@/hooks/useActingEntity";

interface ViewerProps {
  userStatus?: UserStatusEnum;
  verificationStatus?: VerificationStatusEnum;
  currentUserId?: string;
  currentUserName?: string;
  currentUserAvatar?: string;
  authorEntity?: ComposerAuthorEntity;
}

interface CommentItemProps extends ViewerProps {
  comment: FeedComment;
  // Second argument is how many replies went with it, so the feed's total stays right.
  onDeleted?: (commentId: string, removedReplies: number) => void;
  onReplyCountChange?: (delta: number) => void;
}

// One thread: the comment, then its replies at the same indent, joined by a line under each avatar.
export default function CommentItem({
  comment,
  onDeleted,
  onReplyCountChange,
  ...viewer
}: CommentItemProps) {
  const requireVerified = useInteractionGuard({
    userId: viewer.currentUserId,
    userStatus: viewer.userStatus,
    verificationStatus: viewer.verificationStatus,
  });
  const [replies, setReplies] = useState<FeedComment[]>(comment.replies ?? []);
  const [replyTarget, setReplyTarget] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [postingReply, setPostingReply] = useState(false);

  function openReply(name: string) {
    if (!requireVerified()) return;
    setReplyTarget(name);
  }

  function closeReply() {
    setReplyTarget(null);
    setReplyText("");
  }

  function handleSubmitReply(event: FormEvent) {
    event.preventDefault();
    if (!requireVerified()) return;

    const trimmed = replyText.trim();
    if (!trimmed) return;

    setPostingReply(true);
    createCommentReply(comment.id, trimmed, viewer.authorEntity)
      .then((result) => {
        if (isSuccessStatus(result.status) && result.data) {
          setReplies((prev) => [...prev, result.data as FeedComment]);
          onReplyCountChange?.(1);
          closeReply();
        } else {
          toast.error(result.message ?? "Gagal mengirim balasan.");
        }
      })
      .finally(() => setPostingReply(false));
  }

  function handleReplyDeleted(replyId: string) {
    setReplies((prev) => prev.filter((reply) => reply.id !== replyId));
    onReplyCountChange?.(-1);
  }

  return (
    <div className="border-b border-divider py-5 last:border-b-0">
      <CommentRow
        comment={comment}
        connectBelow={replies.length > 0}
        replyCount={replies.length}
        onReply={openReply}
        onDeleted={(id) => onDeleted?.(id, replies.length)}
        {...viewer}
      />
      {replies.map((reply, index) => (
        <CommentRow
          key={reply.id}
          comment={reply}
          isReply
          connectBelow={index < replies.length - 1}
          onReply={openReply}
          onDeleted={handleReplyDeleted}
          {...viewer}
        />
      ))}
      {replyTarget && (
        <div className="mt-4">
          <CommentSubmitter
            avatar={viewer.authorEntity?.imageUrl ?? viewer.currentUserAvatar}
            name={viewer.authorEntity?.name ?? viewer.currentUserName}
            avatarSize={32}
            value={replyText}
            onChange={setReplyText}
            onSubmit={handleSubmitReply}
            onCancel={closeReply}
            placeholder={`Balas ${replyTarget}...`}
            disabled={postingReply}
            autoFocus
          />
        </div>
      )}
    </div>
  );
}

interface CommentRowProps extends ViewerProps {
  comment: FeedComment;
  isReply?: boolean;
  connectBelow: boolean;
  replyCount?: number;
  onReply: (authorName: string) => void;
  onDeleted: (commentId: string) => void;
}

function CommentRow({
  comment,
  isReply = false,
  connectBelow,
  replyCount = 0,
  onReply,
  onDeleted,
  userStatus,
  verificationStatus,
  currentUserId,
  authorEntity,
}: CommentRowProps) {
  const actingHref = useActingHref();
  const requireVerified = useInteractionGuard({
    userId: currentUserId,
    userStatus,
    verificationStatus,
  });
  const author = resolveCommentAuthor(comment);
  const reaction = useReaction(
    isReply ? "comment_reply" : "comment",
    comment.id,
    {
      myReaction: comment.my_reaction,
      total: comment.reaction_count.total,
      byType: comment.reaction_count.by_type,
      authorEntity,
    },
  );
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const reactionButtonRef = useRef<HTMLButtonElement>(null);
  const [showReactorsModal, setShowReactorsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // Personal delete only in user mode — acting as an entity isn't acting as yourself.
  const isOwnComment =
    !authorEntity &&
    Boolean(currentUserId) &&
    comment.user_id === currentUserId;

  function handleReactionButtonClick() {
    if (!requireVerified()) return;
    if (reaction.activeReaction) {
      reaction.apply(null);
      return;
    }
    setShowReactionPicker(true);
  }

  function handleDelete() {
    setDeleting(true);
    const request = isReply
      ? deleteCommentReply(comment.id)
      : deleteComment(comment.id);
    request
      .then((result) => {
        if (isSuccessStatus(result.status)) {
          onDeleted(comment.id);
        } else {
          toast.error(result.message ?? "Gagal menghapus komentar.");
        }
      })
      .finally(() => {
        setDeleting(false);
        setShowDeleteConfirm(false);
      });
  }

  const actionClassName =
    "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-2 text-[13px] text-muted-foreground transition-colors hover:bg-surface-muted disabled:opacity-60";

  return (
    <div className="flex gap-3">
      <div className="flex shrink-0 flex-col items-center">
        <Link
          href={actingHref(author.href)}
          aria-label={`Lihat profil ${author.name}`}
          className="rounded-full"
        >
          <FeedAuthorAvatar author={author} size={40} />
        </Link>
        {connectBelow && (
          <span aria-hidden="true" className="my-2 w-0.5 flex-1 rounded-full bg-border" />
        )}
      </div>

      <div className={`min-w-0 flex-1 ${connectBelow ? "pb-5" : ""}`}>
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 pt-0.5 text-sm leading-5 xl:text-[15px]">
            <Link
              href={actingHref(author.href)}
              className="font-semibold text-heading"
            >
              {author.name}
            </Link>
            <time
              dateTime={comment.created_at}
              title={formatShortDateTime(comment.created_at)}
              className="ml-2 text-[13px] text-muted-foreground"
            >
              {formatCompactTime(comment.created_at)}
            </time>
          </p>
          {isOwnComment && (
            <Dropdown
              align="right"
              closeOnScroll
              trigger={({ toggle }) => (
                <button
                  type="button"
                  onClick={toggle}
                  aria-label="Opsi komentar"
                  className="-mr-1 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition hover:bg-surface-muted"
                >
                  <MoreHorizontal className="size-4" />
                </button>
              )}
            >
              <div className="flex flex-col py-1">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-destructive-foreground transition hover:bg-destructive-soft"
                >
                  <Trash2 className="size-4" />
                  {isReply ? "Hapus balasan" : "Hapus komentar"}
                </button>
              </div>
            </Dropdown>
          )}
        </div>

        <p className="mt-1 whitespace-pre-line break-words text-sm leading-6 text-content-foreground xl:text-[15px]">
          {comment.message}
        </p>

        <div className="-ml-2 mt-1.5 flex items-center gap-1">
          <span className="relative flex items-center">
            <button
              ref={reactionButtonRef}
              type="button"
              onClick={handleReactionButtonClick}
              disabled={reaction.reacting}
              aria-label={
                reaction.activeReaction
                  ? `Batalkan reaksi ${reaction.activeReactionInfo?.label ?? ""}`.trim()
                  : "Beri reaksi"
              }
              className={actionClassName}
            >
              {reaction.activeReactionInfo ? (
                <span className="text-base leading-none">
                  {reaction.activeReactionInfo.emoji}
                </span>
              ) : (
                <IconHeart className="size-[18px]" />
              )}
            </button>
            {reaction.reactionCount > 0 && (
              <button
                type="button"
                onClick={() => setShowReactorsModal(true)}
                aria-label={`Lihat ${reaction.reactionCount} reaksi`}
                className="-ml-1.5 h-8 cursor-pointer rounded-full pr-2 text-[13px] text-muted-foreground"
              >
                {reaction.reactionCount}
              </button>
            )}
            <ReactionPickerModal
              open={showReactionPicker}
              anchorRef={reactionButtonRef}
              onClose={() => setShowReactionPicker(false)}
              activeReaction={reaction.activeReaction}
              onSelect={(type) =>
                reaction.apply(reaction.activeReaction === type ? null : type)
              }
            />
          </span>

          {/* A reply to a reply still joins this thread, since replies only nest one level. */}
          <button
            type="button"
            onClick={() => onReply(author.name)}
            aria-label={`Balas ${author.name}`}
            className={actionClassName}
          >
            <IconMessageCircle className="size-[18px]" />
            {!isReply && replyCount > 0 && replyCount}
          </button>
        </div>
      </div>

      <ReactorsListModal
        open={showReactorsModal}
        onClose={() => setShowReactorsModal(false)}
        targetType={isReply ? "comment_reply" : "comment"}
        targetId={comment.id}
      />
      <AlertConfirmation
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title={isReply ? "Hapus Balasan?" : "Hapus Komentar?"}
        message={
          isReply
            ? "Balasan yang sudah dihapus tidak bisa dikembalikan lagi."
            : "Komentar beserta semua balasannya akan dihapus dan tidak bisa dikembalikan lagi."
        }
        confirmLabel="Hapus"
        loading={deleting}
      />
    </div>
  );
}
