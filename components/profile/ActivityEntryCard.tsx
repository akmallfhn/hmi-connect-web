import Link from "next/link";
import { FileText, Heart, MessageCircle, MessageSquareQuote, Repeat2 } from "lucide-react";
import type { ActivityEntry } from "@/apis/users";
import type { ActivityTypeEnum } from "@/lib/types";
import Avatar from "../common/Avatar";
import QuotedFeed from "../feeds/QuotedFeed";
import { formatRelativeTime } from "@/lib/formatRelativeTime";

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

// One entry of a user's activity — reused by ActivityCard (top 3, on the profile page)
// and the full /profile/[username]/activities list.
export default function ActivityEntryCard({ entry }: { entry: ActivityEntry }) {
  const { type, feed, comment } = entry;
  const Icon = TYPE_ICON[type];

  return (
    <Link href={`/feeds/${feed.id}`} className="block rounded-xl">
      <div className="flex items-center gap-1.5 text-xs font-medium text-[#5f6573]">
        <Icon className="size-3.5" />
        {TYPE_LABEL[type]}
        <span>• {formatRelativeTime(entry.created_at)}</span>
      </div>

      {type === "comment" && comment ? (
        <>
          <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm leading-6 text-[#172033]">
            {comment.message}
          </p>
          <div className="mt-2 rounded-xl border border-[#e6e9ef] p-3">
            <div className="flex items-center gap-2">
              <Avatar src={feed.creator_avatar} name={feed.creator_full_name} size={24} />
              <p className="truncate text-xs font-semibold text-[#172033]">
                {feed.creator_full_name}
              </p>
            </div>
            <p className="mt-1 line-clamp-2 text-xs text-[#5f6573]">{feed.content}</p>
          </div>
        </>
      ) : type === "repost" ? (
        <QuotedFeed feed={feed} />
      ) : (
        <>
          <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm leading-6 text-[#172033]">
            {feed.content}
          </p>
          {feed.repost_of && <QuotedFeed feed={feed.repost_of} />}
        </>
      )}

      <div className="mt-3 flex items-center gap-4 text-xs text-[#5f6573]">
        <span className="flex items-center gap-1.5">
          <Heart className="size-3.5" />
          {type === "comment" && comment ? comment.reaction_count.total : feed.reaction_count.total}
        </span>
        <span className="flex items-center gap-1.5">
          <MessageCircle className="size-3.5" />
          {feed.comment_count}
        </span>
      </div>
    </Link>
  );
}
