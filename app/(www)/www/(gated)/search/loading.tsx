import PageMargin from "@/components/common/PageMargin";
import Header from "@/components/navigations/Header";
import BottomNav from "@/components/navigations/BottomNav";
import { Bar, Circle } from "@/components/states/Skeleton";
import SearchResultsSkeleton, {
  SuggestedConnectionsSkeleton,
} from "@/components/search/SearchResultsSkeleton";

const TAB_WIDTHS = ["w-11", "w-9", "w-13", "w-12"];

export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-surface pb-16 lg:pb-0">
      <Header loading />

      <PageMargin className="grid grid-cols-1 gap-8 pb-8 pt-5 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] lg:pt-8">
        <main className="min-w-0">
          <p role="status" className="sr-only">Memuat hasil pencarian...</p>
          <div aria-hidden="true" className="flex h-11 animate-pulse items-center gap-3 rounded-xl border border-border bg-surface px-3">
            <Circle className="size-[18px]" />
            <Bar className="h-3 w-36" />
          </div>
          <div aria-hidden="true" className="mt-5 grid grid-cols-4 border-b border-border">
            {TAB_WIDTHS.map((width, index) => (
              <div key={index} className="flex min-h-10 items-center justify-center gap-1.5">
                <Bar className={`h-3 ${width}`} />
                <Circle className="size-6" />
              </div>
            ))}
          </div>
          <section className="pt-5">
            <SearchResultsSkeleton category="user" />
          </section>
        </main>

        <aside className="hidden lg:sticky lg:top-6 lg:block lg:self-start">
          <SuggestedConnectionsSkeleton />
        </aside>
      </PageMargin>

      <BottomNav />
    </div>
  );
}
