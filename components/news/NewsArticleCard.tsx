import Image from "next/image";
import { Newspaper } from "lucide-react";
import type { NewsArticle } from "@/apis/news";
import { formatRelativeTime } from "@/lib/formatRelativeTime";

type NewsArticleCardVariant = "featured" | "grid" | "mobileBig" | "mobileList";

interface NewsArticleCardProps {
  article: NewsArticle;
  variant?: NewsArticleCardVariant;
}

function ArticleImage({
  article,
  className,
}: {
  article: NewsArticle;
  className: string;
}) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden bg-[#f5f7fb] ${className}`}
    >
      {article.image_url ? (
        <Image
          src={article.image_url}
          alt={article.title}
          fill
          className="object-cover transition duration-200 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Newspaper className="size-8 text-[#c3c7d1]" />
        </div>
      )}
    </div>
  );
}

function CategoryBadge({ name }: { name: string }) {
  return (
    <span className="w-fit rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-medium text-primary">
      {name}
    </span>
  );
}

function SourceLogo({ article }: { article: NewsArticle }) {
  if (article.source_logo_url) {
    return (
      <span className="relative size-4 shrink-0 overflow-hidden rounded-sm bg-[#f5f7fb]">
        <Image
          src={article.source_logo_url}
          alt={article.source_name}
          fill
          className="object-cover"
        />
      </span>
    );
  }

  return (
    <span className="size-4 shrink-0 rounded-sm border border-[#e6e9ef] bg-[#f5f7fb]" />
  );
}

function SourceRow({ article }: { article: NewsArticle }) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <SourceLogo article={article} />
      <span className="truncate text-xs font-semibold text-[#172033]">
        {article.source_name}
      </span>
    </div>
  );
}

function Timestamp({ article }: { article: NewsArticle }) {
  if (!article.published_at) return null;
  return (
    <p className="text-xs text-[#7b8190]">
      {formatRelativeTime(article.published_at)}
    </p>
  );
}

function ArticleMeta({
  article,
  pinBottom = true,
}: {
  article: NewsArticle;
  pinBottom?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 pt-1.5 text-xs text-[#7b8190] ${pinBottom ? "mt-auto" : ""}`}
    >
      <SourceLogo article={article} />
      <p className="truncate">
        {article.source_name}
        {article.published_at && (
          <> · {formatRelativeTime(article.published_at)}</>
        )}
      </p>
    </div>
  );
}

export default function NewsArticleCard({
  article,
  variant = "grid",
}: NewsArticleCardProps) {
  if (variant === "featured") {
    return (
      <a
        href={article.source_url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col overflow-hidden rounded-2xl border border-[#e6e9ef] bg-white transition hover:shadow-md lg:flex-row"
      >
        <ArticleImage
          article={article}
          className="aspect-[16/9] w-full lg:w-[52%] lg:self-start"
        />

        <div className="flex flex-1 flex-col justify-center gap-2 p-5">
          {article.category_name && (
            <CategoryBadge name={article.category_name} />
          )}

          <p className="line-clamp-3 text-lg font-bold leading-snug text-[#172033] transition group-hover:underline group-hover:decoration-1 group-hover:underline-offset-2 lg:text-xl">
            {article.title}
          </p>

          {article.summary && (
            <p className="line-clamp-2 text-sm text-[#5f6573] lg:line-clamp-3">
              {article.summary}
            </p>
          )}

          <ArticleMeta article={article} pinBottom={false} />
        </div>
      </a>
    );
  }

  // Google-News-style "big thumbnail" mobile row: source on top, full-width image, title, timestamp.
  if (variant === "mobileBig") {
    return (
      <a
        href={article.source_url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col gap-2"
      >
        <SourceRow article={article} />
        <ArticleImage article={article} className="aspect-[16/9] w-full rounded-xl" />
        <p className="line-clamp-2 text-base font-bold leading-snug text-[#172033] transition group-hover:underline">
          {article.title}
        </p>
        <Timestamp article={article} />
      </a>
    );
  }

  // Google-News-style list row: source on top, title + small square thumbnail side by side, timestamp.
  if (variant === "mobileList") {
    return (
      <a
        href={article.source_url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col gap-2"
      >
        <SourceRow article={article} />
        <div className="flex items-start justify-between gap-3">
          <p className="line-clamp-3 flex-1 text-sm font-semibold leading-snug text-[#172033] transition group-hover:underline">
            {article.title}
          </p>
          <ArticleImage
            article={article}
            className="aspect-square w-20 shrink-0 rounded-lg"
          />
        </div>
        <Timestamp article={article} />
      </a>
    );
  }

  return (
    <a
      href={article.source_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-xl border border-[#e6e9ef] bg-white transition hover:shadow-md"
    >
      <ArticleImage article={article} className="aspect-video w-full" />

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {article.category_name && (
          <CategoryBadge name={article.category_name} />
        )}

        <p className="line-clamp-2 text-sm font-semibold leading-snug text-[#172033] transition group-hover:underline group-hover:decoration-1 group-hover:underline-offset-2">
          {article.title}
        </p>

        <ArticleMeta article={article} />
      </div>
    </a>
  );
}
