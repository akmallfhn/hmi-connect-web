"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  InstitutionDetail,
  InstitutionListEntry,
} from "@/apis/institutions";
import { getInstitutionDetail, updateInstitution } from "@/lib/actions";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import type { SearchableOption } from "../fields/SearchableSelect";
import Sheet from "../modals/Sheet";
import InstitutionLocationFields from "./InstitutionLocationFields";
import InstitutionLogoField, {
  type InstitutionLogoValue,
} from "./InstitutionLogoField";

interface EditInstitutionFormSheetProps {
  open: boolean;
  institution: InstitutionListEntry | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditInstitutionFormSheet({
  open,
  institution,
  onClose,
  onSaved,
}: EditInstitutionFormSheetProps) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Edit Institusi"
      description="Perbarui identitas dan alamat institusi ini."
    >
      {open && institution && (
        <EditInstitutionLoader
          institution={institution}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </Sheet>
  );
}

function EditInstitutionLoader({
  institution,
  onClose,
  onSaved,
}: {
  institution: InstitutionListEntry;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [detail, setDetail] = useState<InstitutionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getInstitutionDetail(institution.id)
      .then((result) => {
        if (cancelled) return;
        if (!result) toast.error("Gagal memuat detail institusi.");
        setDetail(result);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [institution.id]);

  if (loading) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Memuat data institusi...
      </p>
    );
  }

  if (!detail) return null;
  return (
    <EditInstitutionFields
      institution={detail}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}

function EditInstitutionFields({
  institution,
  onClose,
  onSaved,
}: {
  institution: InstitutionDetail;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(institution.name);
  const [alias, setAlias] = useState(institution.alias ?? "");
  const [logo, setLogo] = useState<InstitutionLogoValue>({
    mediaId: institution.image_media_id ?? "",
    imageUrl: institution.image_url ?? "",
  });
  const [logoChanged, setLogoChanged] = useState(false);
  const [address, setAddress] = useState(institution.address ?? "");
  const [province, setProvince] = useState<SearchableOption | null>(
    institution.province_id && institution.province_name
      ? { label: institution.province_name, value: institution.province_id }
      : null,
  );
  const [city, setCity] = useState<SearchableOption | null>(
    institution.city_id && institution.city_name
      ? { label: institution.city_name, value: institution.city_id }
      : null,
  );
  const [district, setDistrict] = useState<SearchableOption | null>(
    institution.district_id && institution.district_name
      ? { label: institution.district_name, value: institution.district_id }
      : null,
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit() {
    const normalizedName = name.trim();
    if (!normalizedName) {
      toast.error("Nama institusi wajib diisi.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateInstitution({
        id: institution.id,
        name: normalizedName,
        alias: alias.trim(),
        ...(logoChanged ? { image_media_id: logo.mediaId } : {}),
        district_id: district ? Number(district.value) : 0,
        address: address.trim(),
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success("Institusi berhasil diperbarui.");
      onSaved();
    } catch (error) {
      console.error("[EditInstitutionFormSheet] save threw:", error);
      toast.error("Gagal memperbarui institusi. Coba lagi.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <InstitutionLogoField
        imageUrl={logo.imageUrl}
        onChange={(value) => {
          setLogo(value);
          setLogoChanged(true);
        }}
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
