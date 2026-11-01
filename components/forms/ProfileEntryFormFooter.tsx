"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import Button from "../buttons/Button";

interface ProfileEntryFormFooterProps {
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  // Omitted while adding a new entry, since there is nothing to delete yet.
  onDelete?: () => void;
  deleteMessage: string;
}

// Shared by every single-entry profile form: inline delete confirmation, then Batal/Simpan.
export default function ProfileEntryFormFooter({
  isSaving,
  onCancel,
  onSubmit,
  onDelete,
  deleteMessage,
}: ProfileEntryFormFooterProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (confirmingDelete && onDelete) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive-soft/40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-heading">{deleteMessage}</p>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmingDelete(false)}
            disabled={isSaving}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            disabled={isSaving}
          >
            {isSaving ? "Menghapus..." : "Ya, Hapus"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
      {onDelete ? (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setConfirmingDelete(true)}
          disabled={isSaving}
        >
          <Trash2 className="size-3.5" />
          Hapus
        </Button>
      ) : (
        <span />
      )}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Batal
        </Button>
        <Button variant="primary" onClick={onSubmit} disabled={isSaving}>
          {isSaving ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </div>
  );
}
