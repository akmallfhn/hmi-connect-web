"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Repeat2,
  Send,
  Share2,
} from "lucide-react";
import { FormEvent, useState, useTransition } from "react";
import { toast } from "sonner";
import Avatar from "../common/Avatar";
import Button from "../buttons/Button";
import LinkPreviewCard from "./LinkPreviewCard";
import ReactionPickerModal, { REACTIONS } from "../modals/ReactionPickerModal";
import ShareModal from "../modals/ShareModal";
import type { Feed, FeedComment } from "@/apis/feeds";
import {
  createFeedComment,
  listFeedComments,
  repostFeed,
  sendReaction,
  unrepostFeed,
  unsendReaction,
} from "@/lib/actions";
import { isSuccessStatus, type ReactionTypeEnum } from "@/lib/types";

interface FeedPostCardProps {
  feed: Feed;
  currentUserId?: string;
  currentUserName?: string;
  currentUserAvatar?: string;
  isVerified?: boolean;
  initialReposted?: boolean;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const divisions: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.34524, "week"],
    [12, "month"],
    [Number.POSITIVE_INFINITY, "year"],
  ];

  const formatter = new Intl.RelativeTimeFormat("id", { numeric: "auto" });
  let duration = diffSeconds;
  for (const [amount, unit] of divisions) {
    if (Math.abs(duration) < amount) return formatter.format(Math.round(duration), unit);
    duration /= amount;
  }
  return formatter.format(Math.round(duration), "year");
}

