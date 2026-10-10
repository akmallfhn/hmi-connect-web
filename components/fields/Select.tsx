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
          className="flex items-center gap-0.5 pl-1 text-[15px] font-medium text-heading"
        >
          {label}
          {required && <span className="text-destructive-foreground">*</span>}
        </label>
      )}

      <div
        id={selectId}
        className={[
          "relative flex w-full items-center rounded-lg border p-2 text-base transition",
          isOpen ? "border-primary ring-2 ring-primary/15" : "border-border-strong",
          disabled
            ? "cursor-not-allowed border-border bg-surface-muted text-disabled-foreground opacity-100"
            : "cursor-pointer bg-surface text-heading",
          icon ? "pl-10" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev);
        }}
      >
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
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
              selectedOption && value !== "" && value !== null
                ? ""
                : "text-placeholder"
            }`}
          >
            {selectedOption?.label || placeholder}
          </span>
        </div>

        {!disabled && (
          <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
            <ChevronDown className="size-4" />
          </div>
        )}

        {isOpen && !disabled && (
          <div className="absolute left-0 top-full z-30 mt-1 w-full overflow-hidden rounded-lg border border-border-strong bg-surface shadow-md">
            <ul className="flex max-h-40 flex-col overflow-y-auto p-1 text-base">
              {options.map((opt, index) => (
                <li
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange?.(opt.value);
                    setIsOpen(false);
                  }}
                  className={`flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 hover:bg-primary-soft hover:text-primary-foreground ${
                    value === opt.value ? "bg-primary-soft text-primary-foreground" : ""
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
