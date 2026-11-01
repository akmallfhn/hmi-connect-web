"use client";

import Select from "./Select";

interface YearSelectProps {
  selectId: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  years: number[];
  // Years before this are left out, so an end year can never precede its start.
  minYear?: number;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

// A year is always picked from a list, never typed, so profile years can't hold anything malformed.
export default function YearSelect({
  selectId,
  label,
  value,
  onChange,
  years,
  minYear,
  placeholder = "Pilih tahun",
  disabled,
  required,
}: YearSelectProps) {
  const options = years
    .filter((year) => minYear === undefined || year >= minYear)
    .map((year) => ({ label: String(year), value: String(year) }));

  return (
    <Select
      selectId={selectId}
      label={label}
      placeholder={placeholder}
      value={value || null}
      onChange={(next) => onChange(next ? String(next) : "")}
      options={options}
      disabled={disabled}
      required={required}
    />
  );
}
