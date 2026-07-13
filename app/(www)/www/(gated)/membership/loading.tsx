import PageMargin from "@/components/common/PageMargin";
import Header from "@/components/navigations/Header";
import BottomNav from "@/components/navigations/BottomNav";
import { Bar } from "@/components/states/Skeleton";

export default function MembershipLoading() {
  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-16 lg:pb-0">
      <Header />

      <PageMargin className="animate-pulse py-6">
        <Bar className="h-6 w-24" />
        <Bar className="mt-2 h-3.5 w-64" />

        <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
          <div className="aspect-[85.6/54] w-full max-w-[420px] rounded-2xl bg-[#e6e9ef]" />

          <div className="rounded-2xl border border-[#e6e9ef] bg-[#eef1f5] p-5 shadow-sm">
            <Bar className="h-3.5 w-40" />
            <div className="mt-4 flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex flex-col gap-1.5">
                  <Bar className="h-2.5 w-16" />
                  <Bar className="h-3.5 w-32" />
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-[#e6e9ef] pt-4">
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
