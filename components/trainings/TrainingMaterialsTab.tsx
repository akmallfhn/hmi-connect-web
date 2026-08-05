"use client";

import {
  EllipsisVertical,
  ExternalLink,
  Pencil,
  PlusCircle,
  Search,
  Trash2,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { TrainingMaterial } from "@/apis/trainings";
import { deleteTrainingMaterial } from "@/lib/actions";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import Dropdown from "../common/Dropdown";
import Pagination from "../common/Pagination";
import Input from "../fields/Input";
import TrainingMaterialFormSheet from "../forms/TrainingMaterialFormSheet";
import AlertConfirmation from "../modals/AlertConfirmation";
import EmptyState from "../states/EmptyState";

interface TrainingMaterialsTabProps {
  trainingId: string;
  materials: TrainingMaterial[];
  totalData: number;
  totalPage: number;
  currentPage: number;
  initialSearch: string;
  pageSize: number;
  canManage: boolean;
}

export default function TrainingMaterialsTab({
  trainingId,
  materials,
  totalData,
  totalPage,
  currentPage,
  initialSearch,
  pageSize,
  canManage,
}: TrainingMaterialsTabProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [seenSearch, setSeenSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  if (seenSearch !== initialSearch) {
    setSeenSearch(initialSearch);
    setSearchInput(initialSearch);
  }

  const [sheetTarget, setSheetTarget] = useState<
    TrainingMaterial | null | "create"
  >(null);
  const [deleteTarget, setDeleteTarget] = useState<TrainingMaterial | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function pushSearch(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "materi");
    if (value) params.set("material_search", value);
    else params.delete("material_search");
    params.set("material_page", "1");
    router.push(`?${params.toString()}`);
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput === initialSearch) return;
      pushSearch(searchInput);
    }, 500);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const result = await deleteTrainingMaterial(deleteTarget.id);
      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal menghapus materi.");
        return;
      }
      toast.success("Materi berhasil dihapus.");
      setDeleteTarget(null);
      router.refresh();
    } catch (error) {
      console.error("[TrainingMaterialsTab] delete threw:", error);
      toast.error("Gagal menghapus materi.");
    } finally {
      setIsDeleting(false);
    }
  }

  const nextIndex = Math.max(
    totalData + 1,
    ...materials.map((material) => material.index + 1)
  );

  return (
    <div className="overflow-hidden rounded-xl border border-[#e6e9ef] bg-white">
      <div className="flex flex-col gap-3 border-b border-[#e6e9ef] p-5 sm:flex-row sm:items-center">
        <div className="w-full sm:max-w-xs">
          <Input
            inputId="training-material-search"
            placeholder="Cari judul materi..."
            icon={<Search className="size-4" />}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>
        {canManage && (
          <Button
            variant="primary"
            className="w-fit sm:ml-auto"
            onClick={() => setSheetTarget("create")}
          >
            <PlusCircle className="size-4" />
            Tambah Materi
          </Button>
        )}
      </div>

      {materials.length === 0 ? (
        <EmptyState
          title={
            initialSearch ? "Materi tidak ditemukan" : "Belum ada materi"
          }
          description={
            initialSearch
              ? "Coba ubah kata kunci pencarian."
              : "Materi yang ditambahkan akan ditampilkan di sini."
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-[#e6e9ef] bg-[#f5f7fb] text-[13px] font-semibold uppercase text-[#5f6573]">
              <tr>
                <th className="w-20 px-4 py-3">Urutan</th>
                <th className="px-4 py-3">Judul Materi</th>
                <th className="px-4 py-3">Tautan</th>
                {canManage && <th className="px-4 py-3 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6e9ef] text-[13px]">
              {materials.map((material) => (
                <tr key={material.id}>
                  <td className="px-4 py-3 font-semibold text-[#5f6573]">
                    {String(material.index).padStart(2, "0")}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#172033]">
                    {material.title}
                  </td>
                  <td className="px-4 py-3">
                    {material.material_url ? (
                      <a
                        href={material.material_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-primary hover:underline"
                      >
                        Buka materi
                        <ExternalLink className="size-3.5" />
                      </a>
                    ) : (
                      <span className="text-[#5f6573]">Belum tersedia</span>
                    )}
                  </td>
                  {canManage && (
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <Dropdown
                          panelClassName="w-44 rounded-xl"
                          trigger={({ toggle }) => (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={toggle}
                              aria-label={`Aksi materi ${material.title}`}
                            >
                              <EllipsisVertical className="size-4" />
                            </Button>
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => setSheetTarget(material)}
                            className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-[#172033] hover:bg-[#f5f7fb]"
                          >
                            <Pencil className="size-4 text-[#5f6573]" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(material)}
                            className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-destructive hover:bg-destructive-soft"
                          >
                            <Trash2 className="size-4" />
                            Hapus
                          </button>
                        </Dropdown>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {materials.length > 0 && (
        <div className="flex flex-col items-center gap-3 border-t border-[#e6e9ef] p-5">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPage}
            queryKey="material_page"
          />
          <p className="text-center text-sm text-[#5f6573]">
            Menampilkan {(currentPage - 1) * pageSize + 1}-
            {(currentPage - 1) * pageSize + materials.length} dari {totalData} materi
          </p>
        </div>
      )}

      <TrainingMaterialFormSheet
        open={sheetTarget !== null}
        onClose={() => setSheetTarget(null)}
        onSaved={() => {
          setSheetTarget(null);
          router.refresh();
        }}
        trainingId={trainingId}
        material={sheetTarget === "create" ? null : sheetTarget}
        nextIndex={nextIndex}
      />
      <AlertConfirmation
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus materi ini?"
        message={`Materi ${deleteTarget?.title ?? "ini"} akan dihapus permanen.`}
        confirmLabel="Hapus"
        loading={isDeleting}
      />
    </div>
  );
}
