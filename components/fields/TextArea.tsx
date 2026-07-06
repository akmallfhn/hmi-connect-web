"use client";

import { TextareaHTMLAttributes, useState } from "react";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  textAreaId: string;
  label?: string;
  errorMessage?: string;
  characterLength?: number;
}

export default function TextArea({
  textAreaId,
  label,
  errorMessage,
  characterLength,
  required,
  disabled,
  className,
  onChange,
  ...rest
}: TextAreaProps) {
  const [internalError, setInternalError] = useState("");
  const characterLimitErrorMessage = "Oops, you've reached the character limit.";

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
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
          htmlFor={textAreaId}
          className="flex items-center gap-0.5 pl-1 text-[15px] font-medium text-[#172033]"
        >
          {label}
          {required && <span className="text-destructive">*</span>}
        </label>
      )}

      <div className="relative">
        <textarea
          id={textAreaId}
          required={required}
          disabled={disabled}
          maxLength={characterLength}
          {...rest}
          onChange={handleChange}
          className={[
            "w-full resize-none rounded-lg border px-3 py-2 text-base text-[#172033] transition placeholder:text-[#5f6573]/60 focus:outline-none focus:ring-2",
            computedError
              ? "border-destructive focus:ring-destructive/20"
              : "border-[#dbe3ef] focus:border-primary focus:ring-primary/15",
            disabled ? "cursor-not-allowed bg-[#f5f7fb] text-[#5f6573]" : "bg-white",
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
