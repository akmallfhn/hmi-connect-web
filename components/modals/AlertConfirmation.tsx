"use client";

import Button, { type ButtonVariant } from "../buttons/Button";
import Modal from "./Modal";

interface AlertConfirmationProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: ButtonVariant;
  loading?: boolean;
}

export default function AlertConfirmation({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  confirmVariant = "destructive",
  loading = false,
}: AlertConfirmationProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-[#5f6573]">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm} disabled={loading}>
          {loading ? "Memproses..." : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
