"use client";

interface SwitchProps {
  switchId: string;
  label?: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

// Accessible toggle — a visually-hidden native checkbox drives the track/thumb via peer-* variants.
export default function Switch({
  switchId,
  label,
  description,
  checked,
  onChange,
  disabled,
}: SwitchProps) {
  return (
    <label
      htmlFor={switchId}
      className={`flex items-center gap-3 ${
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      }`}
    >
      <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
        <input
          id={switchId}
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className="pointer-events-none absolute inset-0 rounded-full bg-[#dbe3ef] transition peer-checked:bg-primary" />
        <span className="pointer-events-none absolute left-1 size-4 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
      </span>
      {(label || description) && (
        <span className="flex flex-col gap-0.5">
          {label && (
            <span className="text-[15px] font-medium text-[#172033]">{label}</span>
          )}
          {description && (
            <span className="text-xs text-[#5f6573]">{description}</span>
          )}
        </span>
      )}
    </label>
  );
}
