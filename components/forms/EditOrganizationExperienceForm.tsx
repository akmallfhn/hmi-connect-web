"use client";

import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { OrganizationExperienceEntry } from "@/apis/users";
import {
  createOrganizationExperience,
  deleteOrganizationExperience,
  updateOrganizationExperience,
} from "@/lib/actions";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import NumberInput from "../fields/NumberInput";
import TextArea from "../fields/TextArea";
import Modal from "../modals/Modal";

type OrganizationExperienceDraft = {
  id: string;
  organizationName: string;
  positionTitle: string;
  startYear: string;
  endYear: string;
  description: string;
  isNew: boolean;
  removed: boolean;
};

function toDrafts(
  entries: OrganizationExperienceEntry[]
): OrganizationExperienceDraft[] {
  return entries.map((entry) => ({
    id: entry.id,
    organizationName: entry.organization_name,
    positionTitle: entry.position_title,
    startYear: String(entry.start_year),
    endYear: entry.end_year ? String(entry.end_year) : "",
    description: entry.description ?? "",
    isNew: false,
    removed: false,
  }));
}

function emptyDraft(): OrganizationExperienceDraft {
  return {
    id: `new-${crypto.randomUUID()}`,
    organizationName: "",
    positionTitle: "",
    startYear: "",
    endYear: "",
    description: "",
    isNew: true,
    removed: false,
  };
}

interface EditOrganizationExperienceFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  userId?: string;
  entries: OrganizationExperienceEntry[];
}

export default function EditOrganizationExperienceForm({
  open,
  onClose,
  onSaved,
  userId,
  entries,
}: EditOrganizationExperienceFormProps) {
  return (
    <Modal open={open} onClose={onClose} title="Edit Pengalaman Organisasi">
      {open && (
        <OrganizationExperienceFields
          onClose={onClose}
          onSaved={onSaved}
          userId={userId}
          entries={entries}
        />
      )}
    </Modal>
  );
}

interface OrganizationExperienceFieldsProps {
  onClose: () => void;
  onSaved: () => void;
  userId?: string;
  entries: OrganizationExperienceEntry[];
}

// Mounted only while open, so drafts always seed fresh from entries — no reset effect needed.
function OrganizationExperienceFields({
  onClose,
  onSaved,
  userId,
  entries,
}: OrganizationExperienceFieldsProps) {
  const [drafts, setDrafts] = useState<OrganizationExperienceDraft[]>(() =>
    toDrafts(entries)
  );
  const [isSaving, setIsSaving] = useState(false);

  function updateDraft<K extends keyof OrganizationExperienceDraft>(
    id: string,
    key: K,
    value: OrganizationExperienceDraft[K]
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
        !draft.organizationName.trim() ||
        !draft.positionTitle.trim() ||
        !draft.startYear.trim()
    );
    if (incompleteDraft) {
      toast.error("Lengkapi organisasi, jabatan, dan tahun mulai.");
      return;
    }

    setIsSaving(true);
    try {
      const results = await Promise.all(
        drafts.map((draft) => {
          if (draft.isNew) {
            if (draft.removed) return null;
            return createOrganizationExperience({
              organization_name: draft.organizationName,
              position_title: draft.positionTitle,
              start_year: Number(draft.startYear),
              end_year: draft.endYear ? Number(draft.endYear) : undefined,
              description: draft.description,
            });
          }
          if (draft.removed) {
            return deleteOrganizationExperience(draft.id);
          }
          return updateOrganizationExperience({
            id: draft.id,
            organization_name: draft.organizationName,
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

      toast.success("Pengalaman organisasi berhasil diperbarui.");
      onSaved();
    } catch (err) {
      console.error("[EditOrganizationExperienceForm] mutation threw:", err);
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
            inputId={`org-name-${index}`}
            label="Organisasi"
            placeholder="Contoh: HMI Cabang Banda Aceh"
            value={draft.organizationName}
            disabled={draft.removed}
            onChange={(e) =>
              updateDraft(draft.id, "organizationName", e.target.value)
            }
            required
          />
          <Input
            inputId={`org-position-${index}`}
            label="Jabatan"
            placeholder="Contoh: Ketua Bidang PTKP"
            value={draft.positionTitle}
            disabled={draft.removed}
            onChange={(e) =>
              updateDraft(draft.id, "positionTitle", e.target.value)
            }
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <NumberInput
              inputId={`org-start-${index}`}
              label="Tahun Mulai"
              placeholder="2020"
              value={draft.startYear}
              disabled={draft.removed}
              onValueChange={(value) => updateDraft(draft.id, "startYear", value)}
              required
            />
            <NumberInput
              inputId={`org-end-${index}`}
              label="Tahun Selesai"
              placeholder="2023"
              value={draft.endYear}
              disabled={draft.removed}
              onValueChange={(value) => updateDraft(draft.id, "endYear", value)}
            />
          </div>
          <TextArea
            textAreaId={`org-description-${index}`}
            label="Deskripsi"
            placeholder="Ceritakan peran atau program yang pernah kamu jalankan"
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
        Tambah Pengalaman Organisasi
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
