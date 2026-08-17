"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  CoordinatingBodyDetail,
  CoordinatingBodyListEntry,
} from "@/apis/coordinating-bodies";
import { getCoordinatingBodyDetail, updateCoordinatingBody } from "@/lib/actions";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import TextArea from "../fields/TextArea";
import Sheet from "../modals/Sheet";
import CoordinatingBodyLogoField from "./CoordinatingBodyLogoField";

interface EditCoordinatingBodyFormSheetProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  coordinatingBody: CoordinatingBodyListEntry | null;
}

export default function EditCoordinatingBodyFormSheet({
  open,
  onClose,
  onSaved,
  coordinatingBody,
}: EditCoordinatingBodyFormSheetProps) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Edit Badko"
      description="Perbarui data Badko ini."
    >
      {open && coordinatingBody && (
        <EditCoordinatingBodyLoader
          coordinatingBody={coordinatingBody}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </Sheet>
  );
}

// The list row has no description (coordinating-bodies/list doesn't return it) — fetch the real detail before mounting the fields so edit never seeds a stale/empty description.
function EditCoordinatingBodyLoader({
  coordinatingBody,
  onClose,
  onSaved,
}: {
  coordinatingBody: CoordinatingBodyListEntry;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [detail, setDetail] = useState<CoordinatingBodyDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getCoordinatingBodyDetail(coordinatingBody.id)
      .then((result) => {
        if (cancelled) return;
        if (!result) toast.error("Gagal memuat detail Badko.");
        setDetail(result);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [coordinatingBody.id]);

  if (loading) {
    return (
      <p className="py-6 text-center text-sm text-[#5f6573]">
        Memuat data Badko...
      </p>
    );
  }

  return (
    <EditCoordinatingBodyFields
      id={coordinatingBody.id}
      initialName={detail?.name ?? coordinatingBody.name}
      initialDescription={detail?.description ?? null}
      initialImageUrl={detail?.image_url ?? coordinatingBody.image_url}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}

// Mounted only while open, so state always seeds fresh from the row — no reset effect needed.
function EditCoordinatingBodyFields({
  id,
  initialName,
  initialDescription,
  initialImageUrl,
  onClose,
  onSaved,
}: {
  id: string;
  initialName: string;
  initialDescription: string | null;
  initialImageUrl: string | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [imageUrl, setImageUrl] = useState(initialImageUrl ?? "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error("Nama Badko wajib diisi.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateCoordinatingBody({
        id,
        name,
        description,
        image_url: imageUrl,
      });

      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal memperbarui Badko.");
        return;
      }

      toast.success("Badko berhasil diperbarui.");
      onSaved();
    } catch (err) {
      console.error("[EditCoordinatingBodyFormSheet] save threw:", err);
      toast.error("Gagal memperbarui Badko.");
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
