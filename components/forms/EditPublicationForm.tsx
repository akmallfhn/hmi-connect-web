"use client";

import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { PublicationEntry } from "@/apis/users";
import { createPublication, deletePublication, updatePublication } from "@/lib/actions";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import NumberInput from "../fields/NumberInput";
import TextArea from "../fields/TextArea";
import Modal from "../modals/Modal";

type PublicationDraft = {
  id: string;
  title: string;
  publisher: string;
  year: string;
  url: string;
  description: string;
  isNew: boolean;
  removed: boolean;
};

function toDrafts(entries: PublicationEntry[]): PublicationDraft[] {
  return entries.map((entry) => ({
    id: entry.id,
    title: entry.title,
    publisher: entry.publisher,
    year: String(entry.year),
    url: entry.url ?? "",
    description: entry.description ?? "",
    isNew: false,
    removed: false,
  }));
}

function emptyDraft(): PublicationDraft {
  return {
    id: `new-${crypto.randomUUID()}`,
    title: "",
    publisher: "",
    year: "",
    url: "",
    description: "",
    isNew: true,
    removed: false,
  };
}

interface EditPublicationFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  userId?: string;
  entries: PublicationEntry[];
}

export default function EditPublicationForm({
  open,
  onClose,
  onSaved,
  userId,
  entries,
}: EditPublicationFormProps) {
  return (
    <Modal open={open} onClose={onClose} title="Edit Publikasi">
      {open && (
        <PublicationFields
          onClose={onClose}
          onSaved={onSaved}
          userId={userId}
          entries={entries}
        />
      )}
    </Modal>
  );
}

interface PublicationFieldsProps {
  onClose: () => void;
  onSaved: () => void;
  userId?: string;
  entries: PublicationEntry[];
}

// Mounted only while open, so drafts always seed fresh from entries — no reset effect needed.
function PublicationFields({ onClose, onSaved, userId, entries }: PublicationFieldsProps) {
  const [drafts, setDrafts] = useState<PublicationDraft[]>(() => toDrafts(entries));
  const [isSaving, setIsSaving] = useState(false);

  function updateDraft<K extends keyof PublicationDraft>(
    id: string,
    key: K,
    value: PublicationDraft[K]
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
      (draft) => !draft.title.trim() || !draft.publisher.trim() || !draft.year.trim()
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
            return createPublication({
              title: draft.title,
              publisher: draft.publisher,
              year: Number(draft.year),
              url: draft.url,
              description: draft.description,
            });
          }
          if (draft.removed) {
            return deletePublication(draft.id);
          }
          return updatePublication({
            id: draft.id,
            title: draft.title,
            publisher: draft.publisher,
            year: Number(draft.year),
            url: draft.url,
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

      toast.success("Publikasi berhasil diperbarui.");
      onSaved();
    } catch (err) {
      console.error("[EditPublicationForm] mutation threw:", err);
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
            inputId={`publication-title-${index}`}
            label="Judul"
            placeholder="Contoh: Strategi Kaderisasi di Era Digital"
            value={draft.title}
            disabled={draft.removed}
            onChange={(e) => updateDraft(draft.id, "title", e.target.value)}
            required
          />
          <Input
            inputId={`publication-publisher-${index}`}
            label="Penerbit"
            placeholder="Contoh: Jurnal Kepemimpinan HMI"
            value={draft.publisher}
            disabled={draft.removed}
            onChange={(e) => updateDraft(draft.id, "publisher", e.target.value)}
            required
          />
          <NumberInput
            inputId={`publication-year-${index}`}
            label="Tahun"
            placeholder="2023"
            value={draft.year}
            disabled={draft.removed}
            onValueChange={(value) => updateDraft(draft.id, "year", value)}
            required
          />
          <Input
            inputId={`publication-url-${index}`}
            label="Tautan"
            type="url"
            placeholder="https://example.com/publikasi"
            value={draft.url}
            disabled={draft.removed}
            onChange={(e) => updateDraft(draft.id, "url", e.target.value)}
          />
          <TextArea
            textAreaId={`publication-description-${index}`}
            label="Deskripsi"
            placeholder="Ceritakan konteks publikasi ini"
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
        Tambah Publikasi
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
