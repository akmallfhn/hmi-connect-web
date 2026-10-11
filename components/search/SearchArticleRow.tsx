import { IconArticle } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import type { ArticleListEntry } from "@/apis/articles";
import { formatShortDate } from "@/lib/time-manipulation";

export default function SearchArticleRow({ article }: { article: ArticleListEntry }) {
  return (
    <div className="border-b border-border">
      <Link
        href={`/articles/${article.slug_url || "artikel"}/${article.id}`}
        className="flex items-start gap-3 rounded-xl px-3 py-4 transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
      >
        <div className="min-w-0 flex-1">
          <h3 className="font-stack-sans-headline line-clamp-2 text-[15px] font-medium leading-snug text-heading">
            {article.title}
          </h3>
          {article.description && (
            <p className="mt-1.5 line-clamp-2 text-[13px] leading-5 text-muted-foreground lg:text-sm">
              {article.description}
            </p>
          )}
          <p className="mt-2 text-[13px] text-subtle-foreground lg:text-sm">
            {article.author_name} · {formatShortDate(article.published_at)}
          </p>
        </div>
        {article.image_url ? (
          <div className="relative size-18 shrink-0 overflow-hidden rounded-lg bg-surface-muted sm:size-22">
            <Image src={article.image_url} alt="" fill sizes="88px" className="object-cover" />
          </div>
        ) : (
          <span className="flex size-18 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-subtle-foreground sm:size-22">
            <IconArticle className="size-6" stroke={1.6} />
          </span>
        )}
      </Link>
    </div>
  );
}
