import PageMargin from "@/components/common/PageMargin";
import Header from "@/components/navigations/Header";
import BottomNav from "@/components/navigations/BottomNav";
import { Bar } from "@/components/states/Skeleton";

export default function QuranSurahLoading() {
  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-16 lg:pb-0">
      <Header loading />

      <PageMargin className="pt-4">
        <div className="rounded-2xl border border-[#e6e9ef] bg-[#eef1f5] p-5">
          <div className="animate-pulse">
            <Bar className="h-9 w-32" />
            <Bar className="mt-3 h-6 w-40" />
            <Bar className="mt-2 h-3.5 w-28" />
            <div className="mt-3 flex gap-2">
              <Bar className="h-6 w-20" />
              <Bar className="h-6 w-16" />
              <Bar className="h-6 w-24" />
            </div>
            <Bar className="mt-4 h-3 w-full" />
            <Bar className="mt-1.5 h-3 w-5/6" />
            <Bar className="mt-4 h-8 w-32" />
          </div>
        </div>
      </PageMargin>

      <PageMargin className="animate-pulse pb-6 pt-4">
        <div className="flex flex-col rounded-2xl border border-[#e6e9ef] bg-white px-4">
          {Array.from({ length: 5 }).map((_, index) => (
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
      </PageMargin>

      <BottomNav />
    </div>
  );
}
