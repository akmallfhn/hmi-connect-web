"use client";

import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import Button from "../buttons/Button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  panelClassName?: string;
  variant?: "center" | "bottomSheet";
}

// Generic modal chrome, imported by whichever form needs a dialog — each caller owns its own open/close state.
// Rendered via a portal into document.body so its stacking never depends on where it's invoked in the tree.
export default function Modal({
  open,
  onClose,
  title,
  children,
  panelClassName,
  variant = "center",
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

  const isSheet = variant === "bottomSheet";

  return createPortal(
    <div
      className={[
        "font-google-sans fixed inset-0 z-[100] flex justify-center overscroll-contain",
        isSheet ? "items-end sm:items-center sm:p-4" : "items-center p-4",
      ].join(" ")}
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={[
          "relative flex max-h-[85vh] w-full flex-col overflow-hidden bg-white shadow-xl",
          isSheet ? "rounded-t-2xl sm:rounded-2xl" : "rounded-2xl",
          panelClassName ?? "max-w-lg",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* A sheet is dragged up from the bottom edge on mobile, so it reads as one only with the grab handle. */}
        {isSheet && (
          <span
            aria-hidden="true"
            className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-[#dbe3ef] sm:hidden"
          />
        )}
        <div className="flex shrink-0 items-center justify-between border-b border-[#e6e9ef] px-5 pb-2 pt-4">
          <h2 className="text-base font-semibold text-[#172033] xl:text-lg">
            {title}
          </h2>
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
    </div>,
    document.body
  );
}
