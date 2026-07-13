// Shared skeleton palette: everything reads as "loading" gray, never white — the surface tone
// (#eef1f5) sits one shade darker than the page background (#f5f7fb) so cards stay visible
// without needing a white fill, and the block tone (#e6e9ef) is used for every pulsing shape.
// Header/BottomNav are never skeletonized — they render the real components in every loading.tsx,
// since neither fetches data itself (props come from the page, which is what's actually loading).

export function Bar({ className }: { className: string }) {
  return <div className={`rounded-full bg-[#e6e9ef] ${className}`} />;
}

export function Circle({ className }: { className: string }) {
  return <div className={`shrink-0 rounded-full bg-[#e6e9ef] ${className}`} />;
}

export function CardSkeleton({
  rows = 3,
  titleWidth = "w-32",
}: {
  rows?: number;
  titleWidth?: string;
}) {
  return (
    <div className="border border-x-0 border-[#e6e9ef] bg-[#eef1f5] p-4 lg:rounded-2xl lg:border-x lg:shadow-sm">
      <Bar className={`h-3.5 ${titleWidth}`} />
      <div className="mt-3 flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Circle className="size-10" />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Bar className="h-3 w-3/4" />
              <Bar className="h-2.5 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProfileMiniCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[#e6e9ef] bg-[#eef1f5] p-5 shadow-sm">
      <div className="flex flex-col items-center gap-3 text-center">
        <Circle className="size-[72px]" />
        <div className="flex flex-col items-center gap-2">
          <Bar className="h-4 w-28" />
          <Bar className="h-3 w-36" />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 divide-x divide-[#e6e9ef] border-y border-[#e6e9ef] py-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex flex-col items-center gap-1.5">
            <Bar className="h-4 w-6" />
            <Bar className="h-2.5 w-12" />
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <Bar className="h-3.5 w-20" />
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="flex items-start gap-3">
            <Circle className="size-9" />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Bar className="h-2.5 w-24" />
              <Bar className="h-3.5 w-32" />
              <Bar className="h-2.5 w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SectionCardSkeleton({
  titleWidth = "w-28",
  rows = 2,
}: {
  titleWidth?: string;
  rows?: number;
}) {
  return (
    <div className="border border-x-0 border-[#e6e9ef] bg-[#eef1f5] p-5 lg:rounded-2xl lg:border-x lg:shadow-sm">
      <Bar className={`h-3.5 ${titleWidth}`} />
      <div className="mt-4 flex flex-col gap-4">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-start gap-3">
            <Circle className="size-10" />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Bar className="h-3 w-1/2" />
              <Bar className="h-2.5 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FeedItemSkeleton() {
  return (
    <article className="border border-x-0 border-[#e6e9ef] bg-[#eef1f5] p-5 lg:rounded-2xl lg:border-x lg:shadow-sm">
      <div className="flex items-start gap-3">
        <Circle className="size-11" />
        <div className="flex flex-1 flex-col gap-2 pt-0.5">
          <Bar className="h-3.5 w-40" />
          <Bar className="h-2.5 w-24" />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <Bar className="h-3 w-full" />
        <Bar className="h-3 w-11/12" />
        <Bar className="h-3 w-2/3" />
      </div>

      <div className="mt-4 grid grid-cols-4 gap-1 border-t border-[#e6e9ef] pt-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center justify-center py-1.5">
            <Bar className="h-4 w-4" />
          </div>
        ))}
      </div>
    </article>
  );
}

export function ComposerSkeleton() {
  return (
    <div className="border border-x-0 border-[#e6e9ef] bg-[#eef1f5] p-4 lg:rounded-2xl lg:border-x lg:shadow-sm">
      <div className="flex items-center gap-3">
        <Circle className="size-11" />
        <div className="h-10 flex-1 rounded-full bg-[#e6e9ef]" />
      </div>
      <div className="mt-3 flex items-center justify-around border-t border-[#e6e9ef] pt-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Bar key={index} className="h-4 w-16" />
        ))}
      </div>
    </div>
  );
}

export function CategoryPillsSkeleton() {
  const widths = ["w-14", "w-20", "w-16", "w-24", "w-16", "w-20"];
  return (
    <>
      {widths.map((width, index) => (
        <div key={index} className={`h-7 shrink-0 rounded-full bg-[#e6e9ef] ${width}`} />
      ))}
    </>
  );
}

export function ArticleCardSkeleton() {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="aspect-video w-full rounded-xl bg-[#e6e9ef]" />
      <Bar className="h-3.5 w-full" />
      <Bar className="h-3.5 w-2/3" />
      <Bar className="h-2.5 w-1/3" />
    </div>
  );
}

export function ArticleRowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-4">
      <div className="size-16 shrink-0 rounded-lg bg-[#e6e9ef]" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Bar className="h-3.5 w-full" />
        <Bar className="h-3.5 w-3/4" />
        <Bar className="h-2.5 w-1/3" />
      </div>
    </div>
  );
}

export function ProfileHeaderSkeleton() {
  return (
    <div className="overflow-hidden border border-x-0 border-[#e6e9ef] bg-[#eef1f5] lg:rounded-2xl lg:border-x lg:shadow-sm">
      <div className="h-28 bg-[#e6e9ef] sm:h-40" />
      <div className="px-5 pb-5 lg:px-6 lg:pb-6">
        <div className="flex items-start justify-between">
          <Circle className="-mt-14 size-28 lg:-mt-16" />
          <Bar className="mt-3 h-9 w-28 rounded-lg" />
        </div>
        <div className="mt-3 flex flex-col gap-2">
          <Bar className="h-5 w-40" />
          <Bar className="h-3 w-24" />
          <Bar className="mt-1 h-3.5 w-56" />
          <Bar className="h-3 w-48" />
        </div>
        <div className="mt-3 flex items-center gap-4">
          <Bar className="h-3.5 w-20" />
          <Bar className="h-3.5 w-20" />
        </div>
      </div>
    </div>
  );
}

export function ActivityRowSkeleton() {
  return (
    <div className="flex flex-col gap-2 border-t border-[#e6e9ef] pt-4 first:border-t-0 first:pt-0">
      <Bar className="h-2.5 w-32" />
      <Bar className="h-3 w-full" />
      <Bar className="h-3 w-11/12" />
      <Bar className="h-3 w-2/3" />
    </div>
  );
}

export function ActivityListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="border border-x-0 border-[#e6e9ef] bg-[#eef1f5] p-5 lg:rounded-2xl lg:border-x lg:shadow-sm">
      <Bar className="h-3.5 w-24" />
      <div className="mt-3 flex flex-col gap-4">
        {Array.from({ length: rows }).map((_, index) => (
          <ActivityRowSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
