import PageMargin from "@/components/common/PageMargin";
import Header from "@/components/navigations/Header";
import BottomNav from "@/components/navigations/BottomNav";
import { Bar } from "@/components/states/Skeleton";

export default function QuranLoading() {
  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-16 lg:pb-0">
      <Header loading />

      <PageMargin className="pt-4">
        <div className="relative overflow-hidden rounded-2xl border border-[#e6e9ef] bg-[#eef1f5] p-5">
          <div className="max-w-[60%] animate-pulse">
            <Bar className="h-5 w-full" />
            <Bar className="mt-2 h-5 w-4/5" />
            <Bar className="mt-3 h-3 w-full" />
          </div>
          <div className="absolute bottom-0 right-0 h-36 w-28 animate-pulse bg-[#e6e9ef]" />
        </div>
      </PageMargin>

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
              <div className="size-7 shrink-0 rounded-full bg-[#e6e9ef]" />
            </div>
          ))}
        </div>
      </PageMargin>

      <BottomNav />
    </div>
  );
}
