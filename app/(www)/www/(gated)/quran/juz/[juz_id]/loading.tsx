import PageMargin from "@/components/common/PageMargin";
import Header from "@/components/navigations/Header";
import BottomNav from "@/components/navigations/BottomNav";
import { Bar } from "@/components/states/Skeleton";

export default function QuranJuzLoading() {
  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-16 lg:pb-0">
      <Header loading />

      <PageMargin className="pt-4">
        <div className="animate-pulse rounded-2xl border border-[#e6e9ef] bg-[#eef1f5] p-5">
          <Bar className="h-6 w-24" />
          <Bar className="mt-2 h-4 w-16" />
          <Bar className="mt-1.5 h-3 w-56" />
        </div>
      </PageMargin>

      <PageMargin className="flex animate-pulse flex-col gap-6 pb-6 pt-4">
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
                <Bar className="ml-auto h-6 w-3/4" />
                <Bar className="ml-auto h-6 w-1/2" />
                <Bar className="h-3 w-full" />
                <Bar className="h-3 w-5/6" />
                <div className="mt-1 flex gap-2">
                  <Bar className="h-8 w-24" />
                  <Bar className="h-8 w-20" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </PageMargin>

      <BottomNav />
    </div>
  );
}
