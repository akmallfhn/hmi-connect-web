"use client";

import { InputHTMLAttributes, ReactNode, useState } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  inputId: string;
  label?: string;
  icon?: ReactNode;
  trailing?: ReactNode;
  errorMessage?: string;
  characterLength?: number;
  patternErrorMessage?: string;
}

export default function Input({
  inputId,
  label,
  icon,
  trailing,
  errorMessage,
  characterLength,
  patternErrorMessage,
  required,
  disabled,
  className,
  onChange,
  pattern,
  ...rest
}: InputProps) {
  const [internalError, setInternalError] = useState("");
  const characterLimitErrorMessage = "Oops, you've reached the character limit.";

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (characterLength && event.target.value.length > characterLength) {
      setInternalError(characterLimitErrorMessage);
    } else if (
      pattern &&
      patternErrorMessage &&
      event.target.value !== "" &&
      !new RegExp(`^(?:${pattern})$`, "u").test(event.target.value)
    ) {
      setInternalError(patternErrorMessage);
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
          className="flex items-center gap-0.5 pl-1 text-[15px] font-medium text-heading"
        >
          {label}
          {required && <span className="text-destructive-foreground">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div
            className={`pointer-events-none absolute left-0 flex h-full items-center pl-3 ${
              disabled ? "text-disabled-foreground" : "text-muted-foreground"
            }`}
          >
            {icon}
          </div>
        )}
        <input
          id={inputId}
          required={required}
          disabled={disabled}
          maxLength={characterLength}
          pattern={pattern}
          {...rest}
          onChange={handleChange}
          className={[
            "w-full rounded-lg border px-3 py-2 text-base text-heading transition placeholder:text-placeholder focus:outline-none focus:ring-2",
            computedError
              ? "border-destructive focus:ring-destructive/20"
              : "border-border-strong focus:border-primary focus:ring-primary/15",
            disabled
              ? "cursor-not-allowed disabled:border-border disabled:bg-surface-muted disabled:text-disabled-foreground disabled:opacity-100 disabled:[-webkit-text-fill-color:var(--disabled-foreground)]"
              : "bg-surface",
            icon ? "pl-10" : "",
            trailing ? "pr-10" : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
        />
        {trailing && (
          <div className="absolute right-0 top-0 flex h-full items-center pr-2">
            {trailing}
          </div>
        )}
      </div>

      {computedError && <p className="text-xs text-destructive-foreground">{computedError}</p>}
    </div>
  );
}
