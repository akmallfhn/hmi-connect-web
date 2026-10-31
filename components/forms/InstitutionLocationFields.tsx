"use client";

import Input from "../fields/Input";
import SearchableSelect, {
  type SearchableOption,
} from "../fields/SearchableSelect";

interface InstitutionLocationFieldsProps {
  address: string;
  onAddressChange: (value: string) => void;
  province: SearchableOption | null;
  onProvinceChange: (value: SearchableOption | null) => void;
  city: SearchableOption | null;
  onCityChange: (value: SearchableOption | null) => void;
  district: SearchableOption | null;
  onDistrictChange: (value: SearchableOption | null) => void;
  disabled?: boolean;
}

export default function InstitutionLocationFields({
  address,
  onAddressChange,
  province,
  onProvinceChange,
  city,
  onCityChange,
  district,
  onDistrictChange,
  disabled,
}: InstitutionLocationFieldsProps) {
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

  return (
    <>
      <Input
        inputId="institution-address"
        label="Alamat"
        placeholder="Contoh: Jl. Margonda Raya"
        value={address}
        onChange={(event) => onAddressChange(event.target.value)}
        disabled={disabled}
      />

      <div className="flex flex-col gap-3">
        <SearchableSelect
          selectId="institution-province"
          label="Provinsi"
          placeholder="Cari provinsi..."
          value={province}
          onChange={(option) => {
            onProvinceChange(option);
            onCityChange(null);
            onDistrictChange(null);
          }}
          loadOptions={loadProvinceOptions}
          defaultOptions={province ? [province] : []}
          disabled={disabled}
        />
        <SearchableSelect
          key={`institution-city-${province?.value ?? "none"}`}
          selectId="institution-city"
          label="Kota/Kabupaten"
          placeholder="Cari kota/kabupaten..."
          value={city}
          onChange={(option) => {
            onCityChange(option);
            onDistrictChange(null);
          }}
          loadOptions={loadCityOptions}
          defaultOptions={city ? [city] : []}
          disabled={disabled || !province}
        />
        <SearchableSelect
          key={`institution-district-${city?.value ?? "none"}`}
          selectId="institution-district"
          label="Kecamatan"
          placeholder="Cari kecamatan..."
          value={district}
          onChange={onDistrictChange}
          loadOptions={loadDistrictOptions}
          defaultOptions={district ? [district] : []}
          disabled={disabled || !city}
        />
      </div>
    </>
  );
}
