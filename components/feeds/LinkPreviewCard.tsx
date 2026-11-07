"use client";

import { Globe } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { LinkPreview } from "@/app/(www)/www/api/link-preview/route";

interface LinkPreviewCardProps {
  url: string;
}

export default function LinkPreviewCard({ url }: LinkPreviewCardProps) {
  const [result, setResult] = useState<{
    url: string;
    preview: LinkPreview | null;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/link-preview?url=${encodeURIComponent(url)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: LinkPreview | null) => {
        if (!cancelled) setResult({ url, preview: data });
      })
      .catch(() => {
        if (!cancelled) setResult({ url, preview: null });
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  const loading = result?.url !== url;
  const preview = loading ? null : result?.preview;

  const hostname = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  })();

  if (loading) {
    return (
      <div className="mt-3 h-28 animate-pulse rounded-xl border border-border bg-surface-subtle" />
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group mt-3 flex min-h-28 overflow-hidden rounded-xl border border-border bg-surface-subtle transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {preview?.image ? (
        <div className="relative w-1/3 shrink-0 self-stretch bg-surface-muted">
          <Image
            src={preview.image}
            alt=""
            fill
            sizes="(max-width: 639px) 33vw, 200px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            unoptimized
          />
        </div>
      ) : (
        <div className="flex w-1/3 shrink-0 self-stretch items-center justify-center bg-surface-muted text-muted-foreground">
          <Globe className="size-6" />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-3 py-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground lg:text-[13px]">
          {preview?.favicon && <PublisherFavicon key={preview.favicon} url={preview.favicon} />}
          <span className="truncate">{preview?.siteName ?? hostname}</span>
        </div>
        <p className="line-clamp-2 break-words font-stack-sans-headline text-[15px] font-medium leading-5 text-heading lg:text-base">
          {preview?.title ?? url}
        </p>
        {preview?.description && (
          <p className="line-clamp-1 text-[13px] leading-5 text-muted-foreground lg:text-sm">
            {preview.description}
          </p>
        )}
      </div>
    </a>
  );
}

function PublisherFavicon({ url }: { url: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <Image
      src={url}
      alt=""
      width={16}
      height={16}
      unoptimized
      className="size-4 shrink-0 rounded-sm object-contain"
      onError={() => setFailed(true)}
    />
  );
}
