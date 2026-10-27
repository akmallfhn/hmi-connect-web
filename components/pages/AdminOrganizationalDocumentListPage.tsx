"use client";

import {
  ExternalLink,
  EllipsisVertical,
  FileText,
  ListTree,
  Pencil,
  Plus,
  PlusCircle,
  Search,
  Trash2,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { OrganizationalDocumentListEntry } from "@/apis/organizational-documents";
import { deleteOrganizationalDocument } from "@/lib/actions";
import { organizationalDocumentHref } from "@/lib/organizational-document";
import { formatShortDate } from "@/lib/time-manipulation";
import Button from "../buttons/Button";
import Avatar from "../common/Avatar";
import ActiveFilterChips, {
  type ActiveFilterChip,
} from "../common/ActiveFilterChips";
import AdminPageTitle from "../common/AdminPageTitle";
import Dropdown from "../common/Dropdown";
import FilterDropdown from "../common/FilterDropdown";
import Label from "../common/Label";
import Pagination from "../common/Pagination";
import Input from "../fields/Input";
import Select from "../fields/Select";
import CreateOrganizationalDocumentFormSheet from "../forms/CreateOrganizationalDocumentFormSheet";
import EditOrganizationalDocumentFormSheet from "../forms/EditOrganizationalDocumentFormSheet";
import EditOrganizationalDocumentOutlineSheet from "../forms/EditOrganizationalDocumentOutlineSheet";
import AlertConfirmation from "../modals/AlertConfirmation";
import EmptyState from "../states/EmptyState";

const STATUS_FILTER_OPTIONS = [
  { label: "Semua Status", value: "" },
  { label: "Aktif", value: "active" },
  { label: "Tidak Aktif", value: "inactive" },
];

interface AdminOrganizationalDocumentListPageProps {
  documents: OrganizationalDocumentListEntry[];
  totalData: number;
  totalPage: number;
  currentPage: number;
  initialSearch: string;
  initialStatus: string;
  organizationId: string;
  defaultPublishedDate: string;
  mainSiteOrigin: string;
}

function DocumentCover({
  document,
}: {
  document: OrganizationalDocumentListEntry;
}) {
  return document.image_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={document.image_url}
      alt=""
      className="aspect-video w-32 shrink-0 rounded-lg border border-border object-cover"
    />
  ) : (
    <span className="flex aspect-video w-32 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-foreground">
      <FileText className="size-6" />
    </span>
  );
}

function Uploader({ document }: { document: OrganizationalDocumentListEntry }) {
  if (!document.created_by_name) {
    return <span className="text-muted-foreground">—</span>;
  }
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Avatar
        src={document.created_by_avatar}
        name={document.created_by_name}
        size={28}
      />
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-medium text-heading">
          {document.created_by_name}
        </span>
        {document.created_by_username && (
          <span className="block truncate text-xs text-muted-foreground">
            @{document.created_by_username}
          </span>
        )}
      </span>
    </span>
  );
}

function pageCountLabel(document: OrganizationalDocumentListEntry) {
  return document.page_count
    ? `${document.page_count} halaman`
    : "Halaman belum dihitung";
}

function StatusLabel({
  status,
}: {
  status: OrganizationalDocumentListEntry["status"];
}) {
  return status === "active" ? (
    <Label variant="green">Aktif</Label>
  ) : (
    <Label variant="gray">Tidak Aktif</Label>
  );
}

