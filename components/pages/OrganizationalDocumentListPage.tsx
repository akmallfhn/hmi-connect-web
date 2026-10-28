"use client";

import {
  IconBook2,
  IconCalendarEvent,
  IconCircleCheck,
  IconDownload,
  IconFileDescription,
  IconHistory,
  IconScale,
  IconVersions,
  type TablerIcon,
} from "@tabler/icons-react";
import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import type { OrganizationalDocumentListEntry } from "@/apis/organizational-documents";
import {
  ORGANIZATIONAL_DOCUMENTS_PATH,
  ORGANIZATIONAL_DOCUMENT_TYPE_DETAILS,
  organizationalDocumentHref,
} from "@/lib/organizational-document";
import type {
  OrganizationalDocumentTypeEnum,
  VerificationStatusEnum,
} from "@/lib/types";
import { formatShortDate } from "@/lib/time-manipulation";
import Label from "../common/Label";
import PageMargin from "../common/PageMargin";
import Input from "../fields/Input";
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
  search: string;
}

const DOCUMENT_CATEGORIES: {
  type: OrganizationalDocumentTypeEnum;
  icon: TablerIcon;
}[] = [
  { type: "konstitusi", icon: IconScale },
  { type: "pdk", icon: IconBook2 },
  { type: "pd-prt-bpl", icon: IconFileDescription },
];

function publicationTime(document: OrganizationalDocumentListEntry) {
  const value = Date.parse(document.published_at);
  return Number.isNaN(value) ? 0 : value;
}

function newestFirst(
  first: OrganizationalDocumentListEntry,
  second: OrganizationalDocumentListEntry
) {
  return publicationTime(second) - publicationTime(first) || second.id - first.id;
}

function normalizeSearchText(value: string) {
  return value
    .toLocaleLowerCase("id-ID")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function matchesSearch(
  document: OrganizationalDocumentListEntry,
  normalizedQuery: string
) {
  return normalizeSearchText(document.title).includes(normalizedQuery);
}

function DocumentCover({
  document,
  className,
  iconClassName,
}: {
  document: OrganizationalDocumentListEntry;
  className: string;
  iconClassName: string;
}) {
  return document.image_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={document.image_url} alt="" className={`${className} object-cover`} />
  ) : (
    <span
      className={`${className} flex items-center justify-center bg-linear-to-br from-brand-deep to-primary text-on-dark/85`}
    >
      <IconFileDescription className={iconClassName} stroke={1.35} />
    </span>
  );
}

