"use client";

import { IconPhotoOff } from "@tabler/icons-react";
import { ExternalLink, MoreHorizontal, Share2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { NewsArticle } from "@/apis/news";
import { formatShortDate } from "@/lib/time-manipulation";
import Avatar from "../common/Avatar";
import Button from "../buttons/Button";
import Dropdown from "../common/Dropdown";
import Label from "../common/Label";
import ShareModal from "../modals/ShareModal";
import RepostToFeedButton from "./RepostToFeedButton";

interface NewsArticleCardProps {
  article: NewsArticle;
  variant: "list" | "carousel";
}

function CarouselImage({ article }: { article: NewsArticle }) {
  return (
    <div className="relative flex aspect-[4/3] w-full shrink-0 items-center justify-center overflow-hidden bg-surface-muted text-subtle-foreground">
      {article.image_url ? (
        <Image
          src={article.image_url}
          alt={article.title}
          fill
          className="object-cover transition duration-200 group-hover:scale-105"
        />
      ) : (
        <IconPhotoOff className="size-8" stroke={1.8} aria-hidden="true" />
      )}
    </div>
  );
}

export default function NewsArticleCard({ article, variant }: NewsArticleCardProps) {
  const [shareOpen, setShareOpen] = useState(false);

  if (variant === "carousel") {
    return (
      <a
        href={article.source_url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex w-64 shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-border bg-surface"
      >
        <CarouselImage article={article} />
        <div className="flex flex-1 flex-col gap-2 p-3">
          <div className="flex min-w-0 items-center gap-1.5">
            <Avatar src={article.source_logo_url} name={article.source_name} size={16} />
            <span className="truncate text-xs text-muted-foreground">{article.source_name}</span>
          </div>
          <div className="flex items-start gap-1">
            <p className="font-stack-sans-headline line-clamp-2 min-w-0 flex-1 text-sm font-medium leading-snug text-heading transition lg:text-[15px]">
              {article.title}
            </p>
            <RepostToFeedButton article={article} className="shrink-0 text-muted-foreground" />
          </div>
        </div>
      </a>
    );
  }

  return (
    <>
      <a
        href={article.source_url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex gap-4 py-5 sm:gap-6"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Avatar src={article.source_logo_url} name={article.source_name} size={20} />
            <span className="truncate text-[13px] text-muted-foreground lg:text-sm">
              {article.source_name}
            </span>
          </div>

          <h2 className="font-stack-sans-headline mt-2 line-clamp-2 text-[15px] font-medium leading-snug text-heading hover:text-secondary-foreground sm:text-xl lg:text-lg">
            {article.title}
          </h2>

          {(article.published_at || article.category_name) && (
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-disabled-foreground lg:text-sm">
              {article.published_at && <span>{formatShortDate(article.published_at)}</span>}
              {article.published_at && article.category_name && <span aria-hidden="true">·</span>}
              {article.category_name && (
                <Label variant="gray" size="sm">{article.category_name}</Label>
              )}
            </div>
          )}

          <div className="-ml-2 mt-3 flex items-center gap-1">
            <RepostToFeedButton
              article={article}
              className="size-8 text-muted-foreground hover:bg-surface-muted"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setShareOpen(true);
              }}
              aria-label={`Bagikan berita ${article.title}`}
              title="Bagikan berita"
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
                  aria-label={`Opsi berita ${article.title}`}
                  className="size-8 shrink-0 rounded-full text-muted-foreground hover:bg-surface-muted"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              )}
            >
              <div className="flex flex-col py-1">
                <a
                  href={article.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-heading transition hover:bg-surface-muted"
                >
                  <ExternalLink className="size-4 text-muted-foreground" />
                  Baca di sumber
                </a>
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
      </a>

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        url={article.source_url}
        text={article.title}
        title="Bagikan Berita"
      />
    </>
  );
}
