"use client";

interface RadioButtonProps<T> {
  radioName: string;
  label: string;
  description?: string;
  value: T;
  selectedValue: T | null;
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
}

export default function RadioButton<T extends string | number | boolean>({
  radioName,
  label,
  description,
  value,
  selectedValue,
  onChange,
  disabled,
  className,
}: RadioButtonProps<T>) {
  const isSelected = selectedValue === value;

  return (
    <label
      className={[
        "flex items-start gap-3 rounded-lg border p-3 transition",
        isSelected
          ? "border-primary bg-primary-soft"
          : "border-[#dbe3ef] bg-white",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <input
        type="radio"
        name={radioName}
        checked={isSelected}
        onChange={() => onChange(value)}
        disabled={disabled}
        className="mt-0.5 size-4 accent-primary"
      />
      <div className="flex flex-col gap-0.5">
        <span className="text-base font-medium text-[#172033]">{label}</span>
        {description && (
          <span className="text-sm text-[#5f6573]">{description}</span>
        )}
      </div>
    </label>
  );
}
