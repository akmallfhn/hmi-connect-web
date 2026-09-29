"use client";

import { Newspaper } from "lucide-react";
import Image from "next/image";
import Avatar from "@/components/common/Avatar";
import type { FeedNewsAttachment } from "@/apis/feeds";
import { useAttachmentPalette } from "@/hooks/useAttachmentPalette";

// A resolved news item follows the article attachment layout, but uses its source as the byline.
export default function NewsAttachmentCard({
  attachment,
}: {
  attachment: FeedNewsAttachment;
}) {
  const color = useAttachmentPalette(
    attachment.reference_is_deleted ? null : attachment.reference_image_url
  );

  if (attachment.reference_is_deleted) {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#f5f7fb] px-3 py-4 text-sm text-[#5f6573]">
        <Newspaper className="size-4 shrink-0" />
        Berita yang dibagikan sudah dihapus
      </div>
    );
  }

  const title = attachment.reference_title ?? "Berita";
  const sourceName = attachment.reference_source_name ?? "Berita";
  const card = (
    <>
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
            <Newspaper className="size-9" />
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
            src={attachment.reference_source_logo_url}
            name={sourceName}
            size={24}
            className="bg-white ring-1 ring-white/25"
          />
          <p className="truncate text-xs font-medium text-white/75">
            {sourceName}
          </p>
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
    </>
  );

  const className =
    "group relative isolate mt-3 block overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

  if (!attachment.reference_url) {
    return (
      <div className={className} style={{ backgroundColor: color }}>
        {card}
      </div>
    );
  }

  return (
    <a
      href={attachment.reference_url}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      style={{ backgroundColor: color }}
    >
      {card}
    </a>
  );
}
