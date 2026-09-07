import Image from "next/image";
import Avatar from "../common/Avatar";
import Label from "../common/Label";
import { resolveFeedAuthor } from "@/lib/feed-author";
import { formatRelativeTime } from "@/lib/time-manipulation";
import type { Feed } from "@/apis/feeds";

// The read-only preview of an original feed embedded in a quote repost — used both when
// rendering an existing quote repost (FeedItemCard) and while composing one (CreateFeedForms).
export default function QuotedFeed({ feed }: { feed: Feed }) {
  const photo = feed.media?.find((item) => item.type === "photo");
  const author = resolveFeedAuthor(feed);

  return (
    <div className="mt-3 rounded-xl border border-[#e6e9ef] p-3">
      <div className="flex items-center gap-2">
        <Avatar src={author.avatar} name={author.name} size={28} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate text-sm font-semibold text-[#172033]">
              {author.name}
            </p>
            {author.isEntity && (
              <Label variant="blue" size="sm">
                Official Account
              </Label>
            )}
          </div>
          <p className="text-xs text-[#5f6573]">
            {formatRelativeTime(feed.created_at)}
          </p>
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
