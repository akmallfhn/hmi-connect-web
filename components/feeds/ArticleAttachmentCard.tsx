import { NotebookText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Avatar from "@/components/common/Avatar";
import type { FeedArticleAttachment } from "@/apis/feeds";

// First-party long-form, so it gets the large image-led card, not news's link-out strip.
export default function ArticleAttachmentCard({
  attachment,
}: {
  attachment: FeedArticleAttachment;
}) {
  if (attachment.reference_is_deleted) {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-[#e6e9ef] bg-[#f5f7fb] px-3 py-4 text-sm text-[#5f6573]">
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
      className="mt-3 block overflow-hidden rounded-xl border border-[#e6e9ef] transition hover:border-[#dbe3ef]"
    >
      {attachment.reference_image_url ? (
        <div className="relative aspect-[16/9] w-full bg-[#f5f7fb]">
          <Image
            src={attachment.reference_image_url}
            alt=""
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      ) : (
        <div className="flex aspect-[16/9] w-full items-center justify-center bg-[#f5f7fb] text-[#9aa1ad]">
          <NotebookText className="size-8" />
        </div>
      )}

      <div className="flex flex-col gap-1.5 bg-[#202428] p-4">
        <div className="flex min-w-0 items-center gap-2">
          {attachment.reference_author_avatar ? (
            <Avatar
              src={attachment.reference_author_avatar}
              name={byline}
              size={20}
            />
          ) : (
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/65">
              <NotebookText className="size-3" />
            </span>
          )}
          <p className="truncate text-xs text-white/65">{byline}</p>
        </div>

        <p className="line-clamp-2 font-stack-sans-headline text-sm font-medium leading-5 text-white sm:text-base">
          {title}
        </p>

        {attachment.reference_description && (
          <p className="line-clamp-1 text-[13px] leading-4 text-white/65">
            {attachment.reference_description}
          </p>
        )}
      </div>
    </Link>
  );
}
