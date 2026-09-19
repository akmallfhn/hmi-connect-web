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
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-semibold leading-5 text-white sm:text-[15px]">
            {attachment.reference_title ?? "Berita"}
          </p>
          {attachment.reference_description && (
            <p className="mt-1.5 line-clamp-1 text-[13px] leading-4 text-white/65">
              {attachment.reference_description}
            </p>
          )}
        </div>
        <div className="flex min-w-0 items-center gap-1.5 text-white/65">
          {attachment.reference_source_logo_url ? (
            <span className="relative size-4 shrink-0 overflow-hidden rounded-full bg-white">
              <Image
                src={attachment.reference_source_logo_url}
                alt=""
                fill
                className="object-contain"
                unoptimized
              />
            </span>
          ) : (
            <Newspaper className="size-3.5 shrink-0" />
          )}
          <p className="truncate text-xs tracking-wide">
            {attachment.reference_source_name ?? "Berita"}
          </p>
        </div>
      </div>
      {attachment.reference_image_url ? (
        <div className="relative w-[38%] shrink-0 self-stretch bg-black/20 sm:w-40">
          <Image
            src={attachment.reference_image_url}
            alt=""
            fill
            className="object-cover brightness-[0.78] saturate-[0.7] contrast-[0.9]"
            unoptimized
          />
          <div className="pointer-events-none absolute inset-0 bg-[#202428]/30" />
          <div className="pointer-events-none absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-[#202428] from-5% via-[#202428]/75 to-transparent" />
        </div>
      ) : (
        <div className="flex w-[38%] shrink-0 items-center justify-center bg-black/20 text-white/45 sm:w-40">
          <Newspaper className="size-7" />
        </div>
      )}
    </>
  );

  if (!attachment.reference_url) {
    return (
      <div className="mt-3 flex min-h-32 overflow-hidden rounded-xl border border-white/10 bg-[#202428] shadow-sm">
        {body}
      </div>
    );
  }

  return (
    <a
      href={attachment.reference_url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 flex min-h-32 overflow-hidden rounded-xl border border-white/10 bg-[#202428] shadow-sm transition"
    >
      {body}
    </a>
  );
}
