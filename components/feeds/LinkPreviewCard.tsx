"use client";

import { Globe } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { LinkPreview } from "@/app/(www)/www/api/link-preview/route";

interface LinkPreviewCardProps {
  url: string;
}

export default function LinkPreviewCard({ url }: LinkPreviewCardProps) {
  const [preview, setPreview] = useState<LinkPreview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/link-preview?url=${encodeURIComponent(url)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: LinkPreview | null) => {
        if (!cancelled) setPreview(data);
      })
      .catch(() => {
        if (!cancelled) setPreview(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  const hostname = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  })();

  if (loading) {
    return (
      <div className="mt-3 h-16 animate-pulse rounded-xl border border-border bg-surface-muted" />
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 flex overflow-hidden rounded-xl border border-border transition hover:bg-surface-muted"
    >
      {preview?.image ? (
        <div className="relative aspect-square w-16 shrink-0 bg-surface-muted sm:w-24">
          <Image
            src={preview.image}
            alt={preview.title ?? hostname}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      ) : (
        <div className="flex aspect-square w-16 shrink-0 items-center justify-center bg-surface-muted text-muted-foreground sm:w-24">
          <Globe className="size-5" />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-3 py-2">
        <p className="truncate text-[11px] uppercase tracking-wide text-muted-foreground">
          {preview?.siteName ?? hostname}
        </p>
        <p className="line-clamp-2 text-sm font-semibold text-heading">
          {preview?.title ?? url}
        </p>
        {preview?.description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {preview.description}
          </p>
        )}
      </div>
    </a>
  );
}
