"use client";

import { Pencil, Plus } from "lucide-react";
import Button from "../buttons/Button";

// The section-level add action; soft so it reads apart from the ghost per-item Edit.
export function AddEntryButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="soft" size="sm" onClick={onClick}>
      <Plus className="size-3.5" />
      Tambah
    </Button>
  );
}

// The per-item edit action, a quiet ghost button beside each entry.
export function EditEntryButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      aria-label={label}
      className="shrink-0"
    >
      <Pencil className="size-3.5" />
      Edit
    </Button>
  );
}
