import Link from "next/link";
import type { SearchPostingResult } from "@/apis/search";
import Avatar from "../common/Avatar";
import Label from "../common/Label";
import { resolveFeedAuthor } from "@/lib/feed-author";
import { formatRelativeTime } from "@/lib/time-manipulation";

export default function SearchPostingRow({ posting }: { posting: SearchPostingResult }) {
  const author = resolveFeedAuthor(posting);

  return (
    <Link
      href={`/feeds/${posting.id}`}
      className="block px-4 py-3 transition hover:bg-[#f5f7fb]"
    >
      <div className="flex items-center gap-2">
        <Avatar src={author.avatar} name={author.name} size={32} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate text-sm font-semibold text-[#172033]">{author.name}</p>
            {author.isEntity && (
              <Label variant="blue" size="sm">
                Official Account
              </Label>
            )}
          </div>
          <p className="text-xs text-[#5f6573]">{formatRelativeTime(posting.created_at)}</p>
        </div>
      </div>
      <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm leading-6 text-[#172033]">
        {posting.content}
      </p>
    </Link>
  );
}
