"use client";

import AdminPageTitle from "../common/AdminPageTitle";
import {
  EllipsisVertical,
  Pencil,
  PlusCircle,
  Search,
  Trash2,
  University,
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { ChapterListEntry } from "@/apis/chapters";
import { deleteChapter } from "@/lib/actions";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import Dropdown from "../common/Dropdown";
import Label from "../common/Label";
import Pagination from "../common/Pagination";
import Input from "../fields/Input";
import Select from "../fields/Select";
import SearchableSelect, {
  type SearchableOption,
} from "../fields/SearchableSelect";
import ChapterFormSheet from "../forms/ChapterFormSheet";
import AlertConfirmation from "../modals/AlertConfirmation";
import EmptyState from "../states/EmptyState";

const STATUS_FILTER_OPTIONS = [
  { label: "Semua Status", value: "" },
  { label: "Aktif", value: "active" },
  { label: "Tidak Aktif", value: "inactive" },
];

interface AdminChapterListPageProps {
  chapters: ChapterListEntry[];
  totalData: number;
  totalPage: number;
  currentPage: number;
  initialSearch: string;
  initialStatus: string;
  pageSize: number;
  selectedBranch: { id: string; name: string } | null;
}

export default function AdminChapterListPage({
  chapters,
  totalData,
  totalPage,
  currentPage,
  initialSearch,
  initialStatus,
  pageSize,
  selectedBranch,
}: AdminChapterListPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // "Adjust state during render" (not a useEffect) when the server hands back a new initialSearch, same pattern as SearchPage.
  const [seenSearch, setSeenSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  if (initialSearch !== seenSearch) {
    setSeenSearch(initialSearch);
    setSearchInput(initialSearch);
  }

  const [sheetTarget, setSheetTarget] = useState<
    ChapterListEntry | null | "create"
  >(null);
  const [deleteTarget, setDeleteTarget] = useState<ChapterListEntry | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const branchOption: SearchableOption | null = selectedBranch
    ? { label: selectedBranch.name, value: selectedBranch.id }
    : null;

  function pushParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }

  async function loadBranchOptions(inputValue: string, page: number) {
    const params = new URLSearchParams({ page: String(page) });
    if (inputValue) params.set("q", inputValue);
    const response = await fetch(`/api/branches/search?${params}`);
    const json = await response.json();
    const results: { id: string; name: string }[] = json.data ?? [];
    return {
      options: results.map((item) => ({ label: item.name, value: item.id })),
      hasMore: Boolean(json.hasMore),
    };
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
      const result = await deleteChapter(deleteTarget.id);
      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal menghapus komisariat.");
        return;
      }
      toast.success("Komisariat berhasil dihapus.");
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      console.error("[AdminChapterListPage] deleteChapter threw:", err);
      toast.error("Gagal menghapus komisariat.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <AdminPageTitle description="Kelola data Komisariat HMI.">
            Komisariat
          </AdminPageTitle>
        </div>
        <Button
          variant="primary"
          onClick={() => setSheetTarget("create")}
          className="w-fit"
        >
          <PlusCircle className="size-4" />
          Tambah Komisariat
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:max-w-xs">
          <Input
            inputId="chapter-search"
            placeholder="Cari nama komisariat..."
            icon={<Search className="size-4" />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className="w-full sm:max-w-xs">
          <SearchableSelect
            selectId="chapter-branch-filter"
            placeholder="Filter Cabang"
            value={branchOption}
            onChange={(option) =>
              pushParams({ branch_id: option ? String(option.value) : "" })
            }
            loadOptions={loadBranchOptions}
            defaultOptions={branchOption ? [branchOption] : []}
          />
        </div>
        <div className="w-full sm:max-w-52">
          <Select
            selectId="chapter-status-filter"
            placeholder="Filter Status"
            value={initialStatus || null}
            onChange={(value) => pushParams({ status: String(value ?? "") })}
            options={STATUS_FILTER_OPTIONS}
          />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-[#e6e9ef] bg-white">
        {chapters.length === 0 ? (
          <EmptyState
            title={
              initialSearch || initialStatus || selectedBranch
                ? "Komisariat tidak ditemukan"
                : "Belum ada komisariat"
            }
            description={
              initialSearch || initialStatus || selectedBranch
                ? "Coba ubah kata kunci pencarian atau filter."
                : "Komisariat yang ditambahkan akan ditampilkan di sini."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="border-b border-[#e6e9ef] bg-[#f5f7fb] text-[13px] font-semibold uppercase tracking-wide text-[#5f6573]">
                <tr>
                  <th className="px-4 py-3">Nama Komisariat</th>
                  <th className="px-4 py-3">Asal Universitas</th>
                  <th className="px-4 py-3">Tipe</th>
                  <th className="px-4 py-3">Jumlah Kader</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e9ef] text-[13px]">
                {chapters.map((chapter) => (
                  <tr key={chapter.id} className="align-middle">
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setSheetTarget(chapter)}
                        className="cursor-pointer text-left"
                      >
                        <p className="truncate text-sm font-semibold text-[#172033] hover:text-primary">
                          {chapter.name}
                        </p>
                        <p className="truncate text-[13px] text-[#5f6573]">
                          Cabang {chapter.branch_name}
                        </p>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      {chapter.institution_name ? (
                        <div className="flex items-center gap-2">
                          <span className="flex size-7 p-0.75 shrink-0 items-center justify-center border border-[#e6e9ef] overflow-hidden rounded-full bg-[#f5f7fb]">
                            {chapter.institution_avatar ? (
                              <Image
                                className="h-full w-full object-cover"
                                src={chapter.institution_avatar}
                                alt={chapter.institution_name}
                                width={24}
                                height={24}
                              />
                            ) : (
                              <University className="size-3.5 text-[#5f6573]" />
                            )}
                          </span>
                          <span className="truncate text-[#172033]">
                            {chapter.institution_name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#5f6573]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Label
                        variant={chapter.type === "full" ? "blue" : "yellow"}
                      >
                        {chapter.type === "full"
                          ? "Status: Penuh"
                          : "Status: Persiapan"}
                      </Label>
                    </td>
                    <td className="px-4 py-3 text-[#172033]">
                      {chapter.user_count ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Label
                        variant={chapter.status === "active" ? "green" : "red"}
                      >
                        {chapter.status === "active" ? "Aktif" : "Tidak Aktif"}
                      </Label>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <Dropdown
                          panelClassName="w-44 rounded-xl"
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
                            onClick={() => setSheetTarget(chapter)}
                            className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-[#172033] transition hover:bg-[#f5f7fb]"
                          >
                            <Pencil className="size-4 text-[#5f6573]" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(chapter)}
                            className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-destructive transition hover:bg-destructive-soft"
                          >
                            <Trash2 className="size-4" />
                            Hapus
                          </button>
                        </Dropdown>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {chapters.length > 0 && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <Pagination currentPage={currentPage} totalPages={totalPage} />
          <p className="text-center text-sm text-[#5f6573]">
            Menampilkan {(currentPage - 1) * pageSize + 1}–
            {(currentPage - 1) * pageSize + chapters.length} dari {totalData}{" "}
            komisariat
          </p>
        </div>
      )}

      <ChapterFormSheet
        open={sheetTarget !== null}
        onClose={() => setSheetTarget(null)}
        onSaved={() => {
          setSheetTarget(null);
          router.refresh();
        }}
        chapter={sheetTarget === "create" ? null : sheetTarget}
        defaultBranch={branchOption}
      />

      <AlertConfirmation
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus komisariat ini?"
        message={`Apakah kamu yakin ingin menghapus ${deleteTarget?.name}? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        loading={isDeleting}
      />
    </div>
  );
}
