"use client";

import { InputHTMLAttributes, ReactNode, useState } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  fieldId: string;
  label?: string;
  icon?: ReactNode;
  errorMessage?: string;
  characterLength?: number;
}

export default function Field({
  fieldId,
  label,
  icon,
  errorMessage,
  characterLength,
  required,
  disabled,
  className,
  onChange,
  ...rest
}: FieldProps) {
  const [internalError, setInternalError] = useState("");
  const characterLimitErrorMessage = "Oops, you've reached the character limit.";

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (characterLength && event.target.value.length > characterLength) {
      setInternalError(characterLimitErrorMessage);
    } else if (internalError) {
      setInternalError("");
    }
    onChange?.(event);
  };

  const computedError = errorMessage || internalError;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={fieldId}
          className="flex items-center gap-0.5 pl-1 text-sm font-semibold text-[#172033]"
        >
          {label}
          {required && <span className="text-red-600">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-0 flex h-full items-center pl-3 text-[#5f6573]">
            {icon}
          </div>
        )}
        <input
          id={fieldId}
          required={required}
          disabled={disabled}
          maxLength={characterLength}
          {...rest}
          onChange={handleChange}
          className={[
            "w-full rounded-lg border px-3 py-2 text-sm text-[#172033] transition placeholder:text-[#5f6573]/60 focus:outline-none focus:ring-2",
            computedError
              ? "border-red-500 focus:ring-red-200"
              : "border-[#dbe3ef] focus:border-[#0b8f6a] focus:ring-[#0b8f6a]/15",
            disabled ? "cursor-not-allowed bg-[#f5f7fb] text-[#5f6573]" : "bg-white",
            icon ? "pl-10" : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
        />
      </div>

      {computedError && <p className="text-xs text-red-600">{computedError}</p>}
    </div>
  );
}
