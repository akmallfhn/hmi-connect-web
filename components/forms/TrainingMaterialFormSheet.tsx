"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { TrainingMaterial } from "@/apis/trainings";
import {
  createTrainingMaterial,
  updateTrainingMaterial,
} from "@/lib/actions";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import Sheet from "../modals/Sheet";

interface TrainingMaterialFormSheetProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  trainingId: string;
  material: TrainingMaterial | null;
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function TrainingMaterialFormSheet({
  open,
  onClose,
  onSaved,
  trainingId,
  material,
}: TrainingMaterialFormSheetProps) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={material ? "Edit Materi" : "Tambah Materi"}
      description="Atur judul dan tautan bahan pembelajaran."
    >
      {open && (
        <MaterialFields
          trainingId={trainingId}
          material={material}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </Sheet>
  );
}

function MaterialFields({
  trainingId,
  material,
  onClose,
  onSaved,
}: Omit<TrainingMaterialFormSheetProps, "open">) {
  const [title, setTitle] = useState(material?.title ?? "");
  const [materialUrl, setMaterialUrl] = useState(material?.material_url ?? "");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit() {
    if (!title.trim()) {
      toast.error("Judul materi wajib diisi.");
      return;
    }
    if (materialUrl.trim() && !isValidHttpUrl(materialUrl.trim())) {
      toast.error("Tautan materi harus berupa URL http atau https yang valid.");
      return;
    }

    setIsSaving(true);
    try {
      const result = material
        ? await updateTrainingMaterial({
            id: material.id,
            title: title.trim(),
            material_url: materialUrl.trim(),
          })
        : await createTrainingMaterial({
            training_id: trainingId,
            title: title.trim(),
            ...(materialUrl.trim()
              ? { material_url: materialUrl.trim() }
              : {}),
          });

      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal menyimpan materi.");
        return;
      }
      toast.success(
        material ? "Materi berhasil diperbarui." : "Materi berhasil ditambahkan."
      );
      onSaved();
    } catch (error) {
      console.error("[TrainingMaterialFormSheet] save threw:", error);
      toast.error("Gagal menyimpan materi.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        inputId="training-material-title"
        label="Judul Materi"
        placeholder="Contoh: Konstitusi HMI"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        required
      />
      <Input
        inputId="training-material-url"
        label="Tautan Materi"
        type="url"
        placeholder="https://example.com/materi.pdf"
        value={materialUrl}
        onChange={(event) => setMaterialUrl(event.target.value)}
      />

      <div className="mt-2 flex justify-end gap-3 border-t border-[#e6e9ef] pt-4">
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
