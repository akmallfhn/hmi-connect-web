"use client";

import { useMemo, useRef } from "react";
import AsyncSelect from "react-select/async";

export interface SearchableOption {
  label: string;
  value: string | number;
}

interface SearchableSelectProps {
  selectId: string;
  label?: string;
  placeholder?: string;
  value: SearchableOption | null;
  onChange: (option: SearchableOption | null) => void;
  loadOptions: (inputValue: string) => Promise<SearchableOption[]>;
  defaultOptions?: SearchableOption[] | boolean;
  debounceMs?: number;
  required?: boolean;
  disabled?: boolean;
  noOptionsMessage?: string;
}

export default function SearchableSelect({
  selectId,
  label,
  placeholder = "Cari...",
  value,
  onChange,
  loadOptions,
  defaultOptions = true,
  debounceMs = 0,
  required,
  disabled,
  noOptionsMessage = "Tidak ditemukan.",
}: SearchableSelectProps) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  const debouncedLoadOptions = useMemo(() => {
    if (debounceMs <= 0) return loadOptions;

    return (inputValue: string) =>
      new Promise<SearchableOption[]>((resolve) => {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          resolve(loadOptions(inputValue));
        }, debounceMs);
      });
  }, [loadOptions, debounceMs]);

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={selectId}
          className="flex items-center gap-0.5 pl-1 text-sm font-semibold text-[#172033]"
        >
          {label}
          {required && <span className="text-red-600">*</span>}
        </label>
      )}

      <AsyncSelect<SearchableOption, false>
        inputId={selectId}
        instanceId={selectId}
        isDisabled={disabled}
        value={value}
        onChange={(option) => onChange(option)}
        loadOptions={debouncedLoadOptions}
        defaultOptions={defaultOptions}
        cacheOptions
        placeholder={placeholder}
        loadingMessage={() => "Mencari..."}
        noOptionsMessage={() => noOptionsMessage}
        unstyled
        classNames={{
          control: ({ isFocused }) =>
            `rounded-lg border bg-white px-2 py-1 text-sm transition ${
              isFocused
                ? "border-[#0b8f6a] ring-2 ring-[#0b8f6a]/15"
                : "border-[#dbe3ef]"
            }`,
          valueContainer: () => "px-1 py-0.5",
          placeholder: () => "px-1 text-[#5f6573]/60",
          input: () => "px-1 text-sm text-[#172033]",
          singleValue: () => "px-1 text-sm text-[#172033]",
          indicatorsContainer: () => "text-[#5f6573]",
          indicatorSeparator: () => "hidden",
          dropdownIndicator: () => "px-1",
          clearIndicator: () => "px-1 hover:text-[#b42318]",
          menu: () =>
            "z-30 mt-1 overflow-hidden rounded-lg border border-[#dbe3ef] bg-white shadow-md",
          menuList: () => "max-h-60 overflow-y-auto p-1",
          option: ({ isFocused }) =>
            `cursor-pointer rounded-md px-3 py-2 text-sm ${
              isFocused ? "bg-[#f5fbf8] text-[#0b8f6a]" : "text-[#172033]"
            }`,
          noOptionsMessage: () => "p-2 text-sm text-[#5f6573]",
          loadingMessage: () => "p-2 text-sm text-[#5f6573]",
        }}
      />
    </div>
  );
}
