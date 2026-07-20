import BottomNav from "@/components/navigations/BottomNav";
import Header from "@/components/navigations/Header";
import { Bar, Circle } from "@/components/states/Skeleton";

function ConversationRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Circle className="size-[52px]" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Bar className="h-3 w-2/5" />
        <Bar className="h-2.5 w-3/5" />
      </div>
    </div>
  );
}

export default function ChatsLoading() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-white">
      <Header loading />

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-full flex-col lg:w-[360px] lg:shrink-0 lg:border-r lg:border-[#e6e9ef] xl:w-[400px]">
          <div className="shrink-0 border-b border-[#e6e9ef] px-4 py-4">
            <Bar className="h-5 w-20" />
          </div>
          <div className="flex-1 animate-pulse overflow-hidden py-1">
            {Array.from({ length: 7 }).map((_, index) => (
              <ConversationRowSkeleton key={index} />
            ))}
          </div>
        </aside>

        <main className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
          <div className="size-16 animate-pulse rounded-full bg-[#e6e9ef]" />
        </main>
      </div>

      <div className="shrink-0 lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
