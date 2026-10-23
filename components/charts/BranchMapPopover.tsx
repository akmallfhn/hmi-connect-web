"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  BadgeCheck,
  CircleDot,
  Factory,
  MapPin,
  Network,
  X,
} from "lucide-react";
import type { BranchMapEntry } from "@/apis/stat";

export type BranchMapPoint = {
  id: string;
  name: string;
  x: number;
  y: number;
  coordinatingBodyName: string;
  type: BranchMapEntry["type"];
  totalVerifiedKader: number;
  totalChapters: number;
};

export default function BranchMapPopover({
  point,
  anchor,
  id,
  onClose,
}: {
  point: BranchMapPoint;
  anchor: HTMLButtonElement;
  id: string;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const trigger = anchor.getBoundingClientRect();
    const bounds = panel.getBoundingClientRect();
    const padding = 12;
    const gap = 8;
    const below = window.innerHeight - trigger.bottom - gap;
    const above = trigger.top - gap;
    const top =
      bounds.height > below && above > below
        ? trigger.top - bounds.height - gap
        : trigger.bottom + gap;
    panel.style.left = `${Math.max(padding, Math.min(trigger.left + trigger.width / 2 - bounds.width / 2, window.innerWidth - bounds.width - padding))}px`;
    panel.style.top = `${Math.max(padding, Math.min(top, window.innerHeight - bounds.height - padding))}px`;
    panel.style.visibility = "visible";
    panel.focus({ preventScroll: true });
  }, [anchor, point.id]);

  useEffect(() => {
    const outside = (event: Event) => {
      const target = event.target as Node;
      if (!panelRef.current?.contains(target) && !anchor.contains(target))
        onClose();
    };
    const dismiss = () => onClose();
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose();
      anchor.focus({ preventScroll: true });
    };
    document.addEventListener("pointerdown", outside, true);
    document.addEventListener("focusin", outside);
    document.addEventListener("keydown", escape);
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("wheel", dismiss, { passive: true, capture: true });
    window.addEventListener("resize", dismiss);
    return () => {
      document.removeEventListener("pointerdown", outside, true);
      document.removeEventListener("focusin", outside);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("wheel", dismiss, true);
      window.removeEventListener("resize", dismiss);
    };
  }, [anchor, onClose]);

  return createPortal(
    <div
      ref={panelRef}
      id={id}
      role="dialog"
      aria-modal="false"
      aria-labelledby={`${id}-title`}
      tabIndex={-1}
      style={{
        top: 0,
        left: 0,
        visibility: "hidden",
        maxHeight: "calc(100dvh - 24px)",
      }}
      className="font-google-sans fixed z-[120] w-72 max-w-[calc(100vw-24px)] overflow-y-auto rounded-xl border border-border bg-surface p-3.5 shadow-[0_12px_32px_var(--shadow-card)] outline-none"
    >
      <div className="flex items-start gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-secondary-foreground">
          <MapPin className="size-4" />
        </span>
        <p
          id={`${id}-title`}
          className="min-w-0 flex-1 pt-1 text-sm font-bold leading-5 text-heading"
        >
          {point.name}
        </p>
        <button
          type="button"
          aria-label="Tutup detail Cabang"
          onClick={() => {
            onClose();
            anchor.focus({ preventScroll: true });
          }}
          className="-mr-1.5 -mt-1.5 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <X className="size-4" />
        </button>
      </div>
      <dl className="mt-3 space-y-2 border-t border-border pt-3 text-[13px] text-muted-foreground">
        <div className="flex items-start gap-2">
          <Network className="mt-0.5 size-3.5 shrink-0" />
          <dt className="flex-1">Badko</dt>
          <dd className="max-w-36 text-right font-semibold text-heading">
            {point.coordinatingBodyName}
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <CircleDot className="size-3.5 shrink-0" />
          <dt className="flex-1">Status</dt>
          <dd className="font-semibold text-heading">
            {point.type === "full" ? "Penuh" : "Persiapan"}
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <BadgeCheck className="size-3.5 shrink-0" />
          <dt className="flex-1">Kader Terverifikasi</dt>
          <dd className="font-semibold text-heading">
            {point.totalVerifiedKader.toLocaleString("id-ID")}
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <Factory className="size-3.5 shrink-0" />
          <dt className="flex-1">Jumlah Komisariat</dt>
          <dd className="font-semibold text-heading">
            {point.totalChapters.toLocaleString("id-ID")}
          </dd>
        </div>
      </dl>
    </div>,
    document.body,
  );
}
