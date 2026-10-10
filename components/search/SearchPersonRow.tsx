import Link from "next/link";
import type { SearchPersonResult } from "@/apis/search";
import { formatEntityAuthorName } from "@/lib/feed-author";
import Avatar from "../common/Avatar";
import ProfileBadges from "../common/ProfileBadges";

export default function SearchPersonRow({ person }: { person: SearchPersonResult }) {
  const headline = person.headline?.trim();
  const branchName = person.branch_name?.trim();
  const description = headline ||
    (branchName ? formatEntityAuthorName("branch", branchName) : "");

  return (
    <div className="border-b border-border">
      <Link
        href={`/profile/${person.username}`}
        className="block rounded-xl px-3 py-4 transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
      >
        <div className="flex items-center gap-3">
          <Avatar src={person.avatar} name={person.full_name} size={40} />
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="truncate text-sm font-semibold text-heading lg:text-[15px]">
                {person.full_name}
              </span>
              <ProfileBadges
                isVerified={person.verification_status === "verified"}
                isAlumni={Boolean(person.is_alumni)}
                size={16}
                className="shrink-0"
              />
            </div>
            <p className="truncate text-[13px] text-subtle-foreground lg:text-sm">
              @{person.username}
            </p>
          </div>
        </div>
        {description && (
          <p className="ml-[52px] mt-2 text-[13px] leading-5 text-muted-foreground lg:text-sm">
            {description}
          </p>
        )}
      </Link>
    </div>
  );
}
