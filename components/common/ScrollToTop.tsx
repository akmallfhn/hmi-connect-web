"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Next.js scrolls to top when loading.tsx mounts, not when the real content replaces it, so force it here.
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
