"use client";

import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { EducationHistoryEntry } from "@/apis/users";
import { updateUser } from "@/lib/actions";
import { isSuccessStatus, type Degree } from "@/lib/types";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import NumberInput from "../fields/NumberInput";
import Select from "../fields/Select";
import Modal from "../common/Modal";

const DEGREE_OPTIONS: { label: string; value: Degree }[] = [
  { label: "Diploma (Ahli Pratama)", value: "diploma_ahli_pratama" },
  { label: "Diploma (Ahli Muda)", value: "diploma_ahli_muda" },
  { label: "Diploma (Ahli Madya)", value: "diploma_ahli_madya" },
  { label: "Sarjana", value: "sarjana" },
  { label: "Magister", value: "magister" },
  { label: "Doktor", value: "doktor" },
];

type EducationDraft = {
  id: string;
  institutionName: string;
  degree: Degree;
  major: string;
  startYear: string;
  endYear: string;
  isNew: boolean;
  removed: boolean;
};

function toDrafts(entries: EducationHistoryEntry[]): EducationDraft[] {
  return entries.map((entry) => ({
    id: entry.id,
    institutionName: entry.institution_name,
    degree: entry.degree,
    major: entry.major,
    startYear: String(entry.start_year),
    endYear: entry.end_year ? String(entry.end_year) : "",
    isNew: false,
    removed: false,
  }));
}

function emptyDraft(): EducationDraft {
  return {
    id: `new-${crypto.randomUUID()}`,
    institutionName: "",
    degree: "sarjana",
    major: "",
    startYear: "",
    endYear: "",
    isNew: true,
    removed: false,
  };
}

interface EditEducationFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  userId?: string;
  entries: EducationHistoryEntry[];
}

export default function EditEducationForm({
  open,
  onClose,
  onSaved,
  userId,
  entries,
}: EditEducationFormProps) {
  return (
    <Modal open={open} onClose={onClose} title="Edit Pendidikan">
      {open && (
        <EducationFields
          onClose={onClose}
          onSaved={onSaved}
          userId={userId}
          entries={entries}
        />
      )}
    </Modal>
  );
}

interface EducationFieldsProps {
  onClose: () => void;
  onSaved: () => void;
  userId?: string;
  entries: EducationHistoryEntry[];
}

// Mounted only while the modal is open, so drafts are always seeded fresh from the
// latest entries — no effect needed to "reset" it on reopen.
function EducationFields({
  onClose,
  onSaved,
  userId,
  entries,
}: EducationFieldsProps) {
  const [drafts, setDrafts] = useState<EducationDraft[]>(() => toDrafts(entries));
  const [isSaving, setIsSaving] = useState(false);

  function updateDraft<K extends keyof EducationDraft>(
    id: string,
    key: K,
    value: EducationDraft[K]
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
              education_histories: savable.map((draft) => ({
                id: draft.id,
                degree: draft.degree,
                major: draft.major,
                start_year: Number(draft.startYear),
                end_year: draft.endYear ? Number(draft.endYear) : undefined,
              })),
            }
          : {}),
      });

      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal menyimpan perubahan.");
        return;
      }

      const skipped = drafts.length - savable.length;
      toast.success("Riwayat pendidikan berhasil diperbarui.");
      if (skipped > 0) {
        toast.info(
          `${skipped} entri baru/dihapus belum tersimpan — backend belum mendukung penambahan atau penghapusan riwayat pendidikan.`
        );
      }
      onSaved();
    } catch (err) {
      console.error("[EditEducationForm] updateUser threw:", err);
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

          {draft.isNew ? (
            <Input
              inputId={`edu-institution-${index}`}
              label="Universitas"
              placeholder="Nama universitas"
              value={draft.institutionName}
              disabled={draft.removed}
              onChange={(e) =>
                updateDraft(draft.id, "institutionName", e.target.value)
              }
            />
          ) : (
            <p className="text-sm font-semibold text-[#172033]">
              {draft.institutionName}
            </p>
          )}

          <Input
            inputId={`edu-major-${index}`}
            label="Jurusan"
            value={draft.major}
            disabled={draft.removed}
            onChange={(e) => updateDraft(draft.id, "major", e.target.value)}
          />
          <Select
            selectId={`edu-degree-${index}`}
            label="Jenjang Pendidikan"
            placeholder="Pilih jenjang"
            value={draft.degree}
            disabled={draft.removed}
            onChange={(value) => updateDraft(draft.id, "degree", value as Degree)}
            options={DEGREE_OPTIONS}
          />
          <div className="grid grid-cols-2 gap-4">
            <NumberInput
              inputId={`edu-start-${index}`}
              label="Tahun Masuk"
              value={draft.startYear}
              disabled={draft.removed}
              onValueChange={(value) => updateDraft(draft.id, "startYear", value)}
            />
            <NumberInput
              inputId={`edu-end-${index}`}
              label="Tahun Lulus"
              value={draft.endYear}
              disabled={draft.removed}
              onValueChange={(value) => updateDraft(draft.id, "endYear", value)}
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
        Tambah Pendidikan
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
