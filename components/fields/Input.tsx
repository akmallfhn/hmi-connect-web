"use client";

import { InputHTMLAttributes, ReactNode, useState } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  inputId: string;
  label?: string;
  icon?: ReactNode;
  errorMessage?: string;
  characterLength?: number;
}

export default function Input({
  inputId,
  label,
  icon,
  errorMessage,
  characterLength,
  required,
  disabled,
  className,
  onChange,
  ...rest
}: InputProps) {
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
          htmlFor={inputId}
          className="flex items-center gap-0.5 pl-1 text-[15px] font-medium text-[#172033]"
        >
          {label}
          {required && <span className="text-destructive">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-0 flex h-full items-center pl-3 text-[#5f6573]">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          required={required}
          disabled={disabled}
          maxLength={characterLength}
          {...rest}
          onChange={handleChange}
          className={[
            "w-full rounded-lg border px-3 py-2 text-base text-[#172033] transition placeholder:text-[#5f6573]/60 focus:outline-none focus:ring-2",
            computedError
              ? "border-destructive focus:ring-destructive/20"
              : "border-[#dbe3ef] focus:border-primary focus:ring-primary/15",
            disabled ? "cursor-not-allowed bg-[#f5f7fb] text-[#5f6573]" : "bg-white",
            icon ? "pl-10" : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
        />
      </div>

      {computedError && <p className="text-xs text-destructive">{computedError}</p>}
    </div>
  );
}
