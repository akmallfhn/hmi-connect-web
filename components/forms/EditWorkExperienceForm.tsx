"use client";

import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { WorkExperienceEntry } from "@/apis/users";
import {
  createWorkExperience,
  deleteWorkExperience,
  updateWorkExperience,
} from "@/lib/actions";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import NumberInput from "../fields/NumberInput";
import TextArea from "../fields/TextArea";
import Modal from "../modals/Modal";

type WorkExperienceDraft = {
  id: string;
  companyName: string;
  positionTitle: string;
  startYear: string;
  endYear: string;
  description: string;
  isNew: boolean;
  removed: boolean;
};

function toDrafts(entries: WorkExperienceEntry[]): WorkExperienceDraft[] {
  return entries.map((entry) => ({
    id: entry.id,
    companyName: entry.company_name,
    positionTitle: entry.position_title,
    startYear: String(entry.start_year),
    endYear: entry.end_year ? String(entry.end_year) : "",
    description: entry.description ?? "",
    isNew: false,
    removed: false,
  }));
}

function emptyDraft(): WorkExperienceDraft {
  return {
    id: `new-${crypto.randomUUID()}`,
    companyName: "",
    positionTitle: "",
    startYear: "",
    endYear: "",
    description: "",
    isNew: true,
    removed: false,
  };
}

interface EditWorkExperienceFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  userId?: string;
  entries: WorkExperienceEntry[];
}

export default function EditWorkExperienceForm({
  open,
  onClose,
  onSaved,
  userId,
  entries,
}: EditWorkExperienceFormProps) {
  return (
    <Modal open={open} onClose={onClose} title="Edit Pengalaman Kerja">
      {open && (
        <WorkExperienceFields
          onClose={onClose}
          onSaved={onSaved}
          userId={userId}
          entries={entries}
        />
      )}
    </Modal>
  );
}

interface WorkExperienceFieldsProps {
  onClose: () => void;
  onSaved: () => void;
  userId?: string;
  entries: WorkExperienceEntry[];
}

// Mounted only while open, so drafts always seed fresh from entries — no reset effect needed.
function WorkExperienceFields({
  onClose,
  onSaved,
  userId,
  entries,
}: WorkExperienceFieldsProps) {
  const [drafts, setDrafts] = useState<WorkExperienceDraft[]>(() => toDrafts(entries));
  const [isSaving, setIsSaving] = useState(false);

  function updateDraft<K extends keyof WorkExperienceDraft>(
    id: string,
    key: K,
    value: WorkExperienceDraft[K]
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

    const activeDrafts = drafts.filter((draft) => !draft.removed);
    const incompleteDraft = activeDrafts.find(
      (draft) =>
        !draft.companyName.trim() ||
        !draft.positionTitle.trim() ||
        !draft.startYear.trim()
    );
    if (incompleteDraft) {
      toast.error("Lengkapi perusahaan, jabatan, dan tahun mulai.");
      return;
    }

    setIsSaving(true);
    try {
      const results = await Promise.all(
        drafts.map((draft) => {
          if (draft.isNew) {
            if (draft.removed) return null;
            return createWorkExperience({
              company_name: draft.companyName,
              position_title: draft.positionTitle,
              start_year: Number(draft.startYear),
              end_year: draft.endYear ? Number(draft.endYear) : undefined,
              description: draft.description,
            });
          }
          if (draft.removed) {
            return deleteWorkExperience(draft.id);
          }
          return updateWorkExperience({
            id: draft.id,
            company_name: draft.companyName,
            position_title: draft.positionTitle,
            start_year: Number(draft.startYear),
            end_year: draft.endYear ? Number(draft.endYear) : undefined,
            description: draft.description,
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

      toast.success("Pengalaman kerja berhasil diperbarui.");
      onSaved();
    } catch (err) {
      console.error("[EditWorkExperienceForm] mutation threw:", err);
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

          <Input
            inputId={`work-company-${index}`}
            label="Perusahaan"
            placeholder="Contoh: PT HMI Digital Indonesia"
            value={draft.companyName}
            disabled={draft.removed}
            onChange={(e) => updateDraft(draft.id, "companyName", e.target.value)}
            required
          />
          <Input
            inputId={`work-position-${index}`}
            label="Jabatan"
            placeholder="Contoh: Software Engineer"
            value={draft.positionTitle}
            disabled={draft.removed}
            onChange={(e) => updateDraft(draft.id, "positionTitle", e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <NumberInput
              inputId={`work-start-${index}`}
              label="Tahun Mulai"
              placeholder="2021"
              value={draft.startYear}
              disabled={draft.removed}
              onValueChange={(value) => updateDraft(draft.id, "startYear", value)}
              required
            />
            <NumberInput
              inputId={`work-end-${index}`}
              label="Tahun Selesai"
              placeholder="2023"
              value={draft.endYear}
              disabled={draft.removed}
              onValueChange={(value) => updateDraft(draft.id, "endYear", value)}
            />
          </div>
          <TextArea
            textAreaId={`work-description-${index}`}
            label="Deskripsi"
            placeholder="Ceritakan tanggung jawab atau pencapaian di posisi ini"
            value={draft.description}
            disabled={draft.removed}
            onChange={(e) => updateDraft(draft.id, "description", e.target.value)}
            rows={3}
            characterLength={240}
          />

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
        Tambah Pengalaman Kerja
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
