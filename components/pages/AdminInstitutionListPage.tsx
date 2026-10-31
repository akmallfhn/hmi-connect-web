"use client";

import {
  ArrowDownUp,
  Check,
  EllipsisVertical,
  Pencil,
  Plus,
  PlusCircle,
  Search,
  Trash2,
} from "lucide-react";
import { IconBuildingBank } from "@tabler/icons-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { InstitutionListEntry } from "@/apis/institutions";
import { deleteInstitution } from "@/lib/actions";
import {
  INSTITUTION_DEFAULT_SORT,
  INSTITUTION_SORT_OPTIONS,
  type InstitutionSort,
} from "@/lib/institution-sort";
import Button from "../buttons/Button";
import AdminPageTitle from "../common/AdminPageTitle";
import Dropdown from "../common/Dropdown";
import Pagination from "../common/Pagination";
import SortableHeader from "../common/SortableHeader";
import Input from "../fields/Input";
import CreateInstitutionFormSheet from "../forms/CreateInstitutionFormSheet";
import EditInstitutionFormSheet from "../forms/EditInstitutionFormSheet";
import AlertConfirmation from "../modals/AlertConfirmation";
import EmptyState from "../states/EmptyState";

interface AdminInstitutionListPageProps {
  institutions: InstitutionListEntry[];
  totalData: number;
  totalPage: number;
  currentPage: number;
  initialSearch: string;
  pageSize: number;
  sort: InstitutionSort;
}

