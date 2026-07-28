"use client";

import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import Button from "../buttons/Button";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}

// Right-side slide-over for create/edit forms — same chrome as Modal.tsx, anchored to the right edge instead of centered.
export default function Sheet({ open, onClose, title, description, children }: SheetProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="font-google-sans fixed inset-0 z-[100] overscroll-contain">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-y-0 right-0 flex h-full w-full max-w-md flex-col border-l border-[#e6e9ef] bg-white shadow-xl">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#e6e9ef] px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-[#172033]">{title}</h2>
            {description && (
              <p className="mt-0.5 text-sm text-[#5f6573]">{description}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="size-8 shrink-0 rounded-full text-[#5f6573] hover:bg-[#f5f7fb]"
            aria-label="Tutup"
          >
            <X className="size-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
