import { Bar, Circle } from "@/components/states/Skeleton";

// Suspense fallback for ChatsLayout's {children} slot only (the thread pane) —
// ChatsPage already renders the real Header/sidebar around this, so this must
// NOT duplicate that chrome or it renders nested inside the <main> pane.
export default function ChatsLoading() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-3 border-b border-[#e6e9ef] px-3 py-2.5 lg:h-[72px] lg:px-5 lg:py-0">
        <div className="flex min-w-0 flex-1 animate-pulse items-center gap-3 px-1 py-1">
          <Circle className="size-[34px]" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Bar className="h-3 w-28" />
            <Bar className="h-2.5 w-16" />
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-[#7b8190]">Memuat pesan...</p>
      </div>
    </div>
  );
}
