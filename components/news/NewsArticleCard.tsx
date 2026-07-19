import Image from "next/image";
import { Newspaper } from "lucide-react";
import type { ReactNode } from "react";
import type { NewsArticle } from "@/apis/news";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import RepostToFeedButton from "./RepostToFeedButton";

type NewsArticleCardVariant =
  | "grid"
  | "mobileBig"
  | "mobileList"
  | "heroMain"
  | "heroSide";

interface NewsArticleCardProps {
  article: NewsArticle;
  variant?: NewsArticleCardVariant;
}

function ArticleImage({
  article,
  className,
  overlay,
  cornerAction,
  dim,
}: {
  article: NewsArticle;
  className: string;
  overlay?: ReactNode;
  cornerAction?: ReactNode;
  dim?: boolean;
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
      {dim && <div className="absolute inset-0 bg-black/25" />}
      {overlay && (
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-5 pb-4 pt-12">
          {overlay}
        </div>
      )}
      {cornerAction}
    </div>
  );
}

function CategoryBadge({ name }: { name: string }) {
  return (
    <span className="w-fit rounded-full border border-primary bg-primary-soft px-2.5 py-0.5 text-xs font-medium text-primary xl:text-sm">
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
    <p className="text-xs text-[#7b8190] xl:text-sm">
      {formatRelativeTime(article.published_at)}
    </p>
  );
}

function ArticleMeta({ article }: { article: NewsArticle }) {
  return (
    <div className="mt-auto flex items-center gap-2 pt-1.5">
      <div className="flex min-w-0 flex-1 items-center gap-1.5 text-xs text-[#7b8190] xl:text-sm">
        <SourceLogo article={article} />
        <p className="truncate">
          {article.source_name}
          {article.published_at && (
            <> · {formatRelativeTime(article.published_at)}</>
          )}
        </p>
      </div>
      <RepostToFeedButton article={article} className="text-[#5f6573]" />
    </div>
  );
}

export default function NewsArticleCard({
  article,
  variant = "grid",
}: NewsArticleCardProps) {
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
        <ArticleImage
          article={article}
          className="aspect-[16/9] w-full rounded-xl"
        />
        <p className="line-clamp-2 text-base font-bold leading-snug text-[#172033] transition group-hover:underline">
          {article.title}
        </p>
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <Timestamp article={article} />
          </div>
          <RepostToFeedButton article={article} className="text-[#5f6573]" />
        </div>
      </a>
    );
  }

  // Google-News-style list row: source on top, title + small square thumbnail side by side, timestamp under the title.
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
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <p className="line-clamp-3 text-sm font-semibold leading-snug text-[#172033] transition group-hover:underline">
              {article.title}
            </p>
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <Timestamp article={article} />
              </div>
              <RepostToFeedButton
                article={article}
                className="text-[#5f6573]"
              />
            </div>
          </div>
          <ArticleImage
            article={article}
            className="aspect-square w-20 shrink-0 rounded-lg"
          />
        </div>
      </a>
    );
  }

  // Desktop hero: big image with title/publisher/timestamp/summary overlaid on a dark gradient at the bottom.
  if (variant === "heroMain") {
    return (
      <a
        href={article.source_url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block"
      >
        <ArticleImage
          article={article}
          className="aspect-[21/9] w-full rounded-2xl"
          dim
          overlay={
            <>
              <div className="flex min-w-0 items-center gap-1.5 text-xs text-white/80 xl:text-sm">
                <SourceLogo article={article} />
                <span className="truncate font-semibold text-white">
                  {article.source_name}
                </span>
                {article.published_at && (
                  <span className="shrink-0">
                    · {formatRelativeTime(article.published_at)}
                  </span>
                )}
              </div>
              <p className="line-clamp-2 pr-16 text-xl font-bold leading-snug text-white transition group-hover:underline group-hover:decoration-1 group-hover:underline-offset-2 xl:pr-20 xl:text-2xl">
                {article.title}
              </p>
              {article.summary && (
                <p className="line-clamp-2 pr-16 text-sm text-white/85 xl:pr-20 xl:text-base">
                  {article.summary}
                </p>
              )}
            </>
          }
          cornerAction={
            <RepostToFeedButton
              article={article}
              variant="secondary"
              size="lg"
              className="absolute bottom-4 right-4 z-10 shadow-lg"
            />
          }
        />
      </a>
    );
  }

  // Desktop hero sidebar row: small square thumbnail, timestamp above title.
  if (variant === "heroSide") {
    return (
      <a
        href={article.source_url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-start gap-3"
      >
        <ArticleImage
          article={article}
          className="aspect-square w-20 shrink-0 rounded-lg"
        />
        <div className="flex min-w-0 flex-col gap-1.5">
          <Timestamp article={article} />
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-2 min-w-0 flex-1 text-sm font-semibold leading-snug text-[#172033] transition group-hover:underline xl:text-base">
              {article.title}
            </p>
            <RepostToFeedButton article={article} className="text-[#5f6573]" />
          </div>
        </div>
      </a>
    );
  }

  return (
    <a
      href={article.source_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-2"
    >
      <ArticleImage
        article={article}
        className="aspect-video w-full rounded-xl"
      />

      <div className="flex flex-1 flex-col gap-1.5">
        {article.category_name && (
          <CategoryBadge name={article.category_name} />
        )}

        <p className="line-clamp-2 text-sm font-semibold leading-snug text-[#172033] transition group-hover:underline group-hover:decoration-1 group-hover:underline-offset-2 xl:text-base">
          {article.title}
        </p>

        <ArticleMeta article={article} />
      </div>
    </a>
  );
}
