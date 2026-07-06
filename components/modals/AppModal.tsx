"use client";

import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";
import Button from "../buttons/Button";

interface AppModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

// Generic modal chrome, imported by whichever form needs a dialog — each caller owns its own open/close state.
export default function AppModal({ open, onClose, title, children }: AppModalProps) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-[#e6e9ef] px-5 py-4">
          <h2 className="text-base font-semibold text-[#172033]">{title}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="size-8 rounded-full text-[#5f6573] hover:bg-[#f5f7fb]"
            aria-label="Tutup"
          >
            <X className="size-4" />
          </Button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
