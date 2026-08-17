"use client";

import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface DropdownProps {
  trigger: (state: { open: boolean; toggle: () => void }) => ReactNode;
  children: ReactNode;
  align?: "left" | "right";
  panelClassName?: string;
}

export default function Dropdown({
  trigger,
  children,
  align = "right",
  panelClassName,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const clickedTrigger = containerRef.current?.contains(target);
      const clickedPanel = panelRef.current?.contains(target);
      if (!clickedTrigger && !clickedPanel) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useLayoutEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const trigger = containerRef.current;
      const panel = panelRef.current;
      if (!trigger || !panel) return;

      const triggerRect = trigger.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const viewportPadding = 8;
      const gap = 8;
      const spaceBelow =
        window.innerHeight - triggerRect.bottom - gap - viewportPadding;
      const spaceAbove = triggerRect.top - gap - viewportPadding;
      const opensAbove =
        panelRect.height > spaceBelow && spaceAbove > spaceBelow;
      const unclampedTop = opensAbove
        ? triggerRect.top - panelRect.height - gap
        : triggerRect.bottom + gap;
      const unclampedLeft =
        align === "right"
          ? triggerRect.right - panelRect.width
          : triggerRect.left;
      const maxTop = Math.max(
        viewportPadding,
        window.innerHeight - panelRect.height - viewportPadding,
      );
      const maxLeft = Math.max(
        viewportPadding,
        window.innerWidth - panelRect.width - viewportPadding,
      );

      panel.style.top = `${Math.min(Math.max(unclampedTop, viewportPadding), maxTop)}px`;
      panel.style.left = `${Math.min(Math.max(unclampedLeft, viewportPadding), maxLeft)}px`;
      panel.style.visibility = "visible";
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [align, open]);

  return (
    <div className="relative" ref={containerRef}>
      {trigger({ open, toggle: () => setOpen((prev) => !prev) })}
      {open &&
        createPortal(
          <div
            ref={panelRef}
            onClick={() => setOpen(false)}
            style={{ top: 0, left: 0, visibility: "hidden" }}
            className={[
              "font-google-sans fixed z-[120] w-72 overflow-hidden rounded-2xl border border-[#e6e9ef] bg-white shadow-lg",
              panelClassName,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {children}
          </div>,
          document.body,
        )}
    </div>
  );
}
