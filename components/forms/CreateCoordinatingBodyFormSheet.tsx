"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createCoordinatingBody } from "@/lib/actions";
import { stripEntityNamePrefix } from "@/lib/feed-author";
import { isSuccessStatus } from "@/lib/types";
import { mentionNameSubmitError, useMentionNameField } from "@/hooks/useMentionNameField";
import EntityNamePreview from "../fields/EntityNamePreview";
import MentionNameInput from "../fields/MentionNameInput";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import Sheet from "../modals/Sheet";
import CoordinatingBodyLogoField from "./CoordinatingBodyLogoField";
import type { EntityLogoValue } from "@/lib/media-upload";

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
  const mention = useMentionNameField({ entityType: "coordinating_body" });
  const [logo, setLogo] = useState<EntityLogoValue | null>(null);
  const imageUrl = logo ? logo.imageUrl : "";
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit() {
    const sanitizedName = stripEntityNamePrefix("coordinating_body", name);
    if (!sanitizedName) {
      toast.error("Nama Badko wajib diisi.");
      return;
    }
    const mentionError = mentionNameSubmitError(mention.status);
    if (mentionError) {
      toast.error(mentionError);
      return;
    }

    setIsSaving(true);
    try {
      const result = await createCoordinatingBody({
        name: sanitizedName,
        mention_name: mention.mentionName,
        ...(logo ? { image_media_id: logo.mediaId } : {}),
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
        onChange={setLogo}
        onUploadingChange={setIsUploadingImage}
        disabled={isSaving}
      />

      <div className="flex flex-col gap-1">
        <Input
          inputId="coordinating-body-name"
          label="Nama Badko"
          placeholder="Contoh: Sumatera Bagian Utara"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <EntityNamePreview entityType="coordinating_body" name={name} />
      </div>

      <MentionNameInput
        inputId="coordinating-body-mention-name"
        field={mention}
        placeholder="Contoh: HMIBadkoJabodetabekaBanten"
        disabled={isSaving}
      />


      <div className="mt-2 flex justify-end gap-3 border-t border-border pt-4">
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
