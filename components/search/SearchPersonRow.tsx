import Link from "next/link";
import type { SearchPersonResult } from "@/apis/search";
import Avatar from "../common/Avatar";

function affiliationLabel(person: SearchPersonResult): string | undefined {
  if (person.branch_name) return `Cabang ${person.branch_name}`;
  if (person.coordinating_body_name) return person.coordinating_body_name;
  return person.chapter_name;
}

export default function SearchPersonRow({ person }: { person: SearchPersonResult }) {
  const href = person.username ? `/profile/${person.username}` : "#";
  const subtitle = affiliationLabel(person);

  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 transition hover:bg-[#f5f7fb]"
    >
      <Avatar src={person.avatar} name={person.full_name} size={44} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#172033]">{person.full_name}</p>
        {person.headline && (
          <p className="truncate text-xs text-[#5f6573]">{person.headline}</p>
        )}
        {subtitle && <p className="truncate text-xs text-[#5f6573]">{subtitle}</p>}
      </div>
    </Link>
  );
}
