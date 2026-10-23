import PageMargin from "@/components/common/PageMargin";
import BottomNav from "@/components/navigations/BottomNav";
import Header from "@/components/navigations/Header";
import { Bar, Circle } from "@/components/states/Skeleton";

export default function PeopleRecommendationLoading() {
  return (
    <div className="min-h-screen bg-surface pb-16 lg:pb-0">
      <Header loading mobileBackTitle="Mungkin Kamu Kenal" />

      <PageMargin noMobilePadding className="pb-6 pt-4 lg:pt-6">
        <main className="min-w-0">
          <Bar className="mx-3 mb-5 hidden h-7 w-52 lg:block" />
          <div className="grid grid-cols-2 gap-3 px-3 sm:grid-cols-3 lg:grid-cols-4 lg:px-0 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-2xl border border-border bg-surface"
              >
                <div className="relative h-16 bg-border sm:h-20">
                  <Circle className="absolute left-1/2 top-5 size-20 -translate-x-1/2 border-4 border-surface sm:top-7" />
                </div>
                <div className="flex flex-col items-center px-3 pb-3 pt-12 sm:px-4 sm:pb-4">
                  <Bar className="h-3.5 w-24 max-w-full" />
                  <Bar className="mt-2 h-2.5 w-16 max-w-full" />
                  <Bar className="mt-4 h-2.5 w-28 max-w-full" />
                  <Bar className="mt-2 h-2.5 w-20 max-w-full" />
                  <Bar className="mt-4 h-8 w-full rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </PageMargin>

      <BottomNav />
    </div>
  );
}
