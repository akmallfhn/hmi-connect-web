import type { NewsArticle } from "@/apis/news";
import NewsArticleCard from "../news/NewsArticleCard";

export default function NewsCarousel({
  articles,
  // "Kabar HMI" is the sidebar card now; this strip is unfiltered, so it keeps the old name.
  title = "Kabar Trending",
}: {
  articles: NewsArticle[];
  title?: string;
}) {
  if (articles.length === 0) return null;

  return (
    <section className="border border-x-0 border-[#e6e9ef] bg-white py-4 lg:rounded-2xl lg:border-x">
      <h2 className="font-stack-sans-headline px-4 text-sm font-medium text-[#172033] xl:text-[15px]">
        {title}
      </h2>

      {/* Without scroll-px-4 the snap pulls the first card flush left, past the heading. */}
      <div className="mt-3 flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto scroll-px-4 px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {articles.map((article) => (
          <NewsArticleCard
            key={article.id}
            article={article}
            variant="carousel"
          />
        ))}
      </div>
    </section>
  );
}
