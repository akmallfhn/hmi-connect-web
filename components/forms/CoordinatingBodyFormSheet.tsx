"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { CoordinatingBodyListEntry } from "@/apis/coordinating-bodies";
import { createCoordinatingBody, updateCoordinatingBody } from "@/lib/actions";
import { isSuccessStatus, type StatusEnum } from "@/lib/types";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import Select from "../fields/Select";
import Sheet from "../modals/Sheet";

const STATUS_OPTIONS: { label: string; value: StatusEnum }[] = [
  { label: "Aktif", value: "active" },
  { label: "Tidak Aktif", value: "inactive" },
];

interface CoordinatingBodyFormSheetProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  coordinatingBody: CoordinatingBodyListEntry | null;
}

export default function CoordinatingBodyFormSheet({
  open,
  onClose,
  onSaved,
  coordinatingBody,
}: CoordinatingBodyFormSheetProps) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={coordinatingBody ? "Edit Badko" : "Tambah Badko"}
      description={
        coordinatingBody
          ? "Perbarui data Badko ini."
          : "Buat Badan Koordinasi (Badko) HMI baru."
      }
    >
      {open && (
        <CoordinatingBodyFields
          coordinatingBody={coordinatingBody}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </Sheet>
  );
}

// Mounted only while open, so state always seeds fresh from the row — no reset effect needed.
function CoordinatingBodyFields({
  coordinatingBody,
  onClose,
  onSaved,
}: {
  coordinatingBody: CoordinatingBodyListEntry | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(coordinatingBody?.name ?? "");
  const [status, setStatus] = useState<StatusEnum>(coordinatingBody?.status ?? "active");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error("Nama Badko wajib diisi.");
      return;
    }

    setIsSaving(true);
    try {
      const result = coordinatingBody
        ? await updateCoordinatingBody({ id: coordinatingBody.id, name, status })
        : await createCoordinatingBody({ name, status });

      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal menyimpan Badko.");
        return;
      }

      toast.success(
        coordinatingBody ? "Badko berhasil diperbarui." : "Badko berhasil dibuat."
      );
      onSaved();
    } catch (err) {
      console.error("[CoordinatingBodyFormSheet] save threw:", err);
      toast.error("Gagal menyimpan Badko.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        inputId="coordinating-body-name"
        label="Nama Badko"
        placeholder="Contoh: BADKO Sumatera Bagian Utara"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Select
        selectId="coordinating-body-status"
        label="Status"
        placeholder="Pilih status"
        value={status}
        onChange={(value) => setStatus(value as StatusEnum)}
        options={STATUS_OPTIONS}
        required
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
