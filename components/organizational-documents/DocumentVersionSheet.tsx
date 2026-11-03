"use client";

import { IconFileDescription } from "@tabler/icons-react";
import Link from "next/link";
import { organizationalDocumentHref } from "@/lib/organizational-document";
import { formatShortDate } from "@/lib/time-manipulation";
import Label from "../common/Label";
import Sheet from "../modals/Sheet";

export type OrganizationalDocumentVersion = {
  id: number;
  title: string;
  slug_url: string;
  published_at: string;
  page_count: number | null;
  image_url: string | null;
};

interface DocumentVersionSheetProps {
  open: boolean;
  onClose: () => void;
  typeLabel: string;
  currentId: number;
  // Already ordered newest first.
  versions: OrganizationalDocumentVersion[];
}

export default function DocumentVersionSheet({
  open,
  onClose,
  typeLabel,
  currentId,
  versions,
}: DocumentVersionSheetProps) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Riwayat Versi"
      description={`Semua versi ${typeLabel} yang pernah diterbitkan, dari yang terbaru.`}
    >
      <ol className="flex flex-col gap-3">
        {versions.map((version, index) => {
          const isCurrent = version.id === currentId;
          const content = (
            <>
              <span className="relative block aspect-video w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-muted">
                {version.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={version.image_url}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-brand-deep to-primary text-on-dark/85">
                    <IconFileDescription className="size-7" stroke={1.35} />
                  </span>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap gap-1.5">
                  {index === 0 && (
                    <Label variant="green" size="sm">
                      Terbaru
                    </Label>
                  )}
                  {isCurrent && (
                    <Label variant="blue" size="sm">
                      Sedang dibuka
                    </Label>
                  )}
                </span>
                <span className="mt-1 line-clamp-2 font-stack-sans-headline text-sm font-medium leading-5 text-heading">
                  {version.title}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  Terbit {formatShortDate(version.published_at)}
                  {version.page_count ? ` · ${version.page_count} halaman` : ""}
                </span>
              </span>
            </>
          );

          const isLast = index === versions.length - 1;

          return (
            <li key={version.id} className="relative pl-7">
              {/* Timeline: a line joins each version's dot to the next, older one. */}
              {!isLast && (
                <span
                  aria-hidden="true"
                  className="absolute left-[7px] top-1/2 h-[calc(100%+0.75rem)] w-px bg-border-strong"
                />
              )}
              <span
                aria-hidden="true"
                className={[
                  "absolute left-0 top-1/2 size-[15px] -translate-y-1/2 rounded-full border-2 border-surface",
                  isCurrent ? "bg-primary ring-2 ring-primary/30" : "bg-border-strong",
                ].join(" ")}
              />
              {isCurrent ? (
                <div
                  aria-current="page"
                  className="flex items-center gap-3 rounded-xl border border-primary bg-primary-soft/40 p-3"
                >
                  {content}
                </div>
              ) : (
                <Link
                  href={organizationalDocumentHref(version)}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-xl border border-border p-3 transition hover:border-border-strong hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                >
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </Sheet>
  );
}
