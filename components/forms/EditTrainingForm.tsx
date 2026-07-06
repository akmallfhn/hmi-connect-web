"use client";

import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { TrainingHistoryEntry } from "@/apis/users";
import {
  createTrainingHistory,
  deleteTrainingHistory,
  updateTrainingHistory,
} from "@/lib/actions";
import {
  isSuccessStatus,
  type TrainingResultEnum,
  type TrainingStatusEnum,
} from "@/lib/types";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import NumberInput from "../fields/NumberInput";
import Select from "../fields/Select";
import AppModal from "../modals/AppModal";

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
    <AppModal open={open} onClose={onClose} title="Edit Riwayat Kaderisasi">
      {open && (
        <TrainingFields
          onClose={onClose}
          onSaved={onSaved}
          userId={userId}
          entries={entries}
        />
      )}
    </AppModal>
  );
}

interface TrainingFieldsProps {
  onClose: () => void;
  onSaved: () => void;
  userId?: string;
  entries: TrainingHistoryEntry[];
}

// Mounted only while open, so drafts always seed fresh from entries — no reset effect needed.
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

    const newDrafts = drafts.filter((draft) => draft.isNew && !draft.removed);
    const missingOrganizer = newDrafts.find((draft) => !draft.organizerName.trim());
    const missingYear = newDrafts.find((draft) => !draft.year.trim());
    if (missingOrganizer || missingYear) {
      toast.error("Lengkapi penyelenggara dan tahun untuk entri baru.");
      return;
    }

    setIsSaving(true);
    try {
      const results = await Promise.all(
        drafts.map((draft) => {
          if (draft.isNew) {
            if (draft.removed) return null;
            return createTrainingHistory({
              level: draft.level,
              result: draft.result,
              organizer_name: draft.organizerName,
              year: Number(draft.year),
            });
          }
          if (draft.removed) {
            return deleteTrainingHistory(draft.id);
          }
          return updateTrainingHistory({
            id: draft.id,
            level: draft.level,
            result: draft.result,
            organizer_name: draft.organizerName,
            year: Number(draft.year),
          });
        })
      );

      const attempted = results.filter(Boolean);
      const failed = attempted.filter(
        (result) => !isSuccessStatus(result!.status)
      );

      if (failed.length > 0) {
        toast.error(
          `${failed.length} dari ${attempted.length} perubahan gagal disimpan.`
        );
        return;
      }

      toast.success("Riwayat kaderisasi berhasil diperbarui.");
      onSaved();
    } catch (err) {
      console.error("[EditTrainingForm] history mutation threw:", err);
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
            "flex flex-col gap-4 rounded-xl border p-4",
            draft.removed
              ? "border-destructive/30 bg-destructive-soft/30"
              : "border-[#e6e9ef]",
          ].join(" ")}
        >
          {(draft.isNew || draft.removed) && (
            <div className="flex flex-wrap gap-2">
              {draft.isNew && (
                <span className="inline-flex w-fit items-center rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary">
                  Baru
                </span>
              )}
              {draft.removed && (
                <span className="inline-flex w-fit items-center rounded-full bg-destructive-soft px-2 py-0.5 text-xs font-semibold text-destructive">
                  Akan dihapus
                </span>
              )}
            </div>
          )}

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
            placeholder="Contoh: Komisariat FH UI"
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
              placeholder="2020"
              value={draft.year}
              disabled={draft.removed}
              onValueChange={(value) => updateDraft(draft.id, "year", value)}
            />
          </div>

          <div className="flex justify-end border-t border-[#e6e9ef] pt-4">
            <Button
              variant={draft.removed ? "outline" : "destructive"}
              size="sm"
              onClick={() => toggleRemoved(draft.id)}
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
            </Button>
          </div>
        </div>
      ))}

      <Button
        variant="ghost"
        onClick={addDraft}
        className="w-full gap-1.5 rounded-lg border border-dashed border-[#dbe3ef] py-2.5 text-primary hover:bg-primary-soft"
      >
        <Plus className="size-4" />
        Tambah Riwayat Kaderisasi
      </Button>

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
