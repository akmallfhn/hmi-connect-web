import Image from "next/image";
import Link from "next/link";
import type { ArticleListEntry } from "@/apis/articles";
import { formatShortDate } from "@/lib/time-manipulation";
import type { ArticleStatusEnum } from "@/lib/types";
import Avatar from "../common/Avatar";
import Label, { type LabelVariant } from "../common/Label";

const STATUS_LABEL: Partial<
  Record<ArticleStatusEnum, { variant: LabelVariant; text: string }>
> = {
  draft: { variant: "gray", text: "Draft" },
  unpublished: { variant: "orange", text: "Tidak Tayang" },
};

function articleHref(article: ArticleListEntry) {
  return `/articles/${article.slug_url || "artikel"}/${article.id}`;
}

// articles/list carries no description, so keywords stand in as the row's secondary line.
function parseKeywords(keywords?: string) {
  if (!keywords) return [];
  return keywords
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean)
    .slice(0, 3);
}

interface ArticleListRowProps {
  article: ArticleListEntry;
}

export default function ArticleListRow({ article }: ArticleListRowProps) {
  const status = STATUS_LABEL[article.status];
  const keywords = parseKeywords(article.keywords);

  return (
    <Link
      href={articleHref(article)}
      className="group flex gap-4 py-5 sm:gap-6"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Avatar
            src={article.author_avatar}
            name={article.author_name}
            size={20}
          />
          <span className="truncate text-[13px] text-[#5f6573] lg:text-sm">
            {article.author_name}
          </span>
          {status && <Label variant={status.variant}>{status.text}</Label>}
        </div>

        <h2 className="font-stack-sans-headline mt-2 line-clamp-2 text-lg font-medium leading-snug text-[#172033] hover:text-secondary sm:text-xl">
          {article.title}
        </h2>

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-[#8a909d] lg:text-sm">
          <span>{formatShortDate(article.published_at)}</span>
          <span aria-hidden="true">·</span>
          <Label variant="gray" size="sm">
            {article.category_name}
          </Label>
          {keywords.map((keyword) => (
            <span key={keyword} className="hidden sm:inline">
              #{keyword}
            </span>
          ))}
        </div>
      </div>

      {article.image_url && (
        <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-[#f5f7fb] sm:size-28">
          <Image
            src={article.image_url}
            alt=""
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      )}
    </Link>
  );
}
