"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createInstitutionAdmin } from "@/lib/actions";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import type { SearchableOption } from "../fields/SearchableSelect";
import Sheet from "../modals/Sheet";
import InstitutionLocationFields from "./InstitutionLocationFields";
import InstitutionLogoField, {
  type InstitutionLogoValue,
} from "./InstitutionLogoField";

interface CreateInstitutionFormSheetProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function CreateInstitutionFormSheet({
  open,
  onClose,
  onSaved,
}: CreateInstitutionFormSheetProps) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Tambah Institusi"
      description="Tambahkan institusi pendidikan ke daftar pilihan HMI Connect."
    >
      {open && (
        <CreateInstitutionFields onClose={onClose} onSaved={onSaved} />
      )}
    </Sheet>
  );
}

function CreateInstitutionFields({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [alias, setAlias] = useState("");
  const [logo, setLogo] = useState<InstitutionLogoValue>({
    mediaId: "",
    imageUrl: "",
  });
  const [address, setAddress] = useState("");
  const [province, setProvince] = useState<SearchableOption | null>(null);
  const [city, setCity] = useState<SearchableOption | null>(null);
  const [district, setDistrict] = useState<SearchableOption | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit() {
    const normalizedName = name.trim();
    const normalizedAlias = alias.trim();
    if (!normalizedName) {
      toast.error("Nama institusi wajib diisi.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await createInstitutionAdmin({
        name: normalizedName,
        ...(normalizedAlias ? { alias: normalizedAlias } : {}),
        ...(logo.mediaId ? { image_media_id: logo.mediaId } : {}),
        ...(district ? { district_id: Number(district.value) } : {}),
        ...(address.trim() ? { address: address.trim() } : {}),
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success("Institusi berhasil ditambahkan.");
      onSaved();
    } catch (error) {
      console.error("[CreateInstitutionFormSheet] save threw:", error);
      toast.error("Gagal menambahkan institusi. Coba lagi.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <InstitutionLogoField
        imageUrl={logo.imageUrl}
        onChange={setLogo}
        onUploadingChange={setIsUploadingImage}
        disabled={isSaving}
      />

      <Input
        inputId="institution-name"
        label="Nama Institusi"
        placeholder="Contoh: Universitas Indonesia"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
      />

      <Input
        inputId="institution-alias"
        label="Alias"
        placeholder="Contoh: UI"
        value={alias}
        onChange={(event) => setAlias(event.target.value)}
      />

      <InstitutionLocationFields
        address={address}
        onAddressChange={setAddress}
        province={province}
        onProvinceChange={setProvince}
        city={city}
        onCityChange={setCity}
        district={district}
        onDistrictChange={setDistrict}
        disabled={isSaving}
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