// Square rounded-lg badge, the same shape every other admin entity list uses for its logo.
function InstitutionLogo({
  institution,
  className,
}: {
  institution: InstitutionListEntry;
  className: string;
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-muted ${className}`}
    >
      {institution.image_url ? (
        <Image
          src={institution.image_url}
          alt={institution.name}
          width={48}
          height={48}
          className="size-full object-cover"
        />
      ) : (
        <IconBuildingBank
          className="size-5 text-muted-foreground"
          stroke={1.8}
        />
      )}
    </span>
  );
}

export default function AdminInstitutionListPage({
  institutions,
  totalData,
  totalPage,
  currentPage,
  initialSearch,
  pageSize,
  sort,
}: AdminInstitutionListPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [seenSearch, setSeenSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  if (seenSearch !== initialSearch) {
    setSeenSearch(initialSearch);
    setSearchInput(initialSearch);
  }

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] =
    useState<InstitutionListEntry | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<InstitutionListEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    const timeout = setTimeout(() => {
      if (searchInput === initialSearch) return;
      pushParams({ search: searchInput.trim() });
    }, 500);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const result = await deleteInstitution(deleteTarget.id);
      if (!result.ok) {
        toast.error(result.message ?? "Gagal menghapus institusi.");
        return;
      }
      toast.success("Institusi berhasil dihapus.");
      setDeleteTarget(null);
      router.refresh();
    } catch (error) {
      console.error("[AdminInstitutionListPage] delete threw:", error);
      toast.error("Gagal menghapus institusi. Coba lagi.");
    } finally {
      setIsDeleting(false);
    }
  }

  function renderActions(institution: InstitutionListEntry) {
    return (
      <Dropdown
        panelClassName="w-40 rounded-xl"
        trigger={({ toggle }) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label={`Aksi untuk ${institution.name}`}
          >
            <EllipsisVertical className="size-4" />
          </Button>
        )}
      >
        <button
          type="button"
          onClick={() => setEditTarget(institution)}
          className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-heading transition hover:bg-surface-muted"
        >
          <Pencil className="size-4 text-muted-foreground" />
          Edit
        </button>
        <button
          type="button"
          onClick={() => setDeleteTarget(institution)}
          className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-destructive-foreground transition hover:bg-destructive-soft"
        >
          <Trash2 className="size-4" />
          Hapus
        </button>
      </Dropdown>
    );
  }

  const isFiltered = Boolean(initialSearch);
  const sortValue = sort
    ? `${sort.by}:${sort.type}`
    : INSTITUTION_DEFAULT_SORT;

  function changeSort(next: string) {
    const [by, type] = next.split(":");
    const isDefault = next === INSTITUTION_DEFAULT_SORT;
    pushParams({
      sort_by: isDefault ? "" : by,
      sort_type: isDefault ? "" : type,
    });
  }

  return (
    <div className="p-4 pb-24 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <AdminPageTitle description="Kelola institusi pendidikan yang dipakai pada profil kader dan data Komisariat.">
            Institusi Pendidikan
          </AdminPageTitle>
        </div>
        <div className="hidden sm:block">
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            <PlusCircle className="size-4" />
            Tambah Institusi
          </Button>
        </div>
      </div>

      <Button
        variant="primary"
        size="icon"
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] right-5 z-20 size-14! rounded-full! shadow-lg sm:hidden"
        aria-label="Tambah Institusi"
        title="Tambah Institusi"
        onClick={() => setCreateOpen(true)}
      >
        <Plus className="size-6" />
      </Button>

      <div className="mt-6 flex items-center gap-3">
        <div className="w-full sm:max-w-sm">
          <Input
            inputId="institution-search"
            placeholder="Cari nama atau alias institusi..."
            icon={<Search className="size-4" />}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>
        <Dropdown
          panelClassName="w-64 rounded-xl p-1.5"
          trigger={({ open, toggle }) => (
            <Button
              variant="light"
              onClick={toggle}
              aria-expanded={open}
              aria-label="Urutkan daftar institusi"
            >
              <ArrowDownUp className="size-4" />
              <span className="hidden sm:inline">Urutkan</span>
            </Button>
          )}
        >
          <div role="group" aria-label="Urutkan daftar institusi">
            {INSTITUTION_SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={sortValue === option.value}
                onClick={() => changeSort(option.value)}
                className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-surface-muted ${
                  sortValue === option.value
                    ? "bg-primary-soft font-semibold text-primary-foreground"
                    : "text-heading"
                }`}
              >
                {option.label}
                {sortValue === option.value && <Check className="size-4" />}
              </button>
            ))}
          </div>
        </Dropdown>
      </div>

      {institutions.length === 0 ? (
        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-surface">
          <EmptyState
            title={
              isFiltered ? "Institusi tidak ditemukan" : "Belum ada institusi"
            }
            description={
              isFiltered
                ? "Coba gunakan nama atau alias institusi yang lain."
                : "Tambahkan institusi pendidikan pertama ke HMI Connect."
            }
            action={
              isFiltered ? undefined : (
                <Button variant="primary" onClick={() => setCreateOpen(true)}>
                  <PlusCircle className="size-4" />
                  Tambah Institusi
                </Button>
              )
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-6 hidden overflow-hidden rounded-xl border border-border bg-surface md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-muted text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
                <tr>
                  <SortableHeader
                    label="Institusi"
                    sortKey="name"
                    activeSort={sort}
                    defaultDirection="asc"
                  />
                  <SortableHeader
                    label="Jumlah Komisariat"
                    sortKey="chapter_count"
                    activeSort={sort}
                  />
                  <SortableHeader
                    label="Jumlah Kader"
                    sortKey="user_count"
                    activeSort={sort}
                  />
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {institutions.map((institution) => (
                  <tr key={institution.id}>
                    <td className="px-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <InstitutionLogo
                          institution={institution}
                          className="size-10"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-heading">
                            {institution.name}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            Alias: {institution.alias || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-heading">
                      {institution.chapter_count}
                    </td>
                    <td className="px-4 py-3 text-heading">
                      {institution.user_count}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        {renderActions(institution)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:hidden">
            {institutions.map((institution) => (
              <div
                key={institution.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border bg-surface p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <InstitutionLogo
                    institution={institution}
                    className="size-12"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-heading">
                      {institution.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      Alias: {institution.alias || "—"}
                    </p>
                  </div>
                </div>
                {renderActions(institution)}
                <div className="col-span-full grid grid-cols-2 gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
                  <span>
                    Komisariat{" "}
                    <strong className="text-heading">
                      {institution.chapter_count}
                    </strong>
                  </span>
                  <span>
                    Kader{" "}
                    <strong className="text-heading">
                      {institution.user_count}
                    </strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {institutions.length > 0 && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <Pagination currentPage={currentPage} totalPages={totalPage} />
          <p className="text-center text-sm text-muted-foreground">
            Menampilkan {(currentPage - 1) * pageSize + 1}–
            {(currentPage - 1) * pageSize + institutions.length} dari{" "}
            {totalData} institusi
          </p>
        </div>
      )}

      <CreateInstitutionFormSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={() => {
          setCreateOpen(false);
          router.refresh();
        }}
      />

      <EditInstitutionFormSheet
        open={editTarget !== null}
        institution={editTarget}
        onClose={() => setEditTarget(null)}
        onSaved={() => {
          setEditTarget(null);
          router.refresh();
        }}
      />

      <AlertConfirmation
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
        title="Hapus institusi ini?"
        message={`Apakah kamu yakin ingin menghapus ${deleteTarget?.name ?? "institusi ini"}? Institusi akan disembunyikan dari daftar pilihan, tetapi referensi lama tetap tersimpan.`}
        confirmLabel="Hapus"
        loading={isDeleting}
      />
    </div>
  );
}
