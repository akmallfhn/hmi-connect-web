"use client";

import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Institution } from "@/apis/institutions";
import type { EducationHistoryEntry } from "@/apis/users";
import {
  createEducationHistory,
  createInstitution,
  deleteEducationHistory,
  updateEducationHistory,
} from "@/lib/actions";
import { DEGREE_OPTIONS } from "@/lib/education";
import { isSuccessStatus, type Degree } from "@/lib/types";
import Button from "../buttons/Button";
import CreateableSelect, {
  type SearchableOption,
} from "../fields/CreateableSelect";
import Input from "../fields/Input";
import NumberInput from "../fields/NumberInput";
import Select from "../fields/Select";
import Modal from "../modals/Modal";

type EducationDraft = {
  id: string;
  institutionName: string;
  institution: SearchableOption | null;
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
    institution: null,
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
    institution: null,
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
  institutions: Institution[];
}

export default function EditEducationForm({
  open,
  onClose,
  onSaved,
  userId,
  entries,
  institutions,
}: EditEducationFormProps) {
  return (
    <Modal open={open} onClose={onClose} title="Edit Pendidikan">
      {open && (
        <EducationFields
          onClose={onClose}
          onSaved={onSaved}
          userId={userId}
          entries={entries}
          institutions={institutions}
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
  institutions: Institution[];
}

async function loadInstitutionOptions(inputValue: string, page: number) {
  const params = new URLSearchParams({ page: String(page) });
  if (inputValue) params.set("q", inputValue);

  const response = await fetch(`/api/institutions/search?${params}`);
  const json = await response.json();
  const results: Institution[] = json.data ?? [];

  return {
    options: results.map((item) => ({
      label: item.name,
      value: item.id,
      image: item.image_url,
    })),
    hasMore: Boolean(json.hasMore),
  };
}

async function createInstitutionOption(
  name: string
): Promise<SearchableOption | null> {
  const created = await createInstitution(name);
  if (!created) return null;
  return { label: created.name, value: created.id, image: created.image_url };
}

// Mounted only while open, so drafts always seed fresh from entries — no reset effect needed.
function EducationFields({
  onClose,
  onSaved,
  userId,
  entries,
  institutions,
}: EducationFieldsProps) {
  const [drafts, setDrafts] = useState<EducationDraft[]>(() => toDrafts(entries));
  const [isSaving, setIsSaving] = useState(false);

  const institutionOptions: SearchableOption[] = institutions.map((item) => ({
    label: item.name,
    value: item.id,
    image: item.image_url,
  }));

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

    const newDrafts = drafts.filter((draft) => draft.isNew && !draft.removed);
    const missingInstitution = newDrafts.find((draft) => !draft.institution);
    const missingStartYear = newDrafts.find((draft) => !draft.startYear.trim());
    if (missingInstitution || missingStartYear) {
      toast.error("Lengkapi universitas dan tahun masuk untuk entri baru.");
      return;
    }

    setIsSaving(true);
    try {
      const results = await Promise.all(
        drafts.map((draft) => {
          if (draft.isNew) {
            if (draft.removed) return null;
            return createEducationHistory({
              institution_id: Number(draft.institution!.value),
              degree: draft.degree,
              major: draft.major,
              start_year: Number(draft.startYear),
              end_year: draft.endYear ? Number(draft.endYear) : undefined,
            });
          }
          if (draft.removed) {
            return deleteEducationHistory(draft.id);
          }
          return updateEducationHistory({
            id: draft.id,
            degree: draft.degree,
            major: draft.major,
            start_year: Number(draft.startYear),
            end_year: draft.endYear ? Number(draft.endYear) : undefined,
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

      toast.success("Riwayat pendidikan berhasil diperbarui.");
      onSaved();
    } catch (err) {
      console.error("[EditEducationForm] history mutation threw:", err);
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

          {draft.isNew ? (
            <CreateableSelect
              selectId={`edu-institution-${index}`}
              label="Universitas"
              placeholder="Cari universitas..."
              value={draft.institution}
              onChange={(option) => updateDraft(draft.id, "institution", option)}
              loadOptions={loadInstitutionOptions}
              defaultOptions={institutionOptions}
              onCreateOption={createInstitutionOption}
              createLabel={(input) => `Tambah universitas "${input}"`}
              debounceMs={400}
              disabled={draft.removed}
              required
            />
          ) : (
            <p className="text-sm font-semibold text-[#172033]">
              {draft.institutionName}
            </p>
          )}

          <Input
            inputId={`edu-major-${index}`}
            label="Jurusan"
            placeholder="Contoh: Teknik Informatika"
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
              placeholder="2020"
              value={draft.startYear}
              disabled={draft.removed}
              onValueChange={(value) => updateDraft(draft.id, "startYear", value)}
            />
            <NumberInput
              inputId={`edu-end-${index}`}
              label="Tahun Lulus"
              placeholder="2024"
              value={draft.endYear}
              disabled={draft.removed}
              onValueChange={(value) => updateDraft(draft.id, "endYear", value)}
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
        Tambah Pendidikan
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
