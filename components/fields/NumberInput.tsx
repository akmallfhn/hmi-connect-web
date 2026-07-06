"use client";

import { InputHTMLAttributes, ReactNode, useState } from "react";

export type NumberInputMode = "numeric" | "decimal";

interface NumberInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  inputId: string;
  label?: string;
  icon?: ReactNode;
  errorMessage?: string;
  characterLength?: number;
  mode?: NumberInputMode;
  value: string;
  onValueChange?: (value: string) => void;
}

const sanitizers: Record<NumberInputMode, (raw: string) => string> = {
  numeric: (raw) => raw.replace(/\D/g, "").replace(/^0+(?=\d)/, ""),
  decimal: (raw) =>
    raw
      .replace(/[^0-9.,]/g, "")
      .replace(/,/g, ".")
      .replace(/(\..*)\./g, "$1"),
};

const inputModeMap: Record<NumberInputMode, "numeric" | "decimal"> = {
  numeric: "numeric",
  decimal: "decimal",
};

const patternMap: Record<NumberInputMode, string> = {
  numeric: "[0-9]*",
  decimal: "^[0-9]*[.,]?[0-9]*$",
};

export default function NumberInput({
  inputId,
  label,
  icon,
  errorMessage,
  characterLength,
  mode = "numeric",
  value,
  onValueChange,
  required,
  disabled,
  className,
  ...rest
}: NumberInputProps) {
  const [internalError, setInternalError] = useState("");
  const characterLimitErrorMessage = "Oops, you've reached the character limit.";

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    const sanitized = sanitizers[mode](rawValue).slice(0, characterLength);

    if (characterLength && rawValue.length > characterLength) {
      setInternalError(characterLimitErrorMessage);
    } else if (internalError) {
      setInternalError("");
    }

    onValueChange?.(sanitized);
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
          type="text"
          inputMode={inputModeMap[mode]}
          pattern={patternMap[mode]}
          required={required}
          disabled={disabled}
          maxLength={characterLength}
          value={value}
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
