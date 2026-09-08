import Link from "next/link";
import {
  FileText,
  Heart,
  MessageCircle,
  MessageSquareQuote,
  Repeat2,
} from "lucide-react";
import type { ActivityEntry } from "@/apis/feeds";
import type { ActivityTypeEnum } from "@/lib/types";
import FeedAuthorAvatar from "../feeds/FeedAuthorAvatar";
import QuotedFeed from "../feeds/QuotedFeed";
import { resolveFeedAuthor } from "@/lib/feed-author";
import { formatRelativeTime } from "@/lib/time-manipulation";

const TYPE_LABEL: Record<ActivityTypeEnum, string> = {
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

export default function ActivityEntryCard({ entry }: { entry: ActivityEntry }) {
  const { type, feed, comment } = entry;
  const Icon = TYPE_ICON[type];
  const author = resolveFeedAuthor(feed);

  return (
    <Link href={`/feeds/${feed.id}`} className="block rounded-xl">
      <div className="flex items-center gap-1.5 text-xs font-medium text-[#5f6573] xl:text-[13px]">
        <Icon className="size-3.5" />
        {TYPE_LABEL[type]}
        <span>• {formatRelativeTime(entry.created_at)}</span>
      </div>

      {type === "comment" && comment ? (
        <>
          <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm leading-6 text-[#172033] xl:text-[15px]">
            {comment.message}
          </p>
          <div className="mt-2 rounded-xl border border-[#e6e9ef] p-3">
            <div className="flex items-center gap-2">
              <FeedAuthorAvatar author={author} size={24} />
              <p className="truncate text-xs font-semibold text-[#172033] xl:text-sm">
                {author.name}
              </p>
            </div>
            <p className="mt-1 line-clamp-2 text-xs text-[#5f6573] xl:text-sm">
              {feed.content}
            </p>
          </div>
        </>
      ) : type === "repost" ? (
        <QuotedFeed feed={feed} />
      ) : (
        <>
          <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm leading-6 text-[#172033] xl:text-[15px]">
            {feed.content}
          </p>
          {feed.repost_of ? (
            <QuotedFeed feed={feed.repost_of} />
          ) : (
            feed.repost_of_id && (
              <p className="mt-3 rounded-xl border border-dashed border-[#e6e9ef] bg-[#f9fafc] px-3 py-4 text-sm text-[#5f6573]">
                Postingan yang dibagikan sudah dihapus.
              </p>
            )
          )}
        </>
      )}

      <div className="mt-3 flex items-center gap-4 text-xs text-[#5f6573] xl:text-[13px]">
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
