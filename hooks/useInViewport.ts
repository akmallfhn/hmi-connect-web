"use client";

import { type RefObject, useEffect, useRef } from "react";

// Calls onChange(true/false) as the element crosses the visibility threshold.
export function useInViewport(
  ref: RefObject<Element | null>,
  onChange: (visible: boolean) => void,
  {
    threshold = 0.6,
    enabled = true,
  }: { threshold?: number; enabled?: boolean } = {},
) {
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    const element = ref.current;
    if (!enabled || !element || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => onChangeRef.current(entry.intersectionRatio >= threshold),
      { threshold: [0, threshold] },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [enabled, ref, threshold]);
}

// Autoplay is a motion preference too, so honor reduced motion.
export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
