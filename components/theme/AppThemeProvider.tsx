"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

// next-themes is patched to skip its bootstrap script on client renders, which React 19 warns about.
export default function AppThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="hmi-connect-theme"
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
