"use client";

import {
  Building2,
  EllipsisVertical,
  Pencil,
  PlusCircle,
  Search,
  Trash2,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { BranchListEntry } from "@/apis/branches";
import { deleteBranch } from "@/lib/actions";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import Dropdown from "../common/Dropdown";
import Label from "../common/Label";
import Pagination from "../common/Pagination";
import Input from "../fields/Input";
import Select from "../fields/Select";
import SearchableSelect, { type SearchableOption } from "../fields/SearchableSelect";
import BranchFormSheet from "../forms/BranchFormSheet";
import AlertConfirmation from "../modals/AlertConfirmation";

const STATUS_FILTER_OPTIONS = [
  { label: "Semua Status", value: "" },
  { label: "Aktif", value: "active" },
  { label: "Tidak Aktif", value: "inactive" },
];

interface AdminBranchListPageProps {
  branches: BranchListEntry[];
  totalData: number;
  totalPage: number;
  currentPage: number;
  initialSearch: string;
  initialStatus: string;
  pageSize: number;
  selectedCoordinatingBody: { id: string; name: string } | null;
}

export default function AdminBranchListPage({
  branches,
  totalData,
  totalPage,
  currentPage,
  initialSearch,
  initialStatus,
  pageSize,
  selectedCoordinatingBody,
}: AdminBranchListPageProps) {
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
    BranchListEntry | null | "create"
  >(null);
  const [deleteTarget, setDeleteTarget] = useState<BranchListEntry | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const coordinatingBodyOption: SearchableOption | null = selectedCoordinatingBody
    ? { label: selectedCoordinatingBody.name, value: selectedCoordinatingBody.id }
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

  async function loadCoordinatingBodyOptions(inputValue: string, page: number) {
    const params = new URLSearchParams({ page: String(page) });
    if (inputValue) params.set("q", inputValue);
    const response = await fetch(`/api/coordinating-bodies/search?${params}`);
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
      const result = await deleteBranch(deleteTarget.id);
      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal menghapus cabang.");
        return;
      }
      toast.success("Cabang berhasil dihapus.");
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      console.error("[AdminBranchListPage] deleteBranch threw:", err);
      toast.error("Gagal menghapus cabang.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#172033] sm:text-3xl">
            Cabang
          </h1>
          <p className="mt-1.5 text-sm text-[#5f6573] sm:text-base">
            Kelola data Cabang HMI.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setSheetTarget("create")}
          className="w-fit"
        >
          <PlusCircle className="size-4" />
          Tambah Cabang
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:max-w-xs">
          <Input
            inputId="branch-search"
            placeholder="Cari nama cabang..."
            icon={<Search className="size-4" />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className="w-full sm:max-w-xs">
          <SearchableSelect
            selectId="branch-coordinating-body-filter"
            placeholder="Semua Badko"
            value={coordinatingBodyOption}
            onChange={(option) =>
              pushParams({ coordinating_body_id: option ? String(option.value) : "" })
            }
            loadOptions={loadCoordinatingBodyOptions}
            defaultOptions={coordinatingBodyOption ? [coordinatingBodyOption] : []}
          />
        </div>
        <div className="w-full sm:max-w-52">
          <Select
            selectId="branch-status-filter"
            placeholder="Semua Status"
            value={initialStatus}
            onChange={(value) => pushParams({ status: String(value ?? "") })}
            options={STATUS_FILTER_OPTIONS}
          />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-[#e6e9ef] bg-white">
        {branches.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
            <Building2 className="size-8 text-[#5f6573]" />
            <p className="text-sm font-medium text-[#172033]">
              Tidak ada cabang ditemukan.
            </p>
            {(initialSearch || initialStatus || selectedCoordinatingBody) && (
              <p className="text-xs text-[#5f6573]">
                Coba ubah kata kunci pencarian atau filter.
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-left text-sm">
              <thead className="border-b border-[#e6e9ef] bg-[#f5f7fb] text-[13px] font-semibold uppercase tracking-wide text-[#5f6573]">
                <tr>
                  <th className="px-4 py-3">Nama Cabang</th>
                  <th className="px-4 py-3">Tipe</th>
                  <th className="px-4 py-3">Jumlah Komisariat</th>
                  <th className="px-4 py-3">Jumlah Kader</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e9ef] text-[13px]">
                {branches.map((branch) => (
                  <tr key={branch.id} className="align-middle">
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setSheetTarget(branch)}
                        className="cursor-pointer text-left"
                      >
                        <p className="truncate text-sm font-semibold text-[#172033] hover:text-primary">
                          {branch.name}
                        </p>
                        <p className="truncate text-[13px] text-[#5f6573]">
                          {branch.coordinating_body_name
                            ? `Badko ${branch.coordinating_body_name}`
                            : "—"}
                        </p>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <Label variant={branch.type === "full" ? "blue" : "yellow"}>
                        {branch.type === "full"
                          ? "Status: Penuh"
                          : "Status: Persiapan"}
                      </Label>
                    </td>
                    <td className="px-4 py-3 text-[#172033]">
                      {branch.chapter_count ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-[#172033]">
                      {branch.user_count ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Label
                        variant={branch.status === "active" ? "green" : "red"}
                      >
                        {branch.status === "active" ? "Aktif" : "Tidak Aktif"}
                      </Label>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <Dropdown
                          panelClassName="w-44"
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
                            onClick={() => setSheetTarget(branch)}
                            className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-[#172033] transition hover:bg-[#f5f7fb]"
                          >
                            <Pencil className="size-4 text-[#5f6573]" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(branch)}
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

      {branches.length > 0 && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <Pagination currentPage={currentPage} totalPages={totalPage} />
          <p className="text-center text-sm text-[#5f6573]">
            Menampilkan {(currentPage - 1) * pageSize + 1}–
            {(currentPage - 1) * pageSize + branches.length} dari {totalData}{" "}
            cabang
          </p>
        </div>
      )}

      <BranchFormSheet
        open={sheetTarget !== null}
        onClose={() => setSheetTarget(null)}
        onSaved={() => {
          setSheetTarget(null);
          router.refresh();
        }}
        branch={sheetTarget === "create" ? null : sheetTarget}
        defaultCoordinatingBody={coordinatingBodyOption}
      />

      <AlertConfirmation
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus cabang ini?"
        message={`Apakah kamu yakin ingin menghapus ${deleteTarget?.name}? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        loading={isDeleting}
      />
    </div>
  );
}
