"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { OrganizationDetail } from "@/apis/organizations";
import { updateOrganization } from "@/lib/actions";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import Sheet from "../modals/Sheet";
import OrganizationLogoField from "./OrganizationLogoField";

interface EditOrganizationFormSheetProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  organization: OrganizationDetail;
}

export default function EditOrganizationFormSheet({
  open,
  onClose,
  onSaved,
  organization,
}: EditOrganizationFormSheetProps) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Pengaturan Organisasi"
      description="Perbarui profil organisasi ini."
    >
      {open && (
        <EditOrganizationFields
          organization={organization}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </Sheet>
  );
}

// Mounted only while open, so state always seeds fresh from the organization — no reset effect needed.
function EditOrganizationFields({
  organization,
  onClose,
  onSaved,
}: {
  organization: OrganizationDetail;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(organization.name);
  const [slug, setSlug] = useState(organization.slug);
  const [logoUrl, setLogoUrl] = useState(organization.logo_url ?? "");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error("Nama organisasi wajib diisi.");
      return;
    }
    if (!slug.trim()) {
      toast.error("Slug organisasi wajib diisi.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateOrganization({
        id: organization.id,
        name,
        slug,
        logo_url: logoUrl,
      });

      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal memperbarui organisasi.");
        return;
      }

      toast.success("Profil organisasi berhasil diperbarui.");
      onSaved();
    } catch (err) {
      console.error("[EditOrganizationFormSheet] save threw:", err);
      toast.error("Gagal memperbarui organisasi.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <OrganizationLogoField
        imageUrl={logoUrl}
        onChange={setLogoUrl}
        onUploadingChange={setIsUploadingLogo}
        disabled={isSaving}
      />

      <Input
        inputId="organization-name"
        label="Nama Organisasi"
        placeholder="Contoh: Himpunan Mahasiswa Islam"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <div className="flex flex-col gap-1">
        <Input
          inputId="organization-slug"
          label="Slug"
          placeholder="Contoh: hmi"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
        />
        <p className="pl-1 text-xs text-[#5f6573]">
          Pengenal unik organisasi. Ubah hanya jika benar-benar perlu.
        </p>
      </div>

      <div className="mt-2 flex justify-end gap-3 border-t border-[#e6e9ef] pt-4">
        <Button variant="outline" onClick={onClose} disabled={isSaving}>
          Batal
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isSaving || isUploadingLogo}
        >
          {isSaving ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </div>
  );
}
