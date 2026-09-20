import PageMargin from "@/components/common/PageMargin";
import Header from "@/components/navigations/Header";
import BottomNav from "@/components/navigations/BottomNav";
import { Bar } from "@/components/states/Skeleton";

export default function QuranLoading() {
  return (
    <div className="min-h-screen bg-white pb-16 lg:pb-0">
      <Header loading mobileBackTitle="Al-Qur'an" />

      <PageMargin className="pt-3 lg:pb-10 lg:pt-6">
        <div className="flex flex-col gap-3 lg:gap-6">
          <div className="relative overflow-hidden rounded-2xl bg-[#eef1f5] p-5 lg:flex lg:min-h-[120px] lg:items-center">
            <div className="max-w-[60%] animate-pulse">
              <Bar className="h-5 w-full lg:w-80" />
              <Bar className="mt-2 h-5 w-4/5 lg:hidden" />
              <Bar className="mt-3 hidden h-3 w-52 lg:block" />
            </div>
            <div className="absolute bottom-0 right-0 h-32 w-40 animate-pulse bg-[#e6e9ef] lg:h-[213px] lg:w-[272px]" />
          </div>

          <div className="pb-6 lg:pb-0">
            <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6 animate-pulse">
              <div className="h-11 w-full flex-1 rounded-full bg-[#e6e9ef]" />
              <div className="flex gap-1 rounded-full bg-white p-1">
                <Bar className="h-10 w-24 rounded-full bg-[#e6e9ef]" />
                <Bar className="h-10 w-24 rounded-full bg-[#e6e9ef]" />
              </div>
            </div>

            <div className="animate-pulse">
              <div className="flex flex-col divide-y divide-[#e6e9ef] rounded-2xl border border-[#e6e9ef] bg-white px-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3 py-3">
                    <div className="size-9 shrink-0 rounded-full bg-[#e6e9ef]" />
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <Bar className="h-3.5 w-32" />
                      <Bar className="h-2.5 w-48" />
                    </div>
                    <Bar className="hidden h-5 w-12 lg:block" />
                    <div className="size-7 shrink-0 rounded-full bg-[#e6e9ef]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageMargin>

      <BottomNav />
    </div>
  );
}
