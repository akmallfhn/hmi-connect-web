"use client";

import { Eye, MoreHorizontal, Pencil, Repeat2, Share2 } from "lucide-react";
import { IconPhotoOff } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ArticleListEntry } from "@/apis/articles";
import { formatShortDate } from "@/lib/time-manipulation";
import type { ArticleStatusEnum } from "@/lib/types";
import Avatar from "../common/Avatar";
import Button from "../buttons/Button";
import Dropdown from "../common/Dropdown";
import Label, { type LabelVariant } from "../common/Label";
import ArticleShareModal from "./ArticleShareModal";
import { articleComposeDraft } from "./article-compose-draft";
import {
  COMPOSE_INTENT_ARTICLE_KEY,
  COMPOSE_INTENT_KEY,
} from "@/lib/constants";

const MENU_ITEM_CLASS =
  "flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-heading transition hover:bg-surface-muted";

const STATUS_LABEL: Partial<
  Record<ArticleStatusEnum, { variant: LabelVariant; text: string }>
> = {
  draft: { variant: "gray", text: "Draft" },
  unpublished: { variant: "orange", text: "Tidak Tayang" },
};

function articleHref(article: ArticleListEntry) {
  return `/articles/${article.slug_url || "artikel"}/${article.id}`;
}

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
  const [shareOpen, setShareOpen] = useState(false);
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${articleHref(article)}`
      : "";

  // A nested <a> inside the row's own link would break hydration, so menu items navigate by router.
  function go(path: string) {
    return (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      router.push(path);
    };
  }

  function repostToFeed(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    const draft = articleComposeDraft(article);
    window.sessionStorage.setItem(
      COMPOSE_INTENT_ARTICLE_KEY,
      JSON.stringify(draft)
    );
    window.sessionStorage.setItem(COMPOSE_INTENT_KEY, "1");
    window.dispatchEvent(new Event(COMPOSE_INTENT_KEY));
    router.push(viewerId ? "/" : "/auth/login?redirectTo=%2F");
  }

  return (
    <>
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
            <span className="truncate text-[13px] text-muted-foreground lg:text-sm">
              {article.author_name}
            </span>
            {status && <Label variant={status.variant}>{status.text}</Label>}
          </div>

          <h2 className="font-stack-sans-headline mt-2 line-clamp-2 text-[15px] sm:text-[17px] font-medium leading-snug text-heading hover:text-secondary-foreground">
            {article.title}
          </h2>

          {article.description?.trim() && (
            <p className="mt-1 line-clamp-1 text-[13px] leading-5 text-muted-foreground lg:text-sm">
              {article.description}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-disabled-foreground lg:text-sm">
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

          <div className="-ml-2 mt-3 flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={repostToFeed}
              aria-label={`Repost artikel ${article.title} ke feed`}
              title="Repost ke feed"
              className="size-8 shrink-0 rounded-full text-muted-foreground hover:bg-surface-muted"
            >
              <Repeat2 className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setShareOpen(true);
              }}
              aria-label={`Bagikan artikel ${article.title}`}
              title="Bagikan artikel"
              className="size-8 shrink-0 rounded-full text-muted-foreground hover:bg-surface-muted"
            >
              <Share2 className="size-4" />
            </Button>
            <Dropdown
              align="left"
              trigger={({ toggle }) => (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    toggle();
                  }}
                  aria-label={`Opsi artikel ${article.title}`}
                  className="size-8 shrink-0 rounded-full text-muted-foreground hover:bg-surface-muted"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              )}
            >
              <div className="flex flex-col py-1">
                <button
                  type="button"
                  onClick={go(articleHref(article))}
                  className={MENU_ITEM_CLASS}
                >
                  <Eye className="size-4 text-muted-foreground" />
                  Lihat artikel
                </button>
                {canEdit && (
                  <button
                    type="button"
                    onClick={go(`${articleHref(article)}/edit`)}
                    className={MENU_ITEM_CLASS}
                  >
                    <Pencil className="size-4 text-muted-foreground" />
                    Edit artikel
                  </button>
                )}
              </div>
            </Dropdown>
          </div>
        </div>

        <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-muted text-subtle-foreground sm:size-28">
          {article.image_url ? (
            <Image
              src={article.image_url}
              alt=""
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <IconPhotoOff className="size-7" stroke={1.8} aria-hidden="true" />
          )}
        </div>
      </Link>

      {/* Outside the Link, since React events bubble through the portal into the row's navigation. */}
      <ArticleShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        article={article}
        url={shareUrl}
      />
    </>
  );
}