function MediaGrid({ media }: { media: NonNullable<Feed["media"]> }) {
  const photos = [...media].sort((a, b) => a.index - b.index);
  const visible = photos.slice(0, 4);
  const overflow = photos.length - visible.length;

  if (photos.length === 1) {
    return (
      <div className="relative mt-3 aspect-video w-full overflow-hidden rounded-xl bg-[#f5f7fb]">
        <Image src={photos[0].url} alt="" fill className="object-cover" unoptimized />
      </div>
    );
  }

  return (
    <div className="mt-3 grid grid-cols-2 gap-1 overflow-hidden rounded-xl">
      {visible.map((photo, idx) => {
        const isLastVisible = idx === visible.length - 1;
        const spanFull = photos.length === 3 && idx === 0;
        return (
          <div
            key={photo.id}
            className={`relative aspect-square bg-[#f5f7fb] ${spanFull ? "col-span-2" : ""}`}
          >
            <Image src={photo.url} alt="" fill className="object-cover" unoptimized />
            {isLastVisible && overflow > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-semibold text-white">
                +{overflow}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function QuotedFeed({ feed }: { feed: Feed }) {
  const photo = feed.media?.find((item) => item.type === "photo");
  return (
    <div className="mt-3 rounded-xl border border-[#e6e9ef] p-3">
      <div className="flex items-center gap-2">
        <Avatar src={feed.creator_avatar} name={feed.creator_full_name} size={28} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#172033]">
            {feed.creator_full_name}
          </p>
          <p className="text-xs text-[#5f6573]">{formatRelativeTime(feed.created_at)}</p>
        </div>
      </div>
      <p className="mt-2 line-clamp-4 whitespace-pre-line text-sm text-[#172033]">
        {feed.content}
      </p>
      {photo && (
        <div className="relative mt-2 aspect-video w-full overflow-hidden rounded-lg bg-[#f5f7fb]">
          <Image src={photo.url} alt="" fill className="object-cover" unoptimized />
        </div>
      )}
    </div>
  );
}

export default function FeedPostCard({
  feed,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  isVerified,
  initialReposted,
}: FeedPostCardProps) {
  const router = useRouter();
  const [activeReaction, setActiveReaction] = useState<ReactionTypeEnum | null>(feed.my_reaction);
  const [reactionCount, setReactionCount] = useState(feed.reaction_count.total);
  const [reacting, startReactionTransition] = useTransition();
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const [reposted, setReposted] = useState(Boolean(initialReposted));
  const [reposting, startRepostTransition] = useTransition();
  const isOwnFeed = Boolean(currentUserId) && feed.creator_id === currentUserId;

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentCount, setCommentCount] = useState(feed.comment_count);
  const [commentText, setCommentText] = useState("");
  const [postingComment, startCommentTransition] = useTransition();

  const photoMedia = feed.media?.filter((item) => item.type === "photo");
  const videoMedia = feed.media?.find((item) => item.type === "video");
  const urlMedia = feed.media?.find((item) => item.type === "url");
  const activeReactionInfo = activeReaction
    ? REACTIONS.find((reaction) => reaction.type === activeReaction)
    : undefined;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  function requireVerified(): boolean {
    if (isVerified) return true;
    router.push("/verification");
    return false;
  }

  function applyReaction(nextType: ReactionTypeEnum | null) {
    const previousType = activeReaction;
    if (nextType === previousType) return;

    setActiveReaction(nextType);
    setReactionCount((prev) => {
      if (previousType === null && nextType !== null) return prev + 1;
      if (previousType !== null && nextType === null) return Math.max(0, prev - 1);
      return prev;
    });

    startReactionTransition(async () => {
      const result = nextType
        ? await sendReaction("feed", feed.id, nextType)
        : await unsendReaction("feed", feed.id);

      if (!isSuccessStatus(result.status)) {
        setActiveReaction(previousType);
        setReactionCount((prev) => {
          if (previousType === null && nextType !== null) return Math.max(0, prev - 1);
          if (previousType !== null && nextType === null) return prev + 1;
          return prev;
        });
        toast.error(result.message ?? "Gagal memperbarui reaksi.");
      }
    });
  }

  function handleOpenReactionPicker() {
    if (!requireVerified()) return;
    setShowReactionPicker(true);
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
    <article className="rounded-2xl border border-[#e6e9ef] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <Link href={`/profile/${feed.creator_id}`} className="flex items-start gap-3">
          <Avatar src={feed.creator_avatar} name={feed.creator_full_name} size={44} />
          <div>
            <p className="font-semibold text-[#172033]">{feed.creator_full_name}</p>
            <p className="text-xs text-[#5f6573]">{formatRelativeTime(feed.created_at)}</p>
          </div>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 rounded-full text-[#5f6573] hover:bg-[#f5f7fb]"
          aria-label="Opsi lainnya"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </div>

      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#172033]">{feed.content}</p>

      {photoMedia && photoMedia.length > 0 && <MediaGrid media={photoMedia} />}
      {videoMedia && (
        <video controls src={videoMedia.url} className="mt-3 w-full rounded-xl bg-black" />
      )}
      {urlMedia && <LinkPreviewCard url={urlMedia.url} />}
      {feed.repost_of && <QuotedFeed feed={feed.repost_of} />}

      {(reactionCount > 0 || commentCount > 0) && (
        <div className="mt-3 flex items-center justify-between text-xs text-[#5f6573]">
          {reactionCount > 0 ? (
            <span className="flex items-center gap-1">
              <span className="text-sm leading-none">{activeReactionInfo?.emoji ?? "👍"}</span>
              {reactionCount}
            </span>
          ) : (
            <span />
          )}
          {commentCount > 0 && (
            <button
              type="button"
              onClick={handleToggleComments}
              className="cursor-pointer hover:underline"
            >
              {commentCount} komentar
            </button>
          )}
        </div>
      )}

      <div className="mt-2 grid grid-cols-4 gap-1 border-t border-[#e6e9ef] pt-2">
        <Button
          variant="ghost"
          onClick={handleOpenReactionPicker}
          disabled={reacting}
          className={`gap-2 rounded-lg py-2 text-sm hover:bg-[#f5f7fb] ${
            activeReaction ? "text-secondary" : "text-[#5f6573]"
          }`}
        >
          {activeReactionInfo ? (
            <span className="text-base leading-none">{activeReactionInfo.emoji}</span>
          ) : (
            <Heart className="size-4" />
          )}
          {activeReactionInfo?.label ?? "Suka"}
        </Button>
        <Button
          variant="ghost"
          onClick={handleToggleComments}
          className="gap-2 rounded-lg py-2 text-sm text-[#5f6573] hover:bg-[#f5f7fb]"
        >
          <MessageCircle className="size-4" />
          Komentar
        </Button>
        <Button
          variant="ghost"
          onClick={toggleRepost}
          disabled={reposting || isOwnFeed}
          title={isOwnFeed ? "Tidak bisa me-repost postingan sendiri" : undefined}
          className={`gap-2 rounded-lg py-2 text-sm hover:bg-[#f5f7fb] ${
            reposted ? "text-primary" : "text-[#5f6573]"
          }`}
        >
          <Repeat2 className="size-4" />
          Repost
        </Button>
        <Button
          variant="ghost"
          onClick={() => setShowShareModal(true)}
          className="gap-2 rounded-lg py-2 text-sm text-[#5f6573] hover:bg-[#f5f7fb]"
        >
          <Share2 className="size-4" />
          Bagikan
        </Button>
      </div>

      {showComments && (
        <div className="mt-3 flex flex-col gap-3 border-t border-[#e6e9ef] pt-3">
          {loadingComments && <p className="text-xs text-[#5f6573]">Memuat komentar...</p>}
          {!loadingComments && commentsLoaded && comments.length === 0 && (
            <p className="text-xs text-[#5f6573]">Belum ada komentar.</p>
          )}
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-2">
              <Avatar src={comment.avatar} name={comment.full_name} size={32} />
              <div className="flex-1 rounded-xl bg-[#f5f7fb] px-3 py-2">
                <p className="text-xs font-semibold text-[#172033]">{comment.full_name}</p>
                <p className="text-sm text-[#172033]">{comment.message}</p>
              </div>
            </div>
          ))}

          <form onSubmit={handleSubmitComment} className="flex items-center gap-2">
            <Avatar src={currentUserAvatar} name={currentUserName ?? "Kader"} size={32} />
            <input
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="Tulis komentar..."
              className="flex-1 rounded-full border border-[#e6e9ef] bg-[#f5f7fb] px-4 py-2 text-sm outline-none focus:border-primary"
            />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              disabled={postingComment || !commentText.trim()}
              className="shrink-0 rounded-full text-primary hover:bg-primary-soft"
              aria-label="Kirim komentar"
            >
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      )}

      <ReactionPickerModal
        open={showReactionPicker}
        onClose={() => setShowReactionPicker(false)}
        activeReaction={activeReaction}
        onSelect={(type) => applyReaction(activeReaction === type ? null : type)}
      />
      <ShareModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        url={shareUrl}
        text={`Lihat postingan dari ${feed.creator_full_name} di HMI Connect`}
      />
    </article>
  );
}
