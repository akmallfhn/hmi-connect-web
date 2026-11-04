import PageMargin from "@/components/common/PageMargin";
import { Bar } from "@/components/states/Skeleton";

export default function EventsLoading() {
  return (
    <PageMargin className="pt-3 lg:pt-6">
      <div className="flex animate-pulse flex-col gap-4 pb-10 lg:gap-6">
        <div className="aspect-[3/1] rounded-xl bg-border lg:aspect-[6/1] lg:rounded-2xl" />
        <Bar className="h-11 w-full sm:w-80" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-2xl border border-border">
              <div className="aspect-[16/9] bg-border" />
              <div className="flex gap-3 p-4">
                <div className="size-12 shrink-0 rounded-lg bg-border" />
                <div className="flex flex-1 flex-col gap-2">
                  <Bar className="h-4 w-full" />
                  <Bar className="h-3 w-2/3" />
                  <Bar className="h-3 w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageMargin>
  );
}
