import Link from "next/link";
import type { ActivityEntry } from "@/apis/users";
import ActivityEntryCard from "./ActivityEntryCard";

interface ActivityCardProps {
  username?: string;
  entries: ActivityEntry[];
}

export default function ActivityCard({ username, entries }: ActivityCardProps) {
  return (
    <div className="border border-x-0 border-[#e6e9ef] bg-white p-5 lg:rounded-2xl lg:border-x lg:shadow-sm">
      <h2 className="text-sm font-semibold text-[#172033]">Aktivitas</h2>

      <div className="mt-3 flex flex-col gap-4">
        {entries.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#dbe3ef] px-4 py-5 text-sm text-[#5f6573]">
            Belum ada aktivitas.
          </p>
        ) : (
          entries.map((entry, index) => (
            <div
              key={`${entry.type}-${entry.feed.id}-${entry.comment?.id ?? index}`}
              className="border-t border-[#e6e9ef] pt-4 first:border-t-0 first:pt-0"
            >
              <ActivityEntryCard entry={entry} />
            </div>
          ))
        )}
      </div>

      {username && entries.length > 0 && (
        <Link
          href={`/profile/${username}/activities`}
          className="mt-4 block border-t border-[#e6e9ef] pt-3 text-center text-xs font-semibold text-primary hover:underline"
        >
          Lihat semua
        </Link>
      )}
    </div>
  );
}
