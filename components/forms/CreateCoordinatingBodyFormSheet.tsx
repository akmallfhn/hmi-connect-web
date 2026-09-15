"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createCoordinatingBody } from "@/lib/actions";
import { stripEntityNamePrefix } from "@/lib/feed-author";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import Sheet from "../modals/Sheet";
import CoordinatingBodyLogoField from "./CoordinatingBodyLogoField";

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
  const [imageUrl, setImageUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit() {
    const sanitizedName = stripEntityNamePrefix("coordinating_body", name);
    if (!sanitizedName) {
      toast.error("Nama Badko wajib diisi.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await createCoordinatingBody({
        name: sanitizedName,
        image_url: imageUrl,
        status: "active",
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
