"use client";

import { ListFilter } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Button from "../buttons/Button";

interface FilterDropdownProps {
  panelId: string;
  ariaLabel: string;
  activeCount: number;
  onReset: () => void;
  // "split" lays two child columns side by side from lg up; below that they stack.
  layout?: "stack" | "split";
  children: ReactNode;
}

export default function FilterDropdown({
  panelId,
  ariaLabel,
  activeCount,
  onReset,
  layout = "stack",
  children,
}: FilterDropdownProps) {
  const split = layout === "split";
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <Button
        variant="light"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls={panelId}
        className="relative overflow-visible!"
      >
        <ListFilter className="size-4" /> Filter
        {activeCount > 0 && (
          <span
            className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[11px] font-bold leading-none text-white ring-2 ring-white"
            aria-label={`${activeCount} filter aktif`}
          >
            {activeCount > 9 ? "9+" : activeCount}
          </span>
        )}
      </Button>

      {open && (
        <div
          id={panelId}
          role="group"
          aria-label={ariaLabel}
          className={`absolute left-0 top-full z-40 mt-2 w-[calc(100vw-2rem)] max-w-80 rounded-xl border border-[#e6e9ef] bg-white p-4 shadow-lg ${
            split ? "lg:w-[36rem] lg:max-w-none" : ""
          }`}
        >
          <div
            className={`flex flex-col gap-3 ${
              split ? "lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-5" : ""
            }`}
          >
            {children}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#e6e9ef] pt-3">
            <span className="text-xs text-[#5f6573]">
              {activeCount} filter aktif
            </span>
            <Button
              variant="destructive"
              size="sm"
              disabled={activeCount === 0}
              onClick={() => {
                onReset();
                setOpen(false);
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
