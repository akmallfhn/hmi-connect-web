import type { SearchCategory } from "@/apis/search";
import { Bar, Circle } from "../states/Skeleton";

function PersonRowSkeleton() {
  return (
    <div className="border-b border-border px-3 py-4">
      <div className="flex items-center gap-3">
        <Circle className="size-10" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Bar className="h-3.5 w-36 max-w-full" />
          <Bar className="h-3 w-24 max-w-full" />
        </div>
      </div>
      <div className="ml-[52px] mt-3">
        <Bar className="h-3 w-48 max-w-full" />
      </div>
    </div>
  );
}

function EntityRowSkeleton() {
  return (
    <div className="flex items-center gap-3 border-b border-border px-3 py-4">
      <Circle className="size-10" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Bar className="h-3.5 w-44 max-w-full" />
        <Bar className="h-3 w-32 max-w-full" />
      </div>
    </div>
  );
}

function ArticleRowSkeleton() {
  return (
    <div className="flex items-start gap-3 border-b border-border px-3 py-4">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Bar className="h-4 w-5/6" />
        <Bar className="h-3 w-full" />
        <Bar className="h-3 w-3/4" />
        <Bar className="mt-1 h-3 w-1/2" />
      </div>
      <div className="size-18 shrink-0 rounded-lg bg-border sm:size-22" />
    </div>
  );
}

function FeedRowSkeleton({ withMedia }: { withMedia: boolean }) {
  return (
    <div className="border-b border-border bg-surface py-5">
      <div className="flex items-center gap-3">
        <Circle className="size-11" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Bar className="h-3.5 w-36 max-w-full" />
          <Bar className="h-2.5 w-20" />
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <Bar className="h-3 w-full" />
        <Bar className="h-3 w-11/12" />
        <Bar className="h-3 w-2/3" />
      </div>
      {withMedia && <div className="mt-3 aspect-video w-full rounded-xl bg-border" />}
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Bar key={index} className="h-4 w-10" />
        ))}
      </div>
    </div>
  );
}

export default function SearchResultsSkeleton({
  category,
}: {
  category: SearchCategory;
}) {
  const rows = category === "feed" ? 3 : 5;
  return (
    <div aria-hidden="true" className="animate-pulse">
      {Array.from({ length: rows }).map((_, index) => {
        switch (category) {
          case "user":
            return <PersonRowSkeleton key={index} />;
          case "entity":
            return <EntityRowSkeleton key={index} />;
          case "article":
            return <ArticleRowSkeleton key={index} />;
          case "feed":
            return <FeedRowSkeleton key={index} withMedia={index === 0} />;
        }
      })}
    </div>
  );
}

export function SuggestedConnectionsSkeleton() {
  return (
    <div aria-hidden="true" className="animate-pulse rounded-2xl border border-border bg-surface p-4">
      <Bar className="h-4 w-36" />
      <div className="mt-3 flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Circle className="size-10" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Bar className="h-3 w-24 max-w-full" />
              <Bar className="h-2.5 w-16 max-w-full" />
            </div>
            <Bar className="h-8 w-14 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
