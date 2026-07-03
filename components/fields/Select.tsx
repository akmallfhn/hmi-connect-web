"use client";

import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { ReactNode, useEffect, useRef, useState } from "react";

export interface SelectOption {
  label: string;
  value: string | number | null;
  image?: string;
}

interface SelectProps {
  selectId: string;
  label?: string;
  icon?: ReactNode;
  placeholder: string;
  value: string | number | null;
  onChange?: (value: string | number | null) => void;
  disabled?: boolean;
  required?: boolean;
  options?: SelectOption[];
  onOpenChange?: (open: boolean) => void;
}

export default function Select({
  selectId,
  label,
  icon,
  placeholder,
  value,
  onChange,
  disabled,
  required,
  options = [],
  onOpenChange,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="flex flex-col gap-1" ref={containerRef}>
      {label && (
        <label
          htmlFor={selectId}
          className="flex items-center gap-0.5 pl-1 text-[15px] font-medium text-[#172033]"
        >
          {label}
          {required && <span className="text-red-600">*</span>}
        </label>
      )}

      <div
        id={selectId}
        className={[
          "relative flex w-full items-center rounded-lg border p-2 text-base transition",
          isOpen
            ? "border-[#0b8f6a] ring-2 ring-[#0b8f6a]/15"
            : "border-[#dbe3ef]",
          disabled
            ? "cursor-not-allowed bg-[#f5f7fb] text-[#5f6573]"
            : "cursor-pointer bg-white",
          icon ? "pl-10" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev);
        }}
      >
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#5f6573]">
            {icon}
          </div>
        )}

        <div className="flex items-center gap-2 truncate">
          {selectedOption?.image && (
            <div className="flex aspect-square size-5 overflow-hidden rounded-full">
              <Image
                className="h-full w-full object-cover"
                src={selectedOption.image}
                alt={selectedOption.label}
                width={100}
                height={100}
              />
            </div>
          )}
          <span
            className={`block truncate text-base ${
              selectedOption ? "" : "text-[#5f6573]"
            }`}
          >
            {selectedOption?.label || placeholder}
          </span>
        </div>

        {!disabled && (
          <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#5f6573]">
            <ChevronDown className="size-4" />
          </div>
        )}

        {isOpen && !disabled && (
          <div className="absolute left-0 top-full z-30 mt-2 w-full overflow-hidden rounded-lg border border-[#dbe3ef] bg-white shadow-md">
            <ul className="flex max-h-60 flex-col overflow-auto text-base">
              {options.map((opt, index) => (
                <li
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange?.(opt.value);
                    setIsOpen(false);
                  }}
                  className={`flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-[#f5fbf8] ${
                    value === opt.value ? "bg-[#f5fbf8] text-[#0b8f6a]" : ""
                  }`}
                >
                  {opt.image && (
                    <div className="flex aspect-square size-[26px] overflow-hidden rounded-full">
                      <Image
                        className="h-full w-full object-cover"
                        src={opt.image}
                        alt={opt.label}
                        width={100}
                        height={100}
                      />
                    </div>
                  )}
                  {opt.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
