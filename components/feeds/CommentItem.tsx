"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Reply } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import Avatar from "../common/Avatar";
import CommentSubmitter from "./CommentSubmitter";
import AlertConfirmation from "../modals/AlertConfirmation";
import ReactionPickerModal from "../modals/ReactionPickerModal";
import ReactorsListModal from "../modals/ReactorsListModal";
import { useReaction } from "@/hooks/useReaction";
import type { FeedComment } from "@/apis/feeds";
import {
  createCommentReply,
  deleteComment,
  deleteCommentReply,
  listCommentReplies,
} from "@/lib/actions";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import { isSuccessStatus } from "@/lib/types";

interface CommentItemProps {
  comment: FeedComment;
  isVerified?: boolean;
  currentUserId?: string;
  currentUserName?: string;
  currentUserAvatar?: string;
  isReply?: boolean;
  onDeleted?: (commentId: string) => void;
}

export default function CommentItem({
  comment,
  isVerified,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  isReply = false,
  onDeleted,
}: CommentItemProps) {
  const router = useRouter();
  const reaction = useReaction(isReply ? "comment_reply" : "comment", comment.id, {
    myReaction: comment.my_reaction,
    total: comment.reaction_count.total,
    byType: comment.reaction_count.by_type,
  });
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showReactorsModal, setShowReactorsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isOwnComment = Boolean(currentUserId) && comment.user_id === currentUserId;

  const [expanded, setExpanded] = useState(false);
  const [replies, setReplies] = useState<FeedComment[]>([]);
  const [replyCount, setReplyCount] = useState(comment.reply_count);
  const [repliesLoaded, setRepliesLoaded] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [postingReply, setPostingReply] = useState(false);

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

  function handleToggleExpanded() {
    const next = !expanded;
    setExpanded(next);

    if (next && !repliesLoaded) {
      setLoadingReplies(true);
      listCommentReplies(comment.id)
        .then((result) => {
          setReplies(result.list);
          setRepliesLoaded(true);
        })
        .finally(() => setLoadingReplies(false));
    }
  }

  function handleSubmitReply(event: FormEvent) {
    event.preventDefault();
    if (!requireVerified()) return;

    const trimmed = replyText.trim();
    if (!trimmed) return;

    setPostingReply(true);
    createCommentReply(comment.id, trimmed)
      .then((result) => {
        if (isSuccessStatus(result.status) && result.data) {
          setReplies((prev) => [...prev, result.data as FeedComment]);
          setRepliesLoaded(true);
          setReplyCount((prev) => prev + 1);
          setReplyText("");
        } else {
          toast.error(result.message ?? "Gagal mengirim balasan.");
        }
      })
      .finally(() => setPostingReply(false));
  }

  function handleDelete() {
    setDeleting(true);
    const request = isReply ? deleteCommentReply(comment.id) : deleteComment(comment.id);
    request
      .then((result) => {
        if (isSuccessStatus(result.status)) {
          onDeleted?.(comment.id);
        } else {
          toast.error(result.message ?? "Gagal menghapus komentar.");
        }
      })
      .finally(() => {
        setDeleting(false);
        setShowDeleteConfirm(false);
      });
  }

  function handleReplyDeleted(replyId: string) {
    setReplies((prev) => prev.filter((reply) => reply.id !== replyId));
    setReplyCount((prev) => Math.max(0, prev - 1));
  }

  return (
    <div className="flex items-start gap-2">
      <Link
        href={comment.username ? `/profile/${comment.username}` : "#"}
        aria-label={`Lihat profil ${comment.full_name}`}
        className="shrink-0 rounded-full"
      >
        <Avatar
          src={comment.avatar}
          name={comment.full_name}
          size={isReply ? 28 : 32}
        />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="rounded-xl bg-[#f5f7fb] px-3 py-2">
          <p className="text-xs font-semibold text-[#172033]">{comment.full_name}</p>
          <p className="text-sm text-[#172033]">{comment.message}</p>
        </div>

        <div className="mt-1 flex items-center gap-3 pl-3 text-xs text-[#5f6573]">
          <span className="text-[11px]">{formatRelativeTime(comment.created_at)}</span>

          <span className="relative flex items-center gap-0.5">
            <button
              type="button"
              onClick={handleReactionButtonClick}
              disabled={reaction.reacting}
              aria-label={reaction.activeReactionInfo?.label ?? "Suka"}
              className={`cursor-pointer transition ${
                reaction.activeReaction ? "text-secondary" : "text-[#5f6573]"
              }`}
            >
              {reaction.activeReactionInfo ? (
                <span className="text-sm leading-none">{reaction.activeReactionInfo.emoji}</span>
              ) : (
                <Heart className="size-3.5" />
              )}
            </button>
            {reaction.reactionCount > 0 && (
              <button
                type="button"
                onClick={() => setShowReactorsModal(true)}
                className="cursor-pointer font-semibold text-[#5f6573]"
              >
                {reaction.reactionCount}
              </button>
            )}
            <ReactionPickerModal
              open={showReactionPicker}
              onClose={() => setShowReactionPicker(false)}
              activeReaction={reaction.activeReaction}
              onSelect={(type) => reaction.apply(reaction.activeReaction === type ? null : type)}
            />
          </span>

          {!isReply && (
            <button
              type="button"
              onClick={handleToggleExpanded}
              aria-label="Balas"
              className="cursor-pointer text-[#5f6573]"
            >
              <Reply className="size-3.5" />
            </button>
          )}
          {!isReply && replyCount > 0 && (
            <button
              type="button"
              onClick={handleToggleExpanded}
              className="cursor-pointer font-semibold text-secondary underline-offset-2 hover:underline"
            >
              {expanded ? `Sembunyikan ${replyCount} balasan` : `Tampilkan ${replyCount} balasan`}
            </button>
          )}
          {isOwnComment && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="cursor-pointer font-semibold text-destructive underline-offset-2 hover:underline"
            >
              Delete
            </button>
          )}
        </div>

        {!isReply && expanded && (
          <div className="mt-2 flex flex-col gap-2 pl-3">
            {loadingReplies && <p className="text-xs text-[#5f6573]">Memuat balasan...</p>}
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                isVerified={isVerified}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                currentUserAvatar={currentUserAvatar}
                isReply
                onDeleted={handleReplyDeleted}
              />
            ))}

            {currentUserId ? (
              <CommentSubmitter
                avatar={currentUserAvatar}
                name={currentUserName}
                avatarSize={28}
                value={replyText}
                onChange={setReplyText}
                onSubmit={handleSubmitReply}
                placeholder="Tulis balasan..."
                disabled={postingReply}
              />
            ) : (
              <div className="rounded-xl border border-dashed border-[#dbe3ef] bg-white px-3 py-2 text-xs text-[#5f6573]">
                <Link
                  href="/auth/login"
                  className="font-semibold text-primary hover:underline"
                >
                  Login
                </Link>{" "}
                untuk membalas komentar.
              </div>
            )}
          </div>
        )}
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
