"use client";

import { Loader2, RotateCcw, Save, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { ApiEnvelope } from "@/apis/api";
import type { StructuralOfficer } from "@/apis/structurals";
import {
  createStructuralOfficer,
  deleteStructuralOfficer,
  updateStructuralOfficer,
} from "@/lib/actions";
import {
  loadEntityUserOptions,
  loadStructuralPositionOptions,
} from "@/lib/structural-options";
import {
  isSuccessStatus,
  type StatusEnum,
  type StructuralEntityTypeEnum,
} from "@/lib/types";
import Button from "../buttons/Button";
import Avatar from "../common/Avatar";
import Select from "../fields/Select";
import SearchableSelect, {
  type SearchableOption,
} from "../fields/SearchableSelect";

// One editable line: an existing officer (kader fixed, since officers/update cannot move a row to another person) or a brand-new one.
type BulkOfficerRow = {
  key: string;
  officer: StructuralOfficer | null;
  user: SearchableOption | null;
  position: SearchableOption | null;
  status: StatusEnum;
  removed: boolean;
};

const STATUS_OPTIONS = [
  { label: "Aktif", value: "active" },
  { label: "Non-aktif", value: "inactive" },
];

function toRow(officer: StructuralOfficer): BulkOfficerRow {
  return {
    key: officer.id,
    officer,
    user: {
      label: officer.user_full_name,
      value: officer.user_id,
      image: officer.user_avatar,
    },
    position: { label: officer.position_name, value: officer.position_id },
    status: officer.status,
    removed: false,
  };
}

function createEmptyRow(): BulkOfficerRow {
  return {
    key: crypto.randomUUID(),
    officer: null,
    user: null,
    position: null,
    status: "active",
    removed: false,
  };
}

// A new row only counts once something is filled in, so an untouched blank line never blocks saving.
function rowIsChanged(row: BulkOfficerRow) {
  if (!row.officer) return row.user !== null || row.position !== null;
  if (row.removed) return true;
  return (
    Number(row.position?.value) !== row.officer.position_id ||
    row.status !== row.officer.status
  );
}

export default function StructuralBulkEditor({
  entityType,
  entityId,
  periodId,
  officers,
  onCancel,
  onSaved,
}: {
  entityType: StructuralEntityTypeEnum;
  entityId: string;
  periodId: number;
  officers: StructuralOfficer[];
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [rows, setRows] = useState<BulkOfficerRow[]>(() => officers.map(toRow));
  const [isSaving, setIsSaving] = useState(false);

  const changedCount = rows.filter(rowIsChanged).length;

  function updateRow(key: string, patch: Partial<BulkOfficerRow>) {
    setRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, ...patch } : row))
    );
  }

  function toggleRemoved(row: BulkOfficerRow) {
    // A new row has nothing to delete on the backend, so its trash button just drops the line.
    if (!row.officer) {
      setRows((prev) => prev.filter((item) => item.key !== row.key));
      return;
    }
    updateRow(row.key, { removed: !row.removed });
  }

  function addRow() {
    setRows((prev) => [...prev, createEmptyRow()]);
  }

  async function handleSave() {
    const incompleteNewRow = rows.some(
      (row) => !row.officer && (!row.user || !row.position)
    );
    if (incompleteNewRow) {
      toast.error("Lengkapi kader dan jabatan pada setiap baris baru.");
      return;
    }

    const missingPosition = rows.some(
      (row) => row.officer && !row.removed && !row.position
    );
    if (missingPosition) {
      toast.error("Jabatan tidak boleh kosong.");
      return;
    }

    const tasks: { label: string; run: () => Promise<ApiEnvelope<unknown>> }[] =
      [];

    for (const row of rows) {
      if (!rowIsChanged(row)) continue;
      const name = row.officer?.user_full_name ?? row.user?.label ?? "Anggota";

      if (row.officer && row.removed) {
        const officerId = row.officer.id;
        tasks.push({
          label: name,
          run: () => deleteStructuralOfficer(officerId),
        });
        continue;
      }

      if (row.officer) {
        const officer = row.officer;
        const positionId = Number(row.position!.value);
        const nextStatus = row.status;
        tasks.push({
          label: name,
          run: () =>
            updateStructuralOfficer({
              id: officer.id,
              ...(positionId !== officer.position_id
                ? { position_id: positionId }
                : {}),
              ...(nextStatus !== officer.status ? { status: nextStatus } : {}),
            }),
        });
        continue;
      }

      const userId = String(row.user!.value);
      const positionId = Number(row.position!.value);
      tasks.push({
        label: name,
        run: () =>
          createStructuralOfficer({
            structural_period_id: periodId,
            user_id: userId,
            position_id: positionId,
          }),
      });
    }

    if (tasks.length === 0) {
      toast.error("Belum ada perubahan untuk disimpan.");
      return;
    }

    setIsSaving(true);
    try {
      const results = await Promise.all(
        tasks.map(async (task) => {
          try {
            return { label: task.label, result: await task.run() };
          } catch (err) {
            console.error("[StructuralBulkEditor] task threw:", err);
            return { label: task.label, result: null };
          }
        })
      );

      const failed = results.filter(
        (item) => !item.result || !isSuccessStatus(item.result.status)
      );

      if (failed.length === 0) {
        toast.success(`${tasks.length} perubahan berhasil disimpan.`);
      } else {
        toast.error(
          `${failed.length} dari ${tasks.length} perubahan gagal: ${failed
            .map((item) => item.label)
            .join(", ")}.`
        );
      }
      // Closes either way, so the roster is read back from the server instead of from now-stale drafts.
      onSaved();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-base font-semibold text-[#172033]">
            Kelola Anggota Sekaligus
          </p>
          <p className="mt-1 text-sm text-[#5f6573]">
            Ubah jabatan dan status beberapa anggota, tambahkan anggota baru,
            atau tandai yang ingin dihapus, lalu simpan sekali.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={addRow}
          disabled={isSaving}
          className="w-fit shrink-0"
        >
          <UserPlus className="size-4" />
          Tambah Baris
        </Button>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-[#e6e9ef]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="border-b border-[#e6e9ef] bg-[#f5f7fb] text-[13px] font-semibold uppercase tracking-wide text-[#5f6573]">
              <tr>
                <th className="w-12 px-4 py-3">No</th>
                <th className="px-4 py-3">Nama</th>
                <th className="w-64 px-4 py-3">Jabatan</th>
                <th className="w-40 px-4 py-3">Status</th>
                <th className="w-16 px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6e9ef]">
              {rows.map((row, index) => (
                <tr
                  key={row.key}
                  className={row.removed ? "bg-destructive-soft/40" : undefined}
                >
                  <td className="px-4 py-3 text-[#5f6573]">{index + 1}</td>
                  <td className="px-4 py-3">
                    {row.officer ? (
                      <div
                        className={`flex items-center gap-3 ${
                          row.removed ? "opacity-60" : ""
                        }`}
                      >
                        <Avatar
                          src={row.officer.user_avatar}
                          name={row.officer.user_full_name}
                          size={36}
                        />
                        <span
                          className={`font-medium text-[#172033] ${
                            row.removed ? "line-through" : ""
                          }`}
                        >
                          {row.officer.user_full_name}
                        </span>
                      </div>
                    ) : (
                      <SearchableSelect
                        selectId={`bulk-officer-user-${row.key}`}
                        placeholder="Cari nama kader..."
                        value={row.user}
                        onChange={(user) => updateRow(row.key, { user })}
                        loadOptions={(inputValue, page) =>
                          loadEntityUserOptions(
                            entityType,
                            entityId,
                            inputValue,
                            page
                          )
                        }
                        disabled={isSaving}
                        showOptionAvatar
                      />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <SearchableSelect
                      selectId={`bulk-officer-position-${row.key}`}
                      placeholder="Cari jabatan..."
                      value={row.position}
                      onChange={(position) => updateRow(row.key, { position })}
                      loadOptions={loadStructuralPositionOptions}
                      defaultOptions={row.position ? [row.position] : undefined}
                      disabled={isSaving || row.removed}
                    />
                  </td>
                  <td className="px-4 py-3">
                    {row.officer ? (
                      <Select
                        selectId={`bulk-officer-status-${row.key}`}
                        placeholder="Pilih status"
                        value={row.status}
                        onChange={(value) =>
                          updateRow(row.key, { status: value as StatusEnum })
                        }
                        options={STATUS_OPTIONS}
                        disabled={isSaving || row.removed}
                      />
                    ) : (
                      // officers/create takes no status — a new officer always starts active.
                      <span className="text-[#5f6573]">Aktif</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="iconSm"
                        onClick={() => toggleRemoved(row)}
                        disabled={isSaving}
                        aria-label={
                          row.removed
                            ? `Batalkan penghapusan ${row.officer?.user_full_name}`
                            : "Hapus baris"
                        }
                        className={
                          row.removed
                            ? "text-[#5f6573] hover:bg-[#f5f7fb]"
                            : "text-destructive hover:bg-destructive-soft"
                        }
                      >
                        {row.removed ? (
                          <RotateCcw className="size-4" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-[#5f6573]"
                  >
                    Belum ada anggota. Tambahkan baris untuk mulai mengisi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-[#e6e9ef] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#5f6573]">
          {changedCount > 0
            ? `${changedCount} perubahan belum disimpan.`
            : "Belum ada perubahan."}
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving || changedCount === 0}
          >
            {isSaving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </div>
    </div>
  );
}
