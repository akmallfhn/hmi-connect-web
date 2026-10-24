"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  FileText,
  Heart,
  MessageCircle,
  MessageSquareQuote,
  Repeat2,
} from "lucide-react";
import type { ActivityEntry } from "@/apis/feeds";
import type { ActivityTypeEnum } from "@/lib/types";
import { useActingHref } from "@/hooks/useActingEntity";
import { resolveFeedAuthor } from "@/lib/feed-author";
import { formatRelativeTime } from "@/lib/time-manipulation";
import Avatar from "../common/Avatar";
import MentionText from "../common/MentionText";
import FeedAttachments from "../feeds/FeedAttachments";
import FeedAuthorAvatar from "../feeds/FeedAuthorAvatar";
import QuotedFeed from "../feeds/QuotedFeed";

const TYPE_LABEL: Record<ActivityTypeEnum, string> = {
  post: "membuat postingan",
  quote_repost: "mengutip postingan",
  repost: "membagikan postingan",
  comment: "mengomentari postingan",
};

const COMPACT_TYPE_LABEL: Record<ActivityTypeEnum, string> = {
  post: "Memposting",
  quote_repost: "Mengutip postingan",
  repost: "Membagikan ulang postingan",
  comment: "Berkomentar",
};

const TYPE_ICON: Record<ActivityTypeEnum, typeof FileText> = {
  post: FileText,
  quote_repost: MessageSquareQuote,
  repost: Repeat2,
  comment: MessageCircle,
};

interface ActivityEntryCardProps {
  entry: ActivityEntry;
  variant?: "flat" | "card";
  owner?: { name: string; avatar?: string };
  isSignedIn?: boolean;
}

export default function ActivityEntryCard({
  entry,
  variant = "flat",
  owner,
  isSignedIn = false,
}: ActivityEntryCardProps) {
  const actingHref = useActingHref();
  const { type, feed, comment } = entry;
  const Icon = TYPE_ICON[type];
  const author = resolveFeedAuthor(feed);

  if (variant === "flat") {
    return (
      <Link href={actingHref(`/feeds/${feed.id}`)} className="block rounded-xl">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground xl:text-[13px]">
          <Icon className="size-3.5" />
          {COMPACT_TYPE_LABEL[type]}
          <span>· {formatRelativeTime(entry.created_at)}</span>
        </div>

        {type === "comment" && comment ? (
          <>
            <p className="mt-2 line-clamp-3 whitespace-pre-line break-words text-sm leading-6 text-heading xl:text-[15px]">
              <MentionText interactive={false}>{comment.message}</MentionText>
            </p>
            <div className="mt-2 rounded-xl border border-border p-3">
              <div className="flex items-center gap-2">
                <FeedAuthorAvatar author={author} size={24} />
                <p className="truncate text-xs font-semibold text-heading xl:text-sm">
                  {author.name}
                </p>
              </div>
              <p className="mt-1 line-clamp-2 break-words text-xs text-muted-foreground xl:text-sm">
                <MentionText interactive={false}>{feed.content}</MentionText>
              </p>
            </div>
          </>
        ) : type === "repost" ? (
          <QuotedFeed feed={feed} />
        ) : (
          <>
            <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm leading-6 text-heading xl:text-[15px]">
              <MentionText interactive={false}>{feed.content}</MentionText>
            </p>
            {feed.repost_of ? (
              <QuotedFeed feed={feed.repost_of} />
            ) : (
              feed.repost_of_id && (
                <p className="mt-3 rounded-xl border border-dashed border-border bg-surface-subtle px-3 py-4 text-sm text-muted-foreground">
                  Postingan yang dibagikan sudah dihapus.
                </p>
              )
            )}
          </>
        )}

        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground xl:text-[13px]">
          <span className="flex items-center gap-1.5">
            <Heart className="size-3.5" />
            {type === "comment" && comment
              ? comment.reaction_count.total
              : feed.reaction_count.total}
          </span>
          <span className="flex items-center gap-1.5">
            <MessageCircle className="size-3.5" />
            {feed.comment_count}
          </span>
        </div>
      </Link>
    );
  }

  return (
    <article className="border border-x-0 border-border bg-surface p-5 sm:p-6 lg:rounded-2xl lg:border-x">
      {owner ? (
        <div className="flex items-center gap-3">
          <Avatar src={owner.avatar} name={owner.name} size={42} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-muted-foreground">
              <span className="font-semibold text-heading">{owner.name}</span>{" "}
              {TYPE_LABEL[type]}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatRelativeTime(entry.created_at)}
            </p>
          </div>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-foreground">
            <Icon className="size-4" />
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground xl:text-[13px]">
          <span className="flex size-7 items-center justify-center rounded-full bg-primary-soft text-primary-foreground">
            <Icon className="size-3.5" />
          </span>
          <span className="capitalize">{TYPE_LABEL[type]}</span>
          <span aria-hidden="true">·</span>
          <span>{formatRelativeTime(entry.created_at)}</span>
        </div>
      )}

      <div className="mt-5">
        {type === "comment" && comment ? (
          <>
            <p className="line-clamp-5 whitespace-pre-line break-words text-[15px] leading-6 text-content-foreground sm:text-base">
              <MentionText>{comment.message}</MentionText>
            </p>
            <div className="mt-4 rounded-xl border border-border bg-surface-subtle px-4 py-3">
              <div className="flex items-center gap-2">
                <FeedAuthorAvatar author={author} size={26} />
                <p className="truncate text-xs font-semibold text-heading sm:text-sm">
                  {author.name}
                </p>
              </div>
              <p className="mt-2 line-clamp-2 break-words text-sm leading-5 text-muted-foreground">
                <MentionText>{feed.content || "Lihat postingan"}</MentionText>
              </p>
            </div>
          </>
        ) : type === "repost" ? (
          <QuotedFeed feed={feed} linkToDetail />
        ) : (
          <>
            {feed.content && (
              <p className="line-clamp-5 whitespace-pre-line break-words text-[15px] leading-6 text-content-foreground sm:text-base">
                <MentionText>{feed.content}</MentionText>
              </p>
            )}
            {feed.repost_of ? (
              <QuotedFeed feed={feed.repost_of} linkToDetail />
            ) : feed.repost_of_id ? (
              <p className="mt-4 rounded-xl border border-dashed border-border bg-surface-subtle px-4 py-4 text-sm text-muted-foreground">
                Postingan yang dibagikan sudah dihapus.
              </p>
            ) : (
              <FeedAttachments
                attachments={feed.attachments}
                isSignedIn={isSignedIn}
              />
            )}
          </>
        )}
      </div>

      <div className="mt-5 flex items-center gap-5 border-t border-border pt-4 text-xs text-muted-foreground sm:text-sm">
        <span className="flex items-center gap-1.5">
          <Heart className="size-4" />
          {type === "comment" && comment
            ? comment.reaction_count.total
            : feed.reaction_count.total}
        </span>
        <span className="flex items-center gap-1.5">
          <MessageCircle className="size-4" />
          {feed.comment_count}
        </span>
        <Link
          href={actingHref(`/feeds/${feed.id}`)}
          className="ml-auto flex items-center gap-1 font-medium text-primary-foreground focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {type === "comment" ? "Lihat diskusi" : "Lihat postingan"}
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    </article>
  );
}
