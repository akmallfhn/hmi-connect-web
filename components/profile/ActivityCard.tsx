import Link from "next/link";
import type { ActivityEntry } from "@/apis/feeds";
import ActivityEntryCard from "./ActivityEntryCard";

interface ActivityCardProps {
  entries: ActivityEntry[];
  seeAllHref?: string;
  // An entity only ever posts, so its own card says so instead of "Aktivitas".
  title?: string;
  emptyMessage?: string;
}

export default function ActivityCard({
  entries,
  seeAllHref,
  title = "Aktivitas",
  emptyMessage = "Belum ada aktivitas.",
}: ActivityCardProps) {
  return (
    <div className="border border-x-0 border-[#e6e9ef] bg-white p-5 lg:rounded-2xl lg:border-x lg:shadow-sm">
      <h2 className="text-sm font-semibold text-[#172033] xl:text-[15px]">
        {title}
      </h2>

      <div className="mt-3 flex flex-col gap-4">
        {entries.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#dbe3ef] px-4 py-5 text-sm text-[#5f6573] xl:text-[15px]">
            {emptyMessage}
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

      {seeAllHref && entries.length > 0 && (
        <Link
          href={seeAllHref}
          className="mt-4 block border-t border-[#e6e9ef] pt-3 text-center text-xs font-semibold text-primary hover:underline xl:text-sm"
        >
          Lihat semua
        </Link>
      )}
    </div>
  );
}
