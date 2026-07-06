"use client";

import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { TrainingHistoryEntry } from "@/apis/users";
import { updateUser } from "@/lib/actions";
import {
  isSuccessStatus,
  type TrainingResultEnum,
  type TrainingStatusEnum,
} from "@/lib/types";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import NumberInput from "../fields/NumberInput";
import Select from "../fields/Select";
import Modal from "../common/Modal";

const LEVEL_OPTIONS: { label: string; value: TrainingStatusEnum }[] = [
  { label: "Latihan Kader 1 (LK1)", value: "LK1" },
  { label: "Latihan Kader 2 (LK2)", value: "LK2" },
  { label: "Latihan Kader 3 (LK3)", value: "LK3" },
];

const RESULT_OPTIONS: { label: string; value: TrainingResultEnum }[] = [
  { label: "Lulus", value: "passed" },
  { label: "Lulus Bersyarat", value: "conditional_pass" },
  { label: "Tidak Lulus", value: "failed" },
];

type TrainingDraft = {
  id: string;
  level: TrainingStatusEnum;
  result: TrainingResultEnum;
  organizerName: string;
  year: string;
  isNew: boolean;
  removed: boolean;
};

function toDrafts(entries: TrainingHistoryEntry[]): TrainingDraft[] {
  return entries.map((entry) => ({
    id: entry.id,
    level: entry.level,
    result: entry.result,
    organizerName: entry.organizer_name,
    year: String(entry.year),
    isNew: false,
    removed: false,
  }));
}

function emptyDraft(): TrainingDraft {
  return {
    id: `new-${crypto.randomUUID()}`,
    level: "LK2",
    result: "passed",
    organizerName: "",
    year: "",
    isNew: true,
    removed: false,
  };
}

interface EditTrainingFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  userId?: string;
  entries: TrainingHistoryEntry[];
}

export default function EditTrainingForm({
  open,
  onClose,
  onSaved,
  userId,
  entries,
}: EditTrainingFormProps) {
  return (
    <Modal open={open} onClose={onClose} title="Edit Riwayat Kaderisasi">
      {open && (
        <TrainingFields
          onClose={onClose}
          onSaved={onSaved}
          userId={userId}
          entries={entries}
        />
      )}
    </Modal>
  );
}

interface TrainingFieldsProps {
  onClose: () => void;
  onSaved: () => void;
  userId?: string;
  entries: TrainingHistoryEntry[];
}

// Mounted only while the modal is open, so drafts are always seeded fresh from the
// latest entries — no effect needed to "reset" it on reopen.
function TrainingFields({
  onClose,
  onSaved,
  userId,
  entries,
}: TrainingFieldsProps) {
  const [drafts, setDrafts] = useState<TrainingDraft[]>(() => toDrafts(entries));
  const [isSaving, setIsSaving] = useState(false);

  function updateDraft<K extends keyof TrainingDraft>(
    id: string,
    key: K,
    value: TrainingDraft[K]
  ) {
    setDrafts((prev) =>
      prev.map((draft) => (draft.id === id ? { ...draft, [key]: value } : draft))
    );
  }

  function addDraft() {
    setDrafts((prev) => [...prev, emptyDraft()]);
  }

  function toggleRemoved(id: string) {
    setDrafts((prev) =>
      prev.map((draft) =>
        draft.id === id ? { ...draft, removed: !draft.removed } : draft
      )
    );
  }

  async function handleSubmit() {
    if (!userId) {
      toast.error("ID pengguna tidak ditemukan.");
      return;
    }

    // New rows have no backend id yet, and removed rows can't be deleted through this
    // endpoint — /users/update only edits existing rows by id. Both are skipped here.
    const savable = drafts.filter((draft) => !draft.isNew && !draft.removed);

    setIsSaving(true);
    try {
      const result = await updateUser({
        id: userId,
        ...(savable.length > 0
          ? {
              training_histories: savable.map((draft) => ({
                id: draft.id,
                level: draft.level,
                result: draft.result,
                organizer_name: draft.organizerName,
                year: Number(draft.year),
              })),
            }
          : {}),
      });

      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal menyimpan perubahan.");
        return;
      }

      const skipped = drafts.length - savable.length;
      toast.success("Riwayat kaderisasi berhasil diperbarui.");
      if (skipped > 0) {
        toast.info(
          `${skipped} entri baru/dihapus belum tersimpan — backend belum mendukung penambahan atau penghapusan riwayat kaderisasi.`
        );
      }
      onSaved();
    } catch (err) {
      console.error("[EditTrainingForm] updateUser threw:", err);
      toast.error("Gagal menyimpan perubahan.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {drafts.map((draft, index) => (
        <div
          key={draft.id}
          className={[
            "flex flex-col gap-4 rounded-xl border-b border-[#e6e9ef] pb-6 last:border-b-0 last:pb-0",
            draft.removed ? "opacity-50" : "",
          ].join(" ")}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              {draft.isNew && (
                <span className="inline-flex w-fit items-center rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary">
                  Baru — belum bisa disimpan
                </span>
              )}
              {draft.removed && (
                <span className="inline-flex w-fit items-center rounded-full bg-destructive-soft px-2 py-0.5 text-xs font-semibold text-destructive">
                  Akan dihapus — belum bisa disimpan
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => toggleRemoved(draft.id)}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-[#5f6573] transition hover:bg-[#f5f7fb]"
            >
              {draft.removed ? (
                <>
                  <RotateCcw className="size-3.5" />
                  Batalkan
                </>
              ) : (
                <>
                  <Trash2 className="size-3.5" />
                  Hapus
                </>
              )}
            </button>
          </div>

          <Select
            selectId={`training-level-${index}`}
            label="Tingkat"
            placeholder="Pilih tingkat"
            value={draft.level}
            disabled={draft.removed}
            onChange={(value) =>
              updateDraft(draft.id, "level", value as TrainingStatusEnum)
            }
            options={LEVEL_OPTIONS}
          />
          <Input
            inputId={`training-organizer-${index}`}
            label="Penyelenggara"
            value={draft.organizerName}
            disabled={draft.removed}
            onChange={(e) =>
              updateDraft(draft.id, "organizerName", e.target.value)
            }
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              selectId={`training-result-${index}`}
              label="Hasil"
              placeholder="Pilih hasil"
              value={draft.result}
              disabled={draft.removed}
              onChange={(value) =>
                updateDraft(draft.id, "result", value as TrainingResultEnum)
              }
              options={RESULT_OPTIONS}
            />
            <NumberInput
              inputId={`training-year-${index}`}
              label="Tahun"
              value={draft.year}
              disabled={draft.removed}
              onValueChange={(value) => updateDraft(draft.id, "year", value)}
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addDraft}
        className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#dbe3ef] py-2.5 text-sm font-medium text-primary transition hover:bg-primary-soft"
      >
        <Plus className="size-4" />
        Tambah Riwayat Kaderisasi
      </button>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={isSaving}>
          Batal
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </div>
  );
}
