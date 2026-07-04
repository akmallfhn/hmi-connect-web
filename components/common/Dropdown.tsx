"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      {trigger({ open, toggle: () => setOpen((prev) => !prev) })}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className={[
            "absolute top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-[#e6e9ef] bg-white shadow-lg",
            align === "right" ? "right-0" : "left-0",
            panelClassName,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {children}
        </div>
      )}
    </div>
  );
}
