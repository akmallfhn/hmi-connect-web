import { Newspaper } from "lucide-react";
import Image from "next/image";
import type { FeedNewsAttachment } from "@/apis/feeds";

// The resolved twin of LinkPreviewCard: same slot and shape, but the backend hands us the fields.
export default function NewsAttachmentCard({
  attachment,
}: {
  attachment: FeedNewsAttachment;
}) {
  if (attachment.reference_is_deleted) {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-[#e6e9ef] bg-[#f5f7fb] px-3 py-4 text-sm text-[#5f6573]">
        <Newspaper className="size-4 shrink-0" />
        Berita yang dibagikan sudah dihapus
      </div>
    );
  }

  const body = (
    <>
      {attachment.reference_image_url ? (
        <div className="relative aspect-square w-16 shrink-0 bg-[#f5f7fb] sm:w-24">
          <Image
            src={attachment.reference_image_url}
            alt=""
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      ) : (
        <div className="flex aspect-square w-16 shrink-0 items-center justify-center bg-[#f5f7fb] text-[#5f6573] sm:w-24">
          <Newspaper className="size-5" />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-3 py-2">
        <div className="flex items-center gap-1.5">
          {attachment.reference_source_logo_url && (
            <span className="relative size-4 shrink-0 overflow-hidden rounded-sm bg-[#f5f7fb]">
              <Image
                src={attachment.reference_source_logo_url}
                alt=""
                fill
                className="object-contain"
                unoptimized
              />
            </span>
          )}
          <p className="truncate text-[11px] uppercase tracking-wide text-[#5f6573]">
            {attachment.reference_source_name ?? "Berita"}
          </p>
        </div>
        <p className="line-clamp-2 text-sm font-semibold text-[#172033]">
          {attachment.reference_title ?? "Berita"}
        </p>
        {attachment.reference_description && (
          <p className="line-clamp-2 text-xs text-[#5f6573]">
            {attachment.reference_description}
          </p>
        )}
      </div>
    </>
  );

  if (!attachment.reference_url) {
    return (
      <div className="mt-3 flex overflow-hidden rounded-xl border border-[#e6e9ef]">
        {body}
      </div>
    );
  }

  return (
    <a
      href={attachment.reference_url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 flex overflow-hidden rounded-xl border border-[#e6e9ef] transition hover:bg-[#f5f7fb]"
    >
      {body}
    </a>
  );
}