function CurrentDocumentCard({
  document,
}: {
  document: OrganizationalDocumentListEntry;
}) {
  const href = organizationalDocumentHref(document);

  return (
    <article className="group overflow-hidden rounded-xl border border-primary-soft-border bg-surface shadow-[0_12px_32px_var(--shadow-card)]/10 md:grid md:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.1fr)] md:items-center">
      <Link
        href={href}
        className="relative block aspect-video w-full overflow-hidden bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
      >
        <DocumentCover
          document={document}
          className="absolute inset-0 h-full w-full transition-transform duration-300 group-hover:scale-[1.025]"
          iconClassName="size-16"
        />
      </Link>

      <div className="flex min-w-0 flex-col justify-center p-5 sm:p-6">
        <Label
          variant="green"
          icon={<IconCircleCheck className="size-3.5" stroke={2.3} />}
        >
          Berlaku Saat Ini
        </Label>
        <Link
          href={href}
          className="mt-2 rounded-sm font-stack-sans-headline text-xl font-medium leading-7 text-heading outline-none transition hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary/35 sm:text-2xl sm:leading-8"
        >
          {document.title}
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-2">
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

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link
            href={href}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-on-primary-action transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Baca dokumen
          </Link>
          <a
            href={document.file_url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border-strong px-5 text-sm font-semibold text-heading transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
          >
            <IconDownload className="size-4.5" stroke={2} />
            Unduh PDF
          </a>
        </div>
      </div>
    </article>
  );
}

function HistoricalDocumentRow({
  document,
  isLast,
}: {
  document: OrganizationalDocumentListEntry;
  isLast: boolean;
}) {
  const href = organizationalDocumentHref(document);

  return (
    <li className="relative pl-7 sm:pl-9">
      {!isLast ? (
        <span className="absolute left-[5px] top-5 h-[calc(100%+0.75rem)] w-px bg-border-strong sm:left-[7px]" />
      ) : null}
      <span className="absolute left-0 top-5 size-[11px] rounded-full border-2 border-surface bg-border-strong sm:size-[15px]" />

      <article className="group flex gap-3 rounded-xl border border-border bg-surface-subtle p-3 transition hover:border-border-strong hover:bg-surface-muted sm:gap-4 sm:p-4">
        <Link
          href={href}
          className="block aspect-video w-20 shrink-0 self-center overflow-hidden rounded-lg border border-border bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 sm:w-28"
        >
          <DocumentCover
            document={document}
            className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]"
            iconClassName="size-7 sm:size-8"
          />
        </Link>

        <div className="min-w-0 flex-1 self-center">
          <Link
            href={href}
            className="line-clamp-2 rounded-sm font-stack-sans-headline text-sm font-medium leading-5 text-heading outline-none transition hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary/35 sm:text-base"
          >
            {document.title}
          </Link>
          <p className="mt-1 text-xs text-muted-foreground sm:text-[13px]">
            Terbit {formatShortDate(document.published_at)}
            {document.page_count ? ` · ${document.page_count} halaman` : ""}
          </p>
        </div>

        <a
          href={document.file_url}
          download
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Unduh ${document.title}`}
          title="Unduh PDF"
          className="hidden size-9 shrink-0 self-center items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:border-primary/40 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 sm:inline-flex"
        >
          <IconDownload className="size-4.5" stroke={2} />
        </a>
      </article>
    </li>
  );
}

function DocumentCategory({
  type,
  icon: Icon,
  documents,
  normalizedQuery,
}: {
  type: OrganizationalDocumentTypeEnum;
  icon: TablerIcon;
  documents: OrganizationalDocumentListEntry[];
  normalizedQuery: string;
}) {
  const details = ORGANIZATIONAL_DOCUMENT_TYPE_DETAILS[type];
  const categoryMatches = normalizeSearchText(
    `${details.label} ${details.description}`
  )
    .includes(normalizedQuery);
  const sortedDocuments = [...documents].sort(newestFirst);
  const currentDocument = sortedDocuments[0];
  const history = sortedDocuments.slice(1);
  const visibleHistory = normalizedQuery
    ? categoryMatches
      ? history
      : history.filter((document) => matchesSearch(document, normalizedQuery))
    : history;

  return (
    <section className="overflow-hidden rounded-2xl border border-border-strong bg-surface">
      <div className="flex items-start gap-4 border-b border-border bg-surface-subtle px-4 py-5 sm:px-6 sm:py-6">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-primary-soft-border bg-primary-soft-bg text-primary-soft-fg sm:size-12">
          <Icon className="size-6" stroke={1.9} />
        </span>
        <div className="min-w-0">
          <h2 className="font-stack-sans-headline text-xl font-medium text-heading sm:text-2xl">
            {details.label}
          </h2>
          <p className="mt-1.5 max-w-3xl text-sm leading-6 text-muted-foreground lg:mt-0 lg:text-[15px]">
            {details.description}
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {currentDocument ? (
          <CurrentDocumentCard document={currentDocument} />
        ) : (
          <div className="rounded-xl border border-dashed border-border-strong bg-surface-subtle px-5 py-8 text-center">
            <IconVersions className="mx-auto size-8 text-muted-foreground" stroke={1.6} />
            <p className="mt-3 text-sm font-medium text-heading">
              Belum ada dokumen yang diterbitkan
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Versi terbaru {details.label} akan ditampilkan di sini.
            </p>
          </div>
        )}

        {visibleHistory.length > 0 ? (
          <div className="mt-7 border-t border-border pt-5 sm:mt-8 sm:pt-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <IconHistory className="size-5 text-muted-foreground" stroke={1.9} />
                <h3 className="font-stack-sans-headline text-base font-medium text-heading">
                  Riwayat versi
                </h3>
              </div>
              <span className="text-xs text-muted-foreground">
                {visibleHistory.length} versi lama
              </span>
            </div>
            <ol className="space-y-3">
              {visibleHistory.map((document, index) => (
                <HistoricalDocumentRow
                  key={document.id}
                  document={document}
                  isLast={index === visibleHistory.length - 1}
                />
              ))}
            </ol>
          </div>
        ) : history.length === 0 && currentDocument ? (
          <p className="mt-5 border-t border-border pt-5 text-center text-sm text-muted-foreground">
            Belum ada riwayat versi sebelumnya.
          </p>
        ) : null}
      </div>
    </section>
  );
}

export default function OrganizationalDocumentListPage({
  viewer,
  documents,
  search,
}: OrganizationalDocumentListPageProps) {
  const router = useRouter();
  const [query, setQuery] = useState(search);
  const normalizedQuery = normalizeSearchText(search);

  const categories = useMemo(
    () =>
      DOCUMENT_CATEGORIES.map((category) => ({
        ...category,
        documents: documents.filter(
          (document) => document.type === category.type
        ),
      })),
    [documents]
  );

  const visibleCategories = normalizedQuery
    ? categories.filter((category) => {
        const details = ORGANIZATIONAL_DOCUMENT_TYPE_DETAILS[category.type];
        const categoryText = normalizeSearchText(
          `${details.label} ${details.description}`
        );
        return (
          categoryText.includes(normalizedQuery) ||
          category.documents.some((document) =>
            matchesSearch(document, normalizedQuery)
          )
        );
      })
    : categories;

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(
      trimmed
        ? `${ORGANIZATIONAL_DOCUMENTS_PATH}?search=${encodeURIComponent(trimmed)}`
        : ORGANIZATIONAL_DOCUMENTS_PATH
    );
  }

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

        <form onSubmit={submitSearch} className="lg:mt-6 lg:max-w-lg">
          <Input
            inputId="organizational-document-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari judul atau kategori dokumen..."
            aria-label="Cari pedoman organisasi"
            icon={<Search className="size-4" />}
          />
        </form>

        {visibleCategories.length === 0 ? (
          <EmptyState
            title="Pedoman tidak ditemukan"
            description={`Tidak ada judul atau kategori yang cocok dengan "${search}".`}
          />
        ) : (
          <div className="mt-6 space-y-6 sm:space-y-8">
            {visibleCategories.map((category) => (
              <DocumentCategory
                key={category.type}
                type={category.type}
                icon={category.icon}
                documents={category.documents}
                normalizedQuery={normalizedQuery}
              />
            ))}
          </div>
        )}
      </PageMargin>

      <BottomNav userId={viewer.userId} username={viewer.username} />
    </div>
  );
}
