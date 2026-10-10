import PageMargin from "@/components/common/PageMargin";
import Header from "@/components/navigations/Header";
import BottomNav from "@/components/navigations/BottomNav";
import { Bar } from "@/components/states/Skeleton";

export default function MembershipLoading() {
  return (
    <div className="min-h-screen bg-surface pb-16 lg:pb-0">
      <Header loading />

      <PageMargin className="animate-pulse py-6">
        <Bar className="hidden h-9 w-80 lg:block" />

        <div className="flex flex-col items-center gap-6 lg:mt-6 lg:grid lg:grid-cols-[420px_minmax(0,1fr)] lg:items-start">
          <div className="aspect-[85.6/54] w-full max-w-[420px] rounded-2xl bg-border" />

          <div className="w-full rounded-2xl border border-border bg-surface-muted p-5">
            <Bar className="h-3.5 w-40" />
            <div className="mt-4 flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex flex-col gap-1.5">
                  <Bar className="h-2.5 w-16" />
                  <Bar className="h-3.5 w-32" />
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-border pt-4">
              <Bar className="h-2.5 w-28" />
              <Bar className="mt-2 h-6 w-20 rounded-full" />
            </div>
          </div>
        </div>
      </PageMargin>

      <BottomNav />
    </div>
  );
}
