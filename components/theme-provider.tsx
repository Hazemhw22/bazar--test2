"use client";
import { ReactNode, useEffect } from "react";
import { useThemeStore } from "../lib/theme-store";

interface ThemeProviderProps {
  children: ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme } = useThemeStore();

  // Sync theme with html class on mount and theme change
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    if (
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      root.classList.add("dark");
    } else {
      root.classList.add("light");
    }
  }, [theme]);

  return <>{children}</>;
}