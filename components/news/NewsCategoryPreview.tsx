import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { NewsArticle, NewsCategory } from "@/apis/news";
import NewsArticleCard from "./NewsArticleCard";

interface NewsCategoryPreviewProps {
  category: NewsCategory;
  articles: NewsArticle[];
}

export default function NewsCategoryPreview({
  category,
  articles,
}: NewsCategoryPreviewProps) {
  const [main, ...side] = articles;
  if (!main) return null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-[#e6e9ef] pb-3">
        <div className="flex items-center gap-2">
          <span className="h-4 w-1 rounded-full bg-primary" />
          <h2 className="text-base font-bold text-[#172033]">
            {category.name}
          </h2>
        </div>
        <Link
          href={`/news/${category.slug}`}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Selengkapnya
          <ChevronRight className="size-4" />
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <NewsArticleCard article={main} variant="heroMain" />

        {side.length > 0 && (
          <div className="flex flex-col gap-4 divide-y divide-[#e6e9ef]">
            {side.map((article) => (
              <div key={article.id} className="pt-4 first:pt-0">
                <NewsArticleCard article={article} variant="heroSide" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
