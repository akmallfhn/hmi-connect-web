"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const PULSE_DURATION = 350;

// Hold the tap pulse long enough to be visible on touch screens.
export function usePressPulse(duration = PULSE_DURATION) {
  const [pressed, setPressed] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function trigger() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setPressed(true);
    timeoutRef.current = setTimeout(() => setPressed(false), duration);
  }

  return [pressed, trigger] as const;
}

export function NavIconPulse({ pressed, children }: { pressed: boolean; children: ReactNode }) {
  return (
    <span className="relative inline-flex items-center justify-center">
      <span
        className={[
          "pointer-events-none absolute left-1/2 top-1/2 h-11 w-16 -translate-x-1/2 -translate-y-1/2 -z-10 rounded-full bg-primary/15 transition-all duration-300 ease-out",
          pressed ? "scale-100 opacity-100" : "scale-75 opacity-0",
        ].join(" ")}
      />
      {children}
    </span>
  );
}
