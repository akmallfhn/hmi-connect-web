"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createCoordinatingBody } from "@/lib/actions";
import { isSuccessStatus, type StatusEnum } from "@/lib/types";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import Select from "../fields/Select";
import TextArea from "../fields/TextArea";
import Sheet from "../modals/Sheet";
import CoordinatingBodyLogoField from "./CoordinatingBodyLogoField";

const STATUS_OPTIONS: { label: string; value: StatusEnum }[] = [
  { label: "Aktif", value: "active" },
  { label: "Tidak Aktif", value: "inactive" },
];

interface CreateCoordinatingBodyFormSheetProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function CreateCoordinatingBodyFormSheet({
  open,
  onClose,
  onSaved,
}: CreateCoordinatingBodyFormSheetProps) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Tambah Badko"
      description="Buat Badan Koordinasi (Badko) HMI baru."
    >
      {open && (
        <CreateCoordinatingBodyFields onClose={onClose} onSaved={onSaved} />
      )}
    </Sheet>
  );
}

// Mounted only while open, so state always starts fresh — no reset effect needed.
function CreateCoordinatingBodyFields({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [status, setStatus] = useState<StatusEnum>("active");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error("Nama Badko wajib diisi.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await createCoordinatingBody({
        name,
        description,
        image_url: imageUrl,
        status,
      });

      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal membuat Badko.");
        return;
      }

      toast.success("Badko berhasil dibuat.");
      onSaved();
    } catch (err) {
      console.error("[CreateCoordinatingBodyFormSheet] save threw:", err);
      toast.error("Gagal membuat Badko.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <CoordinatingBodyLogoField
        imageUrl={imageUrl}
        onChange={setImageUrl}
        onUploadingChange={setIsUploadingImage}
        disabled={isSaving}
      />

      <Input
        inputId="coordinating-body-name"
        label="Nama Badko"
        placeholder="Contoh: Sumatera Bagian Utara"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <TextArea
        textAreaId="coordinating-body-description"
        label="Deskripsi"
        placeholder="Ceritakan sekilas tentang Badko ini"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={6}
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
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isSaving || isUploadingImage}
        >
          {isSaving ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </div>
  );
}
