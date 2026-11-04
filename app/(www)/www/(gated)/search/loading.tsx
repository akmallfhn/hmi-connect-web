import PageMargin from "@/components/common/PageMargin";
import Header from "@/components/navigations/Header";
import BottomNav from "@/components/navigations/BottomNav";
import { Bar, Circle } from "@/components/states/Skeleton";
import SearchResultsSkeleton, {
  SuggestedConnectionsSkeleton,
} from "@/components/search/SearchResultsSkeleton";
import type { SearchCategory } from "@/apis/search";

const CATEGORIES: { value: SearchCategory; titleWidth: string }[] = [
  { value: "user", titleWidth: "w-12" },
  { value: "feed", titleWidth: "w-9" },
  { value: "entity", titleWidth: "w-20" },
  { value: "article", titleWidth: "w-12" },
];

export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-surface pb-16 lg:pb-0">
      <Header loading />

      <PageMargin
        noMobilePadding
        className="grid grid-cols-1 gap-8 pb-8 pt-5 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] lg:pt-8"
      >
        <main className="min-w-0">
          <p role="status" className="sr-only">Memuat hasil pencarian...</p>
          <div className="px-4 lg:px-0">
            <div aria-hidden="true" className="flex h-11 animate-pulse items-center gap-3 rounded-xl border border-border bg-surface px-3">
              <Circle className="size-[18px]" />
              <Bar className="h-3 w-36" />
            </div>
          </div>
          <div
            aria-hidden="true"
            className="mt-5 flex flex-col gap-1.5 lg:gap-4"
          >
            {CATEGORIES.map((category) => (
              <section
                key={category.value}
                className="overflow-hidden border border-x-0 border-border bg-surface lg:rounded-2xl lg:border-x"
              >
                <div className="px-5 pb-2 pt-5">
                  <Bar className={`h-3.5 ${category.titleWidth}`} />
                </div>
                <div className={category.value === "feed" ? "px-5" : "px-2"}>
                  <SearchResultsSkeleton category={category.value} />
                </div>
              </section>
            ))}
          </div>
        </main>

        <aside className="hidden lg:sticky lg:top-6 lg:block lg:self-start">
          <SuggestedConnectionsSkeleton />
        </aside>
      </PageMargin>

      <BottomNav />
    </div>
  );
}
