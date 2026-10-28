import PageMargin from "@/components/common/PageMargin";
import Header from "@/components/navigations/Header";
import BottomNav from "@/components/navigations/BottomNav";
import { Bar } from "@/components/states/Skeleton";

export default function PrayerSchedulesLoading() {
  return (
    <div className="min-h-screen bg-surface pb-16 lg:pb-0">
      <Header loading mobileBackTitle="Jadwal Sholat" />

      <PageMargin className="pb-8 pt-3 lg:pb-10 lg:pt-6">
        <Bar className="mb-4 hidden h-7 w-44 lg:block" />

        <div className="flex flex-col gap-6 lg:gap-8">
          <div className="animate-pulse overflow-hidden rounded-2xl border border-border">
            <div className="h-[340px] bg-surface-muted lg:h-[248px]" />
            <div className="flex flex-col gap-1 p-3 lg:grid lg:grid-cols-8 lg:gap-2 lg:p-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-4 py-3 lg:flex-col lg:gap-2 lg:px-2"
                >
                  <Bar className="h-3.5 w-16" />
                  <Bar className="h-4 w-12" />
                </div>
              ))}
            </div>
          </div>

          <div className="animate-pulse">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between lg:mb-4">
              <div className="flex flex-col gap-2">
                <Bar className="h-6 w-72" />
                <Bar className="h-3.5 w-56" />
              </div>
              <Bar className="h-11 w-full rounded-xl sm:w-56" />
            </div>
            <div className="flex flex-col divide-y divide-divider rounded-2xl border border-border">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 px-4 py-3">
                  <div className="size-9 shrink-0 rounded-lg bg-border" />
                  <Bar className="h-3.5 w-24" />
                  <Bar className="ml-auto h-3.5 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageMargin>

      <BottomNav />
    </div>
  );
}
