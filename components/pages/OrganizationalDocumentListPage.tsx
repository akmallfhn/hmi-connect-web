"use client";

import {
  IconCalendarEvent,
  IconDownload,
  IconFileText,
} from "@tabler/icons-react";
import { FileText, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import type { OrganizationalDocumentListEntry } from "@/apis/organizational-documents";
import type { VerificationStatusEnum } from "@/lib/types";
import {
  ORGANIZATIONAL_DOCUMENTS_PATH,
  organizationalDocumentHref,
} from "@/lib/organizational-document";
import { formatShortDate } from "@/lib/time-manipulation";
import Label from "../common/Label";
import Pagination from "../common/Pagination";
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
  currentPage: number;
  totalPages: number;
}

function DocumentRow({
  document,
}: {
  document: OrganizationalDocumentListEntry;
}) {
  return (
    <li>
      <Link
        href={organizationalDocumentHref(document)}
        className="flex items-start gap-4 rounded-xl px-3 py-4 transition-colors hover:bg-surface-muted"
      >
        {document.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={document.image_url}
            alt=""
            className="aspect-video w-28 shrink-0 rounded-lg border border-border object-cover"
          />
        ) : (
          <span className="flex aspect-video w-28 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-foreground">
            <FileText className="size-6" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="font-stack-sans-headline text-base font-medium text-heading lg:text-lg">
            {document.title}
          </h2>
          <p className="mt-1.5 text-[13px] text-muted-foreground lg:text-sm">
            {document.page_count ? `${document.page_count} halaman · ` : ""}
            Terbit {formatShortDate(document.published_at)}
          </p>
        </div>
      </Link>
    </li>
  );
}

// Desktop card, shaped like the Training Center's so the two catalogs read as one family.
function DocumentCard({
  document,
}: {
  document: OrganizationalDocumentListEntry;
}) {
  const href = organizationalDocumentHref(document);
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border-strong bg-surface transition-colors hover:border-primary/60 focus-within:border-primary">
      <Link
        href={href}
        className="block flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-linear-to-br from-brand-deep to-primary">
          {document.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={document.image_url}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-on-dark/80">
              <IconFileText className="size-14" stroke={1.4} />
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3 px-4 pb-4 pt-4">
          <h2 className="font-stack-sans-headline line-clamp-2 min-h-12 text-lg font-medium leading-6 text-heading">
            {document.title}
          </h2>
          <div className="flex flex-wrap items-center gap-1.5">
            <Label
              variant="gray"
              icon={<IconCalendarEvent className="size-3.5" stroke={2} />}
            >
              {formatShortDate(document.published_at)}
            </Label>
            {document.page_count ? (
              <Label
                variant="gray"
                icon={<IconFileText className="size-3.5" stroke={2} />}
              >
                {document.page_count} halaman
              </Label>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-2 border-t border-border px-4 py-3">
        <Link
          href={href}
          className="inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-semibold text-on-primary-action transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          Baca pedoman
        </Link>
        <a
          href={document.file_url}
          download
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Unduh ${document.title}`}
          title="Unduh PDF"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-border-strong text-heading transition hover:bg-primary-soft"
        >
          <IconDownload className="size-5" />
        </a>
      </div>
    </article>
  );
}

export default function OrganizationalDocumentListPage({
  viewer,
  documents,
  search,
  currentPage,
  totalPages,
}: OrganizationalDocumentListPageProps) {
  const router = useRouter();
  const [query, setQuery] = useState(search);

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

      <PageMargin className="py-6">
        <div className="hidden lg:block">
          <h1 className="font-stack-sans-headline text-2xl font-medium text-heading">
            Pedoman Organisasi
          </h1>
        </div>

        <form onSubmit={submitSearch} className="lg:mt-6 lg:max-w-md">
          <Input
            inputId="organizational-document-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari pedoman..."
            aria-label="Cari pedoman"
            icon={<Search className="size-4" />}
          />
        </form>

        {documents.length === 0 ? (
          <EmptyState
            title={search ? "Pedoman tidak ditemukan" : "Belum ada pedoman"}
            description={
              search
                ? `Tidak ada pedoman yang cocok dengan "${search}".`
                : "Pedoman organisasi akan muncul di sini setelah diunggah."
            }
          />
        ) : (
          <>
            <ul className="mt-4 divide-y divide-border lg:hidden">
              {documents.map((document) => (
                <DocumentRow key={document.id} document={document} />
              ))}
            </ul>
            <div className="mt-6 hidden gap-5 lg:grid lg:grid-cols-2 xl:grid-cols-3">
              {documents.map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}
            </div>
          </>
        )}

        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination currentPage={currentPage} totalPages={totalPages} />
          </div>
        )}
      </PageMargin>

      <BottomNav userId={viewer.userId} username={viewer.username} />
    </div>
  );
}
