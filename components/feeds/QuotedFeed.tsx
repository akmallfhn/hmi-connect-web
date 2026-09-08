import Image from "next/image";
import Link from "next/link";
import FeedAuthorAvatar from "./FeedAuthorAvatar";
import { resolveFeedAuthor } from "@/lib/feed-author";
import { formatRelativeTime } from "@/lib/time-manipulation";
import type { Feed } from "@/apis/feeds";

// The read-only preview of an original feed embedded in a quote repost — used both when
// rendering an existing quote repost (FeedItemCard) and while composing one (CreateFeedForms).
export default function QuotedFeed({
  feed,
  // Only set by a caller that isn't already nested inside a link of its own.
  linkToDetail = false,
}: {
  feed: Feed;
  linkToDetail?: boolean;
}) {
  const photo = feed.media?.find((item) => item.type === "photo");
  const author = resolveFeedAuthor(feed);

  const body = (
    <>
      <div className="flex items-center gap-2">
        <FeedAuthorAvatar author={author} size={36} />
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-[#172033]">
            {author.name}
          </p>
          <p className="text-[13px] text-[#5f6573]">
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
    </>
  );

  if (linkToDetail) {
    return (
      <Link
        href={`/feeds/${feed.id}`}
        className="mt-3 block rounded-xl border border-[#e6e9ef] p-3 transition hover:bg-[#f5f7fb]"
      >
        {body}
      </Link>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-[#e6e9ef] p-3">{body}</div>
  );
}
