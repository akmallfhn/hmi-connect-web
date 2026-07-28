"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "@/apis/users";
import { updateUser } from "@/lib/actions";
import { isSuccessStatus, type GenderEnum } from "@/lib/types";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import RadioButton from "../fields/RadioButton";
import SearchableSelect, { type SearchableOption } from "../fields/SearchableSelect";
import Modal from "../modals/Modal";

interface AdminEditUserContactFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  user: UserProfile;
}

export default function AdminEditUserContactForm({
  open,
  onClose,
  onSaved,
  user,
}: AdminEditUserContactFormProps) {
  return (
    <Modal open={open} onClose={onClose} title="Edit Data KTP & Kontak">
      {open && <ContactFields user={user} onClose={onClose} onSaved={onSaved} />}
    </Modal>
  );
}

// Mounted only while open, so state always seeds fresh from the fetched user — no reset effect needed.
function ContactFields({
  user,
  onClose,
  onSaved,
}: {
  user: UserProfile;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [ktpFullName, setKtpFullName] = useState(user.ktp_full_name ?? "");
  const [phoneNumber, setPhoneNumber] = useState(user.phone_number ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(user.date_of_birth ?? "");
  const [gender, setGender] = useState<GenderEnum | null>(user.gender ?? null);
  const [addressStreet, setAddressStreet] = useState(user.address_street ?? "");
  const [province, setProvince] = useState<SearchableOption | null>(
    user.province_id && user.province_name
      ? { label: user.province_name, value: user.province_id }
      : null
  );
  const [city, setCity] = useState<SearchableOption | null>(
    user.city_id && user.city_name
      ? { label: user.city_name, value: user.city_id }
      : null
  );
  const [district, setDistrict] = useState<SearchableOption | null>(
    user.district_id && user.district_name
      ? { label: user.district_name, value: user.district_id }
      : null
  );
  const [isSaving, setIsSaving] = useState(false);

  const provinceDefaultOptions: SearchableOption[] =
    user.province_id && user.province_name
      ? [{ label: user.province_name, value: user.province_id }]
      : [];
  const cityDefaultOptions: SearchableOption[] =
    user.city_id && user.city_name
      ? [{ label: user.city_name, value: user.city_id }]
      : [];
  const districtDefaultOptions: SearchableOption[] =
    user.district_id && user.district_name
      ? [{ label: user.district_name, value: user.district_id }]
      : [];

  async function loadProvinceOptions(inputValue: string, page: number) {
    const params = new URLSearchParams({ page: String(page) });
    if (inputValue) params.set("q", inputValue);
    const response = await fetch(`/api/provinces/search?${params}`);
    const json = await response.json();
    const results: { id: number; name: string }[] = json.data ?? [];
    return {
      options: results.map((item) => ({ label: item.name, value: item.id })),
      hasMore: Boolean(json.hasMore),
    };
  }

  async function loadCityOptions(inputValue: string, page: number) {
    if (!province) return { options: [], hasMore: false };
    const params = new URLSearchParams({
      page: String(page),
      province_id: String(province.value),
    });
    if (inputValue) params.set("q", inputValue);
    const response = await fetch(`/api/cities/search?${params}`);
    const json = await response.json();
    const results: { id: number; name: string }[] = json.data ?? [];
    return {
      options: results.map((item) => ({ label: item.name, value: item.id })),
      hasMore: Boolean(json.hasMore),
    };
  }

  async function loadDistrictOptions(inputValue: string, page: number) {
    if (!city) return { options: [], hasMore: false };
    const params = new URLSearchParams({
      page: String(page),
      city_id: String(city.value),
    });
    if (inputValue) params.set("q", inputValue);
    const response = await fetch(`/api/districts/search?${params}`);
    const json = await response.json();
    const results: { id: number; name: string }[] = json.data ?? [];
    return {
      options: results.map((item) => ({ label: item.name, value: item.id })),
      hasMore: Boolean(json.hasMore),
    };
  }

  async function handleSubmit() {
    setIsSaving(true);
    try {
      const result = await updateUser({
        id: user.id,
        ktp_full_name: ktpFullName,
        phone_number: phoneNumber,
        date_of_birth: dateOfBirth,
        ...(gender ? { gender } : {}),
        address_street: addressStreet,
        ...(district ? { district_id: Number(district.value) } : {}),
      });

      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal menyimpan perubahan.");
        return;
      }

      toast.success("Data KTP & kontak berhasil diperbarui.");
      onSaved();
    } catch (err) {
      console.error("[AdminEditUserContactForm] updateUser threw:", err);
      toast.error("Gagal menyimpan perubahan.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        inputId="admin-contact-ktp-name"
        label="Nama Lengkap (sesuai KTP)"
        value={ktpFullName}
        onChange={(e) => setKtpFullName(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          inputId="admin-contact-phone"
          label="Nomor HP"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <Input
          inputId="admin-contact-dob"
          type="date"
          label="Tanggal Lahir"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="pl-1 text-[15px] font-medium text-[#172033]">
          Jenis Kelamin
        </label>
        <div className="grid grid-cols-2 gap-3">
          <RadioButton<GenderEnum>
            radioName="admin-contact-gender"
            label="Laki-laki"
            value="male"
            selectedValue={gender}
            onChange={setGender}
          />
          <RadioButton<GenderEnum>
            radioName="admin-contact-gender"
            label="Perempuan"
            value="female"
            selectedValue={gender}
            onChange={setGender}
          />
        </div>
      </div>

      <Input
        inputId="admin-contact-address"
        label="Alamat (Jalan)"
        value={addressStreet}
        onChange={(e) => setAddressStreet(e.target.value)}
      />

      <div className="flex flex-col gap-3">
        <SearchableSelect
          selectId="admin-contact-province"
          label="Provinsi"
          placeholder="Cari provinsi..."
          value={province}
          onChange={(option) => {
            setProvince(option);
            setCity(null);
            setDistrict(null);
          }}
          loadOptions={loadProvinceOptions}
          defaultOptions={provinceDefaultOptions}
        />
        <SearchableSelect
          key={`admin-contact-city-${province?.value ?? "none"}`}
          selectId="admin-contact-city"
          label="Kota/Kabupaten"
          placeholder="Cari kota/kabupaten..."
          value={city}
          onChange={(option) => {
            setCity(option);
            setDistrict(null);
          }}
          loadOptions={loadCityOptions}
          defaultOptions={cityDefaultOptions}
          disabled={!province}
        />
        <SearchableSelect
          key={`admin-contact-district-${city?.value ?? "none"}`}
          selectId="admin-contact-district"
          label="Kecamatan"
          placeholder="Cari kecamatan..."
          value={district}
          onChange={setDistrict}
          loadOptions={loadDistrictOptions}
          defaultOptions={districtDefaultOptions}
          disabled={!city}
        />
      </div>

      <div className="flex justify-end gap-3 border-t border-[#e6e9ef] pt-4">
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