export default function AdminOrganizationalDocumentListPage({
  documents,
  totalData,
  totalPage,
  currentPage,
  initialSearch,
  initialStatus,
  organizationId,
  defaultPublishedDate,
  mainSiteOrigin,
}: AdminOrganizationalDocumentListPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // "Adjust state during render" when the server hands back a new initialSearch, same as the other admin lists.
  const [seenSearch, setSeenSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  if (initialSearch !== seenSearch) {
    setSeenSearch(initialSearch);
    setSearchInput(initialSearch);
  }

  const [deleteTarget, setDeleteTarget] =
    useState<OrganizationalDocumentListEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<number | null>(null);
  const [outlineTarget, setOutlineTarget] =
    useState<OrganizationalDocumentListEntry | null>(null);

  function pushParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput === initialSearch) return;
      pushParams({ search: searchInput });
    }, 500);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const result = await deleteOrganizationalDocument(deleteTarget.id);
      if (!result.ok) {
        toast.error(result.message ?? "Gagal menghapus pedoman.");
        return;
      }
      toast.success("Pedoman berhasil dihapus.");
      setDeleteTarget(null);
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  function viewHref(document: OrganizationalDocumentListEntry) {
    return `${mainSiteOrigin}${organizationalDocumentHref(document)}`;
  }

  function renderActions(document: OrganizationalDocumentListEntry) {
    return (
      <Dropdown
        panelClassName="w-48 rounded-xl"
        trigger={({ toggle }) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label="Aksi"
          >
            <EllipsisVertical className="size-4" />
          </Button>
        )}
      >
        <button
          type="button"
          onClick={() => setEditTarget(document.id)}
          className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-heading transition hover:bg-surface-muted"
        >
          <Pencil className="size-4 text-muted-foreground" />
          Edit
        </button>
        <button
          type="button"
          onClick={() => setOutlineTarget(document)}
          className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-heading transition hover:bg-surface-muted"
        >
          <ListTree className="size-4 text-muted-foreground" />
          Atur Daftar Isi
        </button>
        {document.status === "active" && (
          <a
            href={viewHref(document)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-heading transition hover:bg-surface-muted"
          >
            <ExternalLink className="size-4 text-muted-foreground" />
            Lihat di HMI Connect
          </a>
        )}
        <button
          type="button"
          onClick={() => setDeleteTarget(document)}
          className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-destructive-foreground transition hover:bg-destructive-soft"
        >
          <Trash2 className="size-4" />
          Hapus
        </button>
      </Dropdown>
    );
  }

  const filterChips: ActiveFilterChip[] = initialStatus
    ? [
        {
          key: "status",
          label: "Status",
          value:
            STATUS_FILTER_OPTIONS.find(
              (option) => option.value === initialStatus
            )?.label ?? initialStatus,
          onRemove: () => pushParams({ status: "" }),
        },
      ]
    : [];
  const isFiltered = Boolean(initialSearch || initialStatus);

  return (
    <div className="p-4 pb-24 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <AdminPageTitle description="Kelola pedoman dan ketetapan organisasi untuk kader HMI.">
            Pedoman Organisasi
          </AdminPageTitle>
        </div>
        <div className="hidden sm:block">
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            <PlusCircle className="size-4" />
            Tambah Pedoman
          </Button>
        </div>
      </div>

      <Button
        variant="primary"
        size="icon"
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] right-5 z-20 size-14! rounded-full! shadow-lg sm:hidden"
        aria-label="Tambah Pedoman"
        title="Tambah Pedoman"
        onClick={() => setCreateOpen(true)}
      >
        <Plus className="size-6" />
      </Button>

      <div className="mt-6 flex items-center gap-3">
        <div className="w-full sm:max-w-xs">
          <Input
            inputId="organizational-document-search"
            placeholder="Cari judul pedoman..."
            icon={<Search className="size-4" />}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>
        <FilterDropdown
          panelId="organizational-document-filters"
          ariaLabel="Filter daftar pedoman"
          activeCount={filterChips.length}
          onReset={() => pushParams({ status: "" })}
        >
          <Select
            selectId="organizational-document-status-filter"
            label="Status"
            placeholder="Semua Status"
            value={initialStatus || null}
            onChange={(value) => pushParams({ status: String(value ?? "") })}
            options={STATUS_FILTER_OPTIONS}
          />
        </FilterDropdown>
      </div>

      <ActiveFilterChips
        chips={filterChips}
        onClearAll={() => pushParams({ status: "" })}
      />

      {documents.length === 0 ? (
        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-surface">
          <EmptyState
            title={isFiltered ? "Pedoman tidak ditemukan" : "Belum ada pedoman"}
            description={
              isFiltered
                ? "Coba ubah kata kunci pencarian atau filter status."
                : "Unggah PDF pedoman pertama supaya kader bisa membacanya di HMI Connect."
            }
            action={
              isFiltered ? undefined : (
                <Button variant="primary" onClick={() => setCreateOpen(true)}>
                  <PlusCircle className="size-4" />
                  Tambah Pedoman
                </Button>
              )
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-6 hidden overflow-hidden rounded-xl border border-border bg-surface lg:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-muted text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Pedoman</th>
                  <th className="px-4 py-3">Diterbitkan</th>
                  <th className="px-4 py-3">Diunggah Oleh</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider text-[13px]">
                {documents.map((document) => (
                  <tr key={document.id} className="align-middle">
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setEditTarget(document.id)}
                        className="flex w-fit min-w-0 cursor-pointer items-center gap-3 text-left"
                      >
                        <DocumentCover document={document} />
                        <span className="min-w-0">
                          <span className="line-clamp-2 text-sm font-semibold text-heading hover:text-primary-foreground">
                            {document.title}
                          </span>
                          <span className="mt-1 block text-xs tabular-nums text-muted-foreground">
                            {pageCountLabel(document)}
                          </span>
                        </span>
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-heading">
                      {formatShortDate(document.published_at)}
                    </td>
                    <td className="max-w-56 px-4 py-3">
                      <Uploader document={document} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusLabel status={document.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {renderActions(document)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:hidden">
            {documents.map((document) => (
              <div
                key={document.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4"
              >
                <div className="flex items-start gap-3">
                  <DocumentCover document={document} />
                  <button
                    type="button"
                    onClick={() => setEditTarget(document.id)}
                    className="min-w-0 flex-1 cursor-pointer text-left"
                  >
                    <p className="line-clamp-2 text-sm font-semibold text-heading">
                      {document.title}
                    </p>
                    <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                      {pageCountLabel(document)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Terbit {formatShortDate(document.published_at)}
                    </p>
                  </button>
                  {renderActions(document)}
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                  <Uploader document={document} />
                  <StatusLabel status={document.status} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-6 flex flex-col items-center gap-2">
        <Pagination
          currentPage={currentPage}
          totalPages={Math.max(totalPage, 1)}
        />
        <p className="text-xs text-muted-foreground">{totalData} pedoman</p>
      </div>

      <CreateOrganizationalDocumentFormSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={() => {
          setCreateOpen(false);
          router.refresh();
        }}
        organizationId={organizationId}
        defaultPublishedDate={defaultPublishedDate}
      />

      <EditOrganizationalDocumentFormSheet
        documentId={editTarget}
        onClose={() => setEditTarget(null)}
        onSaved={() => {
          setEditTarget(null);
          router.refresh();
        }}
      />

      <EditOrganizationalDocumentOutlineSheet
        documentId={outlineTarget?.id ?? null}
        documentTitle={outlineTarget?.title}
        onClose={() => setOutlineTarget(null)}
        onSaved={() => {
          setOutlineTarget(null);
          router.refresh();
        }}
      />

      <AlertConfirmation
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
        title="Hapus pedoman?"
        message={`"${deleteTarget?.title ?? ""}" tidak akan tampil lagi untuk kader.`}
        confirmLabel="Hapus"
        confirmVariant="destructive"
        loading={isDeleting}
      />
    </div>
  );
}
