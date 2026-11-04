"use client";

import {
  IconCalendarEvent,
  IconDownload,
  IconFileDescription,
} from "@tabler/icons-react";
import Link from "next/link";
import { useMemo } from "react";
import type { OrganizationalDocumentListEntry } from "@/apis/organizational-documents";
import {
  compareNewestDocument,
  ORGANIZATIONAL_DOCUMENT_TYPE_DETAILS,
  organizationalDocumentEdition,
  organizationalDocumentHref,
} from "@/lib/organizational-document";
import type {
  OrganizationalDocumentTypeEnum,
  VerificationStatusEnum,
} from "@/lib/types";
import { formatShortDate } from "@/lib/time-manipulation";
import Label from "../common/Label";
import PageMargin from "../common/PageMargin";
import BottomNav from "../navigations/BottomNav";
import Header from "../navigations/Header";
import EmptyState from "../states/EmptyState";

interface OrganizationalDocumentListPageProps {
  viewer: {
    fullName?: string;
    avatar?: string;
    userId?: string;
    username?: string;
    verificationStatus?: VerificationStatusEnum;
  };
  documents: OrganizationalDocumentListEntry[];
}

const DOCUMENT_TYPES: OrganizationalDocumentTypeEnum[] = [
  "konstitusi",
  "pdk",
  "pd-prt-bpl",
];

function DocumentCover({
  document,
  className,
}: {
  document: OrganizationalDocumentListEntry;
  className: string;
}) {
  return document.image_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={document.image_url} alt="" className={`${className} object-cover`} />
  ) : (
    <span
      className={`${className} flex items-center justify-center bg-linear-to-br from-brand-deep to-primary text-on-dark/85`}
    >
      <IconFileDescription className="size-16" stroke={1.35} />
    </span>
  );
}

function DocumentCard({
  document,
}: {
  document: OrganizationalDocumentListEntry;
}) {
  const href = organizationalDocumentHref(document);
  const edition = organizationalDocumentEdition(document.title);

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface">
      <Link
        href={href}
        className="relative block aspect-video w-full overflow-hidden bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
      >
        <DocumentCover
          document={document}
          className="absolute inset-0 h-full w-full transition-transform duration-300 group-hover:scale-[1.025]"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <Link
          href={href}
          className="line-clamp-2 rounded-sm font-stack-sans-headline text-lg font-medium leading-6 text-heading outline-none transition hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary/35"
        >
          {ORGANIZATIONAL_DOCUMENT_TYPE_DETAILS[document.type].fullName}
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {edition.main}
        </p>
        {edition.note && (
          <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
            {edition.note}
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Label
            variant="gray"
            icon={<IconCalendarEvent className="size-3.5" stroke={2} />}
          >
            Diterbitkan {formatShortDate(document.published_at)}
          </Label>
          {document.page_count ? (
            <Label
              variant="gray"
              icon={<IconFileDescription className="size-3.5" stroke={2} />}
            >
              {document.page_count} halaman
            </Label>
          ) : null}
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
          <Link
            href={href}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-on-primary-action transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Baca dokumen
          </Link>
          <a
            href={document.file_url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border-strong px-4 text-sm font-semibold text-heading transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
          >
            <IconDownload className="size-4.5" stroke={2} />
            Unduh PDF
          </a>
        </div>
      </div>
    </article>
  );
}

export default function OrganizationalDocumentListPage({
  viewer,
  documents,
}: OrganizationalDocumentListPageProps) {
  // Only each type's newest publication is listed; older versions live in the reader's Versi sheet.
  const latestDocuments = useMemo(
    () =>
      DOCUMENT_TYPES.flatMap((type) => {
        const latest = documents
          .filter((document) => document.type === type)
          .sort(compareNewestDocument)[0];
        return latest ? [{ type, document: latest }] : [];
      }),
    [documents]
  );

  return (
    <div className="min-h-screen bg-surface pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0">
      <Header
        fullName={viewer.fullName}
        avatar={viewer.avatar}
        userId={viewer.userId}
        username={viewer.username}
        verificationStatus={viewer.verificationStatus}
        mobileBackTitle="Pedoman Organisasi"
      />

      <PageMargin className="py-6 lg:py-8">
        <div className="hidden lg:block">
          <h1 className="font-stack-sans-headline text-2xl font-medium text-heading">
            Pedoman Organisasi
          </h1>
        </div>

        {latestDocuments.length === 0 ? (
          <EmptyState
            title="Belum ada pedoman"
            description="Pedoman organisasi yang diterbitkan akan tampil di sini."
          />
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestDocuments.map(({ type, document }) => (
              <DocumentCard key={type} document={document} />
            ))}
          </div>
        )}
      </PageMargin>

      <BottomNav userId={viewer.userId} username={viewer.username} />
    </div>
  );
}
