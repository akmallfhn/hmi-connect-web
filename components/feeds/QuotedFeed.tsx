import Image from "next/image";
import Avatar from "../common/Avatar";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import type { Feed } from "@/apis/feeds";

// The read-only preview of an original feed embedded in a quote repost — used both when
// rendering an existing quote repost (FeedItemCard) and while composing one (CreateFeedForms).
export default function QuotedFeed({ feed }: { feed: Feed }) {
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
