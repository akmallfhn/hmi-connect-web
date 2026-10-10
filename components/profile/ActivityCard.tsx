"use client";

import Link from "next/link";
import type { ActivityEntry } from "@/apis/feeds";
import ActivityEntryCard from "./ActivityEntryCard";
import { useActingHref } from "@/hooks/useActingEntity";

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
  const actingHref = useActingHref();
  return (
    <div className="border border-x-0 border-border bg-surface p-5 lg:rounded-2xl lg:border-x">
      <h2 className="text-sm font-stack-sans-headline font-medium text-heading xl:text-[15px]">
        {title}
      </h2>

      <div className="mt-3 flex flex-col gap-4">
        {entries.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border-strong px-4 py-5 text-sm text-muted-foreground xl:text-[15px]">
            {emptyMessage}
          </p>
        ) : (
          entries.map((entry, index) => (
            <div
              key={`${entry.type}-${entry.feed.id}-${entry.comment?.id ?? index}`}
              className="border-t border-border pt-4 first:border-t-0 first:pt-0"
            >
              <ActivityEntryCard entry={entry} />
            </div>
          ))
        )}
      </div>

      {seeAllHref && entries.length > 0 && (
        <Link
          href={actingHref(seeAllHref)}
          className="mt-4 block border-t border-border pt-3 text-center text-xs font-semibold text-primary-foreground hover:underline xl:text-sm"
        >
          Lihat semua
        </Link>
      )}
    </div>
  );
}
