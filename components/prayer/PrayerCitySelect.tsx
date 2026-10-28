"use client";

import { IconMapPin } from "@tabler/icons-react";
import SearchableSelect, {
  type SearchableOption,
} from "../fields/SearchableSelect";

interface PrayerCitySelectProps {
  selectId: string;
  value: SearchableOption | null;
  onChange: (cityId: number) => void;
  disabled?: boolean;
}

async function loadCityOptions(inputValue: string, page: number) {
  const params = new URLSearchParams({ page: String(page) });
  if (inputValue) params.set("q", inputValue);

  const response = await fetch(`/api/cities/search-all?${params}`);
  if (!response.ok) return { options: [], hasMore: false };
  const json = await response.json();
  const results: { id: number; name: string }[] = json.data ?? [];

  return {
    options: results.map((item) => ({ label: item.name, value: item.id })),
    hasMore: Boolean(json.hasMore),
  };
}

// Nationwide city picker; seeded with the current city so opening it costs no request until the viewer types.
export default function PrayerCitySelect({
  selectId,
  value,
  onChange,
  disabled,
}: PrayerCitySelectProps) {
  return (
    <SearchableSelect
      selectId={selectId}
      icon={<IconMapPin className="size-[18px] text-secondary" stroke={2} />}
      placeholder="Cari kota/kabupaten..."
      value={value}
      onChange={(option) => option && onChange(Number(option.value))}
      loadOptions={loadCityOptions}
      defaultOptions={value ? [value] : []}
      debounceMs={250}
      disabled={disabled}
      isClearable={false}
      noOptionsMessage="Kota tidak ditemukan."
    />
  );
}
