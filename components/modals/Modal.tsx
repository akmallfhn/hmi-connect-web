"use client";

import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";
import Button from "../buttons/Button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  panelClassName?: string;
}

// Generic modal chrome, imported by whichever form needs a dialog — each caller owns its own open/close state.
export default function Modal({
  open,
  onClose,
  title,
  children,
  panelClassName,
}: ModalProps) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overscroll-contain p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={[
          "relative flex max-h-[85vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-xl",
          panelClassName ?? "max-w-lg",
        ]
          .filter(Boolean)
          .join(" ")}
      >
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
        <div className="overflow-y-auto overscroll-contain px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}
