import { IconArticle } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import type { ArticleListEntry } from "@/apis/articles";
import { formatShortDate } from "@/lib/time-manipulation";

export default function SearchArticleRow({ article }: { article: ArticleListEntry }) {
  return (
    <Link
      href={`/articles/${article.slug_url || "artikel"}/${article.id}`}
      className="flex items-start gap-3 border-b border-[#e6e9ef] py-4 transition hover:bg-[#fafafa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
    >
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-[#7b8190]">
          {article.category_name}
        </p>
        <h3 className="font-stack-sans-headline mt-1.5 line-clamp-2 text-[15px] font-medium leading-snug text-[#172033]">
          {article.title}
        </h3>
        {article.description && (
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-5 text-[#53616d]">{article.description}</p>
        )}
        <p className="mt-2 text-xs text-[#78848f]">
          {article.author_name} · {formatShortDate(article.published_at)}
        </p>
      </div>
      {article.image_url ? (
        <div className="relative size-18 shrink-0 overflow-hidden rounded-lg bg-[#edf3f3] sm:size-22">
          <Image src={article.image_url} alt="" fill sizes="88px" className="object-cover" />
        </div>
      ) : (
        <span className="flex size-18 shrink-0 items-center justify-center rounded-lg bg-[#f5f7fb] text-[#aeb8c7] sm:size-22">
          <IconArticle className="size-6" stroke={1.6} />
        </span>
      )}
    </Link>
  );
}
