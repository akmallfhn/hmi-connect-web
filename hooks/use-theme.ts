"use client";

import { useTheme as useNextTheme } from "next-themes";
import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

export function useTheme(): {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
} {
  const { theme, setTheme } = useNextTheme();
  // next-themes reads storage synchronously, so wait for mount to keep hydration identical.
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const activeTheme: Theme = mounted && theme === "dark" ? "dark" : "light";

  return {
    theme: activeTheme,
    setTheme: (nextTheme) => setTheme(nextTheme),
    toggleTheme: () => {
      const currentTheme = document.documentElement.classList.contains("dark")
        ? "dark"
        : "light";
      setTheme(currentTheme === "dark" ? "light" : "dark");
    },
  };
}
