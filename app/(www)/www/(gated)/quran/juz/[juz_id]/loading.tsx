import PageMargin from "@/components/common/PageMargin";
import Header from "@/components/navigations/Header";
import BottomNav from "@/components/navigations/BottomNav";
import { Bar } from "@/components/states/Skeleton";

export default function QuranJuzLoading() {
  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-16 lg:pb-0">
      <Header loading />

      <div className="bg-gradient-to-br from-primary to-[#0d5f63] pb-6 pt-6">
        <PageMargin className="animate-pulse">
          <div className="h-6 w-24 rounded-full bg-white/20" />
          <div className="mt-2 h-4 w-16 rounded-full bg-white/20" />
          <div className="mt-1.5 h-3 w-56 rounded-full bg-white/20" />
        </PageMargin>
      </div>

      <PageMargin className="animate-pulse flex flex-col gap-6 pb-6 pt-4">
        {Array.from({ length: 2 }).map((_, groupIndex) => (
          <div
            key={groupIndex}
            className="flex flex-col rounded-2xl border border-[#e6e9ef] bg-white px-4"
          >
            <div className="border-b border-[#e6e9ef] py-3">
              <Bar className="h-3.5 w-32" />
            </div>
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col gap-3 border-b border-[#e6e9ef] py-5 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div className="size-8 shrink-0 rounded-full bg-[#e6e9ef]" />
                  <div className="size-8 shrink-0 rounded-full bg-[#e6e9ef]" />
                </div>
                <Bar className="ml-auto h-6 w-3/4" />
                <Bar className="ml-auto h-6 w-1/2" />
                <Bar className="h-3 w-full" />
                <Bar className="h-3 w-5/6" />
              </div>
            ))}
          </div>
        ))}
      </PageMargin>

      <BottomNav />
    </div>
  );
}
