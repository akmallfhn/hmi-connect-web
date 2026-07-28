"use client";

import { EllipsisVertical, Network, Pencil, PlusCircle, Search, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { CoordinatingBodyListEntry } from "@/apis/coordinating-bodies";
import { deleteCoordinatingBody } from "@/lib/actions";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import Dropdown from "../common/Dropdown";
import Label from "../common/Label";
import Pagination from "../common/Pagination";
import Input from "../fields/Input";
import Select from "../fields/Select";
import CoordinatingBodyFormSheet from "../forms/CoordinatingBodyFormSheet";
import AlertConfirmation from "../modals/AlertConfirmation";

const STATUS_FILTER_OPTIONS = [
  { label: "Semua Status", value: "" },
  { label: "Aktif", value: "active" },
  { label: "Tidak Aktif", value: "inactive" },
];

interface AdminCoordinatingBodyListPageProps {
  coordinatingBodies: CoordinatingBodyListEntry[];
  totalData: number;
  totalPage: number;
  currentPage: number;
  initialSearch: string;
  initialStatus: string;
  pageSize: number;
}

export default function AdminCoordinatingBodyListPage({
  coordinatingBodies,
  totalData,
  totalPage,
  currentPage,
  initialSearch,
  initialStatus,
  pageSize,
}: AdminCoordinatingBodyListPageProps) {
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
    CoordinatingBodyListEntry | null | "create"
  >(null);
  const [deleteTarget, setDeleteTarget] = useState<CoordinatingBodyListEntry | null>(
    null
  );
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
      const result = await deleteCoordinatingBody(deleteTarget.id);
      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal menghapus Badko.");
        return;
      }
      toast.success("Badko berhasil dihapus.");
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      console.error("[AdminCoordinatingBodyListPage] deleteCoordinatingBody threw:", err);
      toast.error("Gagal menghapus Badko.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#172033] sm:text-3xl">
            Badko
          </h1>
          <p className="mt-1.5 text-sm text-[#5f6573] sm:text-base">
            Kelola data Badan Koordinasi (Badko) HMI.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setSheetTarget("create")}
          className="w-fit"
        >
          <PlusCircle className="size-4" />
          Tambah Badko
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:max-w-xs">
          <Input
            inputId="coordinating-body-search"
            placeholder="Cari nama Badko..."
            icon={<Search className="size-4" />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className="w-full sm:max-w-52">
          <Select
            selectId="coordinating-body-status-filter"
            placeholder="Semua Status"
            value={initialStatus}
            onChange={(value) => pushParams({ status: String(value ?? "") })}
            options={STATUS_FILTER_OPTIONS}
          />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-[#e6e9ef] bg-white">
        {coordinatingBodies.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
            <Network className="size-8 text-[#5f6573]" />
            <p className="text-sm font-medium text-[#172033]">
              Tidak ada Badko ditemukan.
            </p>
            {(initialSearch || initialStatus) && (
              <p className="text-xs text-[#5f6573]">
                Coba ubah kata kunci pencarian atau filter status.
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b border-[#e6e9ef] bg-[#f5f7fb] text-[13px] font-semibold uppercase tracking-wide text-[#5f6573]">
                <tr>
                  <th className="px-4 py-3">Nama Badko</th>
                  <th className="px-4 py-3">Jumlah Cabang</th>
                  <th className="px-4 py-3">Jumlah Kader</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e9ef] text-[13px]">
                {coordinatingBodies.map((coordinatingBody) => (
                  <tr key={coordinatingBody.id} className="align-middle">
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setSheetTarget(coordinatingBody)}
                        className="cursor-pointer text-left"
                      >
                        <p className="truncate text-sm font-semibold text-[#172033] hover:text-primary">
                          {coordinatingBody.name}
                        </p>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-[#172033]">
                      {coordinatingBody.branch_count ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-[#172033]">
                      {coordinatingBody.user_count ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Label
                        variant={coordinatingBody.status === "active" ? "green" : "red"}
                      >
                        {coordinatingBody.status === "active" ? "Aktif" : "Tidak Aktif"}
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
                            onClick={() => setSheetTarget(coordinatingBody)}
                            className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-[#172033] transition hover:bg-[#f5f7fb]"
                          >
                            <Pencil className="size-4 text-[#5f6573]" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(coordinatingBody)}
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

      {coordinatingBodies.length > 0 && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <Pagination currentPage={currentPage} totalPages={totalPage} />
          <p className="text-center text-sm text-[#5f6573]">
            Menampilkan {(currentPage - 1) * pageSize + 1}–
            {(currentPage - 1) * pageSize + coordinatingBodies.length} dari{" "}
            {totalData} Badko
          </p>
        </div>
      )}

      <CoordinatingBodyFormSheet
        open={sheetTarget !== null}
        onClose={() => setSheetTarget(null)}
        onSaved={() => {
          setSheetTarget(null);
          router.refresh();
        }}
        coordinatingBody={sheetTarget === "create" ? null : sheetTarget}
      />

      <AlertConfirmation
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Badko ini?"
        message={`Apakah kamu yakin ingin menghapus ${deleteTarget?.name}? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        loading={isDeleting}
      />
    </div>
  );
}
