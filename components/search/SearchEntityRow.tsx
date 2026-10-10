import Link from "next/link";
import type { SearchEntityResult } from "@/apis/search";
import { entityProfileHref, formatEntityAuthorName } from "@/lib/feed-author";
import FeedAuthorAvatar from "../feeds/FeedAuthorAvatar";

export default function SearchEntityRow({
  entity,
}: {
  entity: SearchEntityResult;
}) {
  const name = formatEntityAuthorName(entity.entity_type, entity.entity_name);
  const href = entityProfileHref(entity.entity_type, entity.entity_id);
  return (
    <div className="border-b border-[#e6e9ef]">
      <Link
        href={href}
        className="flex items-center gap-3 rounded-xl px-3 py-4 transition-colors hover:bg-[#f1f3f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
      >
        <FeedAuthorAvatar
          author={{
            name,
            href,
            avatar: entity.entity_image_url ?? undefined,
            isEntity: true,
          }}
          size={40}
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-[#172033] lg:text-[15px]">
            {name}
          </h3>
          {entity.entity_legal_name &&
            entity.entity_legal_name !== entity.entity_name && (
              <p className="truncate text-[13px] text-[#78848f] lg:text-sm">
                {entity.entity_legal_name}
              </p>
            )}
        </div>
      </Link>
    </div>
  );
}
