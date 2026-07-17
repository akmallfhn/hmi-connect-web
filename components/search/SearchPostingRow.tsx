import Link from "next/link";
import type { SearchPostingResult } from "@/apis/search";
import Avatar from "../common/Avatar";
import { formatRelativeTime } from "@/lib/formatRelativeTime";

export default function SearchPostingRow({ posting }: { posting: SearchPostingResult }) {
  return (
    <Link
      href={`/feeds/${posting.id}`}
      className="block px-4 py-3 transition hover:bg-[#f5f7fb]"
    >
      <div className="flex items-center gap-2">
        <Avatar src={posting.creator_avatar} name={posting.creator_full_name} size={32} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#172033]">
            {posting.creator_full_name}
          </p>
          <p className="text-xs text-[#5f6573]">{formatRelativeTime(posting.created_at)}</p>
        </div>
      </div>
      <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm leading-6 text-[#172033]">
        {posting.content}
      </p>
    </Link>
  );
}
