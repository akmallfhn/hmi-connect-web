"use client";

import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import Avatar from "../common/Avatar";
import Button from "../buttons/Button";
import ReactionPickerModal from "../modals/ReactionPickerModal";
import { useReaction } from "@/hooks/useReaction";
import type { FeedComment } from "@/apis/feeds";
import { createCommentReply, listCommentReplies } from "@/lib/actions";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import { isSuccessStatus } from "@/lib/types";

interface CommentItemProps {
  comment: FeedComment;
  isVerified?: boolean;
  currentUserName?: string;
  currentUserAvatar?: string;
  isReply?: boolean;
}

export default function CommentItem({
  comment,
  isVerified,
  currentUserName,
  currentUserAvatar,
  isReply = false,
}: CommentItemProps) {
  const router = useRouter();
  const reaction = useReaction(isReply ? "comment_reply" : "comment", comment.id, {
    myReaction: comment.my_reaction,
    total: comment.reaction_count.total,
    byType: comment.reaction_count.by_type,
  });
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const [expanded, setExpanded] = useState(false);
  const [replies, setReplies] = useState<FeedComment[]>([]);
  const [repliesLoaded, setRepliesLoaded] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [postingReply, setPostingReply] = useState(false);

  function requireVerified(): boolean {
    if (isVerified) return true;
    router.push("/verification");
    return false;
  }

  function handleOpenReactionPicker() {
    if (!requireVerified()) return;
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
          setReplyText("");
        } else {
          toast.error(result.message ?? "Gagal mengirim balasan.");
        }
      })
      .finally(() => setPostingReply(false));
  }

  return (
    <div className="flex items-start gap-2">
      <Avatar
        src={comment.avatar}
        name={comment.full_name}
        size={isReply ? 28 : 32}
      />
      <div className="min-w-0 flex-1">
        <div className="rounded-xl bg-[#f5f7fb] px-3 py-2">
          <p className="text-xs font-semibold text-[#172033]">{comment.full_name}</p>
          <p className="text-sm text-[#172033]">{comment.message}</p>
        </div>

        <div className="mt-1 flex items-center gap-3 pl-3 text-xs text-[#5f6573]">
          <span className="text-[11px]">{formatRelativeTime(comment.created_at)}</span>
          <button
            type="button"
            onClick={handleOpenReactionPicker}
            disabled={reaction.reacting}
            className={`font-semibold hover:underline ${
              reaction.activeReaction ? "text-secondary" : ""
            }`}
          >
            {reaction.activeReactionInfo?.label ?? "Suka"}
          </button>
          {!isReply && (
            <button type="button" onClick={handleToggleExpanded} className="font-semibold hover:underline">
              {expanded ? "Sembunyikan" : "Balas"}
            </button>
          )}
          {reaction.reactionCount > 0 && (
            <span className="flex items-center gap-0.5">
              {(reaction.reactionEmojis.length > 0 ? reaction.reactionEmojis : ["👍"])
                .slice(0, 3)
                .map((emoji, index) => (
                  <span key={`${emoji}-${index}`} className="text-[11px] leading-none">
                    {emoji}
                  </span>
                ))}
              {reaction.reactionCount}
            </span>
          )}
        </div>

        {!isReply && expanded && (
          <div className="mt-2 flex flex-col gap-2 pl-3">
            {loadingReplies && <p className="text-xs text-[#5f6573]">Memuat balasan...</p>}
            {!loadingReplies && repliesLoaded && replies.length === 0 && (
              <p className="text-xs text-[#5f6573]">Belum ada balasan.</p>
            )}
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                isVerified={isVerified}
                currentUserName={currentUserName}
                currentUserAvatar={currentUserAvatar}
                isReply
              />
            ))}

            <form onSubmit={handleSubmitReply} className="flex items-center gap-2">
              <Avatar src={currentUserAvatar} name={currentUserName ?? "Kader"} size={28} />
              <input
                value={replyText}
                onChange={(event) => setReplyText(event.target.value)}
                placeholder="Tulis balasan..."
                className="flex-1 rounded-full border border-[#e6e9ef] bg-[#f5f7fb] px-3 py-1.5 text-sm outline-none focus:border-primary"
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                disabled={postingReply || !replyText.trim()}
                className="shrink-0 rounded-full text-primary hover:bg-primary-soft"
                aria-label="Kirim balasan"
              >
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        )}
      </div>

      <ReactionPickerModal
        open={showReactionPicker}
        onClose={() => setShowReactionPicker(false)}
        activeReaction={reaction.activeReaction}
        onSelect={(type) => reaction.apply(reaction.activeReaction === type ? null : type)}
      />
    </div>
  );
}
