"use client";

import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { HonorAwardEntry } from "@/apis/users";
import { createHonorAward, deleteHonorAward, updateHonorAward } from "@/lib/actions";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import NumberInput from "../fields/NumberInput";
import TextArea from "../fields/TextArea";
import Modal from "../modals/Modal";

type HonorAwardDraft = {
  id: string;
  title: string;
  issuer: string;
  year: string;
  description: string;
  isNew: boolean;
  removed: boolean;
};

function toDrafts(entries: HonorAwardEntry[]): HonorAwardDraft[] {
  return entries.map((entry) => ({
    id: entry.id,
    title: entry.title,
    issuer: entry.issuer,
    year: String(entry.year),
    description: entry.description ?? "",
    isNew: false,
    removed: false,
  }));
}

function emptyDraft(): HonorAwardDraft {
  return {
    id: `new-${crypto.randomUUID()}`,
    title: "",
    issuer: "",
    year: "",
    description: "",
    isNew: true,
    removed: false,
  };
}

interface EditHonorAwardFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  userId?: string;
  entries: HonorAwardEntry[];
}

export default function EditHonorAwardForm({
  open,
  onClose,
  onSaved,
  userId,
  entries,
}: EditHonorAwardFormProps) {
  return (
    <Modal open={open} onClose={onClose} title="Edit Honor & Penghargaan">
      {open && (
        <HonorAwardFields
          onClose={onClose}
          onSaved={onSaved}
          userId={userId}
          entries={entries}
        />
      )}
    </Modal>
  );
}

interface HonorAwardFieldsProps {
  onClose: () => void;
  onSaved: () => void;
  userId?: string;
  entries: HonorAwardEntry[];
}

// Mounted only while open, so drafts always seed fresh from entries — no reset effect needed.
function HonorAwardFields({ onClose, onSaved, userId, entries }: HonorAwardFieldsProps) {
  const [drafts, setDrafts] = useState<HonorAwardDraft[]>(() => toDrafts(entries));
  const [isSaving, setIsSaving] = useState(false);

  function updateDraft<K extends keyof HonorAwardDraft>(
    id: string,
    key: K,
    value: HonorAwardDraft[K]
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
      (draft) => !draft.title.trim() || !draft.issuer.trim() || !draft.year.trim()
    );
    if (incompleteDraft) {
      toast.error("Lengkapi judul, penerbit, dan tahun.");
      return;
    }

    setIsSaving(true);
    try {
      const results = await Promise.all(
        drafts.map((draft) => {
          if (draft.isNew) {
            if (draft.removed) return null;
            return createHonorAward({
              title: draft.title,
              issuer: draft.issuer,
              year: Number(draft.year),
              description: draft.description,
            });
          }
          if (draft.removed) {
            return deleteHonorAward(draft.id);
          }
          return updateHonorAward({
            id: draft.id,
            title: draft.title,
            issuer: draft.issuer,
            year: Number(draft.year),
            description: draft.description,
          });
        })
      );

      const attempted = results.filter(Boolean);
      const failed = attempted.filter((result) => !isSuccessStatus(result!.status));

      if (failed.length > 0) {
        toast.error(
          `${failed.length} dari ${attempted.length} perubahan gagal disimpan.`
        );
        return;
      }

      toast.success("Honor & penghargaan berhasil diperbarui.");
      onSaved();
    } catch (err) {
      console.error("[EditHonorAwardForm] mutation threw:", err);
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
            inputId={`honor-award-title-${index}`}
            label="Judul"
            placeholder="Contoh: Kader Teladan"
            value={draft.title}
            disabled={draft.removed}
            onChange={(e) => updateDraft(draft.id, "title", e.target.value)}
            required
          />
          <Input
            inputId={`honor-award-issuer-${index}`}
            label="Penerbit"
            placeholder="Contoh: HMI Cabang Banda Aceh"
            value={draft.issuer}
            disabled={draft.removed}
            onChange={(e) => updateDraft(draft.id, "issuer", e.target.value)}
            required
          />
          <NumberInput
            inputId={`honor-award-year-${index}`}
            label="Tahun"
            placeholder="2023"
            value={draft.year}
            disabled={draft.removed}
            onValueChange={(value) => updateDraft(draft.id, "year", value)}
            required
          />
          <TextArea
            textAreaId={`honor-award-description-${index}`}
            label="Deskripsi"
            placeholder="Ceritakan konteks penghargaan ini"
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
        Tambah Honor & Penghargaan
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
