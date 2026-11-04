import PageMargin from "@/components/common/PageMargin";
import { Bar } from "@/components/states/Skeleton";

export default function EventDetailLoading() {
  return (
    <div className="animate-pulse">
      <div className="hidden min-h-72 bg-border lg:block" />
      <PageMargin>
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="relative -mx-4 overflow-hidden border-b border-border bg-surface lg:col-start-2 lg:row-start-1 lg:mx-0 lg:-mt-[191px] lg:rounded-2xl lg:border xl:-mt-[225px]">
            <div className="aspect-[16/9] bg-surface-muted" />
            <div className="flex flex-col gap-3 p-4">
              <Bar className="h-6 w-3/4" />
              <Bar className="h-4 w-1/2" />
              <Bar className="h-4 w-2/3" />
              <Bar className="h-9 w-full rounded-lg" />
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl border border-border p-5 lg:col-start-1 lg:row-start-1 lg:mt-6">
            <Bar className="h-4 w-24" />
            <Bar className="h-3.5 w-full" />
            <Bar className="h-3.5 w-3/4" />
            <Bar className="h-3.5 w-2/3" />
          </div>
        </div>
      </PageMargin>
    </div>
  );
}
