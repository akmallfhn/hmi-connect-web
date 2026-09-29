"use client";

import { NotebookText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Avatar from "@/components/common/Avatar";
import type { FeedArticleAttachment } from "@/apis/feeds";
import { useAttachmentPalette } from "@/hooks/useAttachmentPalette";

// First-party long-form content shares the same image-led treatment as a news attachment.
export default function ArticleAttachmentCard({
  attachment,
}: {
  attachment: FeedArticleAttachment;
}) {
  const color = useAttachmentPalette(
    attachment.reference_is_deleted ? null : attachment.reference_image_url
  );

  if (attachment.reference_is_deleted) {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#f5f7fb] px-3 py-4 text-sm text-[#5f6573]">
        <NotebookText className="size-4 shrink-0" />
        Artikel yang dibagikan sudah dihapus
      </div>
    );
  }

  const title = attachment.reference_title ?? "Artikel";
  // Author carries the byline; category stands in when the article has no author yet.
  const byline =
    attachment.reference_author_name ??
    attachment.reference_category_name ??
    "Artikel";
  // The slug is decorative — article_id is what /articles/[slug]/[id] actually resolves on.
  const slug = attachment.reference_slug_url?.trim() || "artikel";

  return (
    <Link
      href={`/articles/${slug}/${attachment.article_id}`}
      style={{ backgroundColor: color }}
      className="group relative isolate mt-3 block overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden md:absolute md:inset-0 md:aspect-auto">
        {attachment.reference_image_url ? (
          <Image
            src={attachment.reference_image_url}
            alt=""
            fill
            sizes="(max-width: 767px) 100vw, 640px"
            className="object-cover transition duration-500 group-hover:scale-[1.025]"
            unoptimized
          />
        ) : (
          <div className="flex size-full items-center justify-center text-white/40">
            <NotebookText className="size-9" />
          </div>
        )}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 md:hidden"
          style={{
            backgroundImage: `linear-gradient(to top, ${color}, ${color}00)`,
          }}
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 hidden md:block"
        style={{
          backgroundImage: `linear-gradient(to top, ${color} 0%, ${color} 25%, ${color}00 100%)`,
        }}
      />

      <div className="relative flex flex-col gap-2 p-4 text-white md:aspect-[16/9] md:justify-end md:gap-2.5 md:p-5 md:pt-20">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar
            src={attachment.reference_author_avatar}
            name={byline}
            size={24}
            className="ring-1 ring-white/25"
          />
          <p className="truncate text-xs font-medium text-white/75">{byline}</p>
        </div>

        <p className="line-clamp-2 font-stack-sans-headline text-base font-medium leading-5 text-white md:text-xl md:leading-6">
          {title}
        </p>

        {attachment.reference_description && (
          <p className="line-clamp-3 text-[13px] leading-5 text-white/70 md:line-clamp-2 md:text-sm md:leading-5">
            {attachment.reference_description}
          </p>
        )}
      </div>
    </Link>
  );
}
