"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  SpecialBodyAdminEntry,
  SpecialBodyDetail,
} from "@/apis/special-bodies";
import { getSpecialBodyDetail, updateSpecialBody } from "@/lib/actions";
import {
  SPECIAL_BODY_LABEL,
  formatSpecialBodyName,
  stripSpecialBodyName,
} from "@/lib/special-body";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import TextArea from "../fields/TextArea";
import Sheet from "../modals/Sheet";
import SpecialBodyLogoField, {
  type SpecialBodyLogoValue,
} from "./SpecialBodyLogoField";

interface EditSpecialBodyFormSheetProps {
  open: boolean;
  specialBody: SpecialBodyAdminEntry | null;
  parentLabel: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditSpecialBodyFormSheet({
  open,
  specialBody,
  parentLabel,
  onClose,
  onSaved,
}: EditSpecialBodyFormSheetProps) {
  const label = specialBody ? SPECIAL_BODY_LABEL[specialBody.type] : "";
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={`Edit ${label}`}
      description={`Perbarui profil ${label} ini.`}
    >
      {open && specialBody && (
        <EditSpecialBodyLoader
          specialBody={specialBody}
          parentLabel={parentLabel}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </Sheet>
  );
}

// The list row has no description, so the real detail is fetched before the fields mount.
function EditSpecialBodyLoader({
  specialBody,
  parentLabel,
  onClose,
  onSaved,
}: {
  specialBody: SpecialBodyAdminEntry;
  parentLabel: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [detail, setDetail] = useState<SpecialBodyDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getSpecialBodyDetail(specialBody.id)
      .then((result) => {
        if (cancelled) return;
        if (!result) toast.error("Gagal memuat detail lembaga.");
        setDetail(result);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [specialBody.id]);

  if (loading) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Memuat data lembaga...
      </p>
    );
  }

  if (!detail) return null;
  return (
    <EditSpecialBodyFields
      specialBody={detail}
      parentLabel={parentLabel}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}

function EditSpecialBodyFields({
  specialBody,
  parentLabel,
  onClose,
  onSaved,
}: {
  specialBody: SpecialBodyDetail;
  parentLabel: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const label = SPECIAL_BODY_LABEL[specialBody.type];
  const [name, setName] = useState(
    stripSpecialBodyName(specialBody.parent_entity_type, specialBody.name),
  );
  const [description, setDescription] = useState(
    specialBody.description ?? "",
  );
  const [logo, setLogo] = useState<SpecialBodyLogoValue>({
    mediaId: specialBody.image_media_id ?? "",
    imageUrl: specialBody.image_url ?? "",
  });
  const [logoChanged, setLogoChanged] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit() {
    const trimmedName = stripSpecialBodyName(
      specialBody.parent_entity_type,
      name,
    );
    if (!trimmedName) {
      toast.error(`Nama ${label} wajib diisi.`);
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateSpecialBody({
        id: specialBody.id,
        name: trimmedName,
        description: description.trim(),
        ...(logoChanged ? { image_media_id: logo.mediaId } : {}),
      });
      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? `Gagal memperbarui ${label}.`);
        return;
      }
      toast.success(`${label} berhasil diperbarui.`);
      onSaved();
    } catch (error) {
      console.error("[EditSpecialBodyFormSheet] save threw:", error);
      toast.error(`Gagal memperbarui ${label}. Coba lagi.`);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <SpecialBodyLogoField
        type={specialBody.type}
        label={`Logo ${label}`}
        imageUrl={logo.imageUrl}
        onChange={(value) => {
          setLogo(value);
          setLogoChanged(true);
        }}
        onUploadingChange={setIsUploadingImage}
        disabled={isSaving}
      />

      <div className="flex flex-col gap-1">
        <p className="pl-1 text-[15px] font-medium text-heading">
          Dinaungi Oleh
        </p>
        <p className="rounded-lg border border-border bg-surface-muted px-3 py-2.5 text-sm text-heading">
          {parentLabel}
        </p>
        <p className="pl-1 text-xs text-muted-foreground">
          Penaung tidak bisa diubah setelah dibuat.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <Input
          inputId="special-body-name"
          label={`Nama ${label}`}
          placeholder="Contoh: Samarinda"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        {name.trim() && (
          <p className="pl-1 text-xs text-muted-foreground">
            Tampil sebagai{" "}
            <span className="font-medium text-heading">
              {formatSpecialBodyName(
                specialBody.type,
                specialBody.parent_entity_type,
                name,
              )}
            </span>
          </p>
        )}
      </div>

      <TextArea
        textAreaId="special-body-description"
        label="Deskripsi"
        placeholder={`Ceritakan singkat tentang ${label} ini.`}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        rows={4}
      />

      <div className="mt-2 flex justify-end gap-3 border-t border-border pt-4">
        <Button variant="outline" onClick={onClose} disabled={isSaving}>
          Batal
        </Button>
        <Button
          variant="primary"
          onClick={() => void handleSubmit()}
          disabled={isSaving || isUploadingImage}
        >
          {isSaving ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </div>
  );
}
