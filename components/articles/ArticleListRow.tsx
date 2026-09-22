"use client";

import { Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  viewerId?: string;
}

export default function ArticleListRow({
  article,
  viewerId,
}: ArticleListRowProps) {
  const router = useRouter();
  const status = STATUS_LABEL[article.status];
  const keywords = parseKeywords(article.keywords);
  const canEdit = Boolean(viewerId) && article.author_id === viewerId;

  // A nested <a> inside the row's own link would break hydration, so edit navigates by router.
  function handleEdit(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    router.push(`${articleHref(article)}/edit`);
  }

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

        <h2 className="font-stack-sans-headline mt-2 line-clamp-2 text-[15px] lg:text-lg font-medium leading-snug text-[#172033] hover:text-secondary sm:text-xl">
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

        {canEdit && (
          <button
            type="button"
            onClick={handleEdit}
            aria-label={`Edit artikel ${article.title}`}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-[#dbe3ef] px-2.5 py-1.5 text-[13px] font-medium text-[#454b57] transition hover:bg-[#f5f7fb] hover:text-[#172033]"
          >
            <Pencil className="size-3.5" />
            Edit
          </button>
        )}
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
