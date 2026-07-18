import PageMargin from "@/components/common/PageMargin";
import Header from "@/components/navigations/Header";
import BottomNav from "@/components/navigations/BottomNav";
import { Bar } from "@/components/states/Skeleton";

export default function QuranLoading() {
  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-16 lg:pb-0">
      <Header loading />

      <div className="bg-gradient-to-br from-primary to-[#0d5f63] pb-6 pt-6">
        <PageMargin className="animate-pulse">
          <div className="h-3.5 w-32 rounded-full bg-white/20" />
          <div className="mt-2 h-5 w-64 rounded-full bg-white/20" />
        </PageMargin>
      </div>

      <PageMargin className="animate-pulse py-4">
        <div className="h-11 w-full rounded-full bg-[#e6e9ef]" />
        <div className="mt-4 h-10 w-full rounded-full bg-[#e6e9ef]" />
      </PageMargin>

      <PageMargin className="animate-pulse pb-6">
        <div className="flex flex-col divide-y divide-[#e6e9ef] rounded-2xl border border-[#e6e9ef] bg-white px-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 py-3">
              <div className="size-9 shrink-0 rounded-full bg-[#e6e9ef]" />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Bar className="h-3.5 w-32" />
                <Bar className="h-2.5 w-48" />
              </div>
              <div className="size-10 shrink-0 rounded-full bg-[#e6e9ef]" />
            </div>
          ))}
        </div>
      </PageMargin>

      <BottomNav />
    </div>
  );
}
