"use client";

import { XIcon } from "lucide-react";
import Button from "../buttons/Button";

export interface ActiveFilterChip {
  key: string;
  label: string;
  value: string;
  onRemove: () => void;
}

interface ActiveFilterChipsProps {
  chips: ActiveFilterChip[];
  onClearAll: () => void;
}

export default function ActiveFilterChips({
  chips,
  onClearAll,
}: ActiveFilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Button
          key={chip.key}
          variant="soft"
          size="sm"
          className="max-w-full rounded-full"
          onClick={chip.onRemove}
          aria-label={`Hapus filter ${chip.label}`}
        >
          <span>{chip.label}:</span>
          <span className="min-w-0 truncate">{chip.value}</span>
          <XIcon className="size-3 shrink-0" />
        </Button>
      ))}
      {chips.length > 1 && (
        <Button variant="destructive" size="sm" onClick={onClearAll}>
          Hapus semua
        </Button>
      )}
    </div>
  );
}
