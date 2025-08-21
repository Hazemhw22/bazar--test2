import { create } from "zustand";

type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: Theme;
  setResolvedTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "system",
  resolvedTheme: "light",
  setTheme: (theme) => set({ theme }),
  setResolvedTheme: (theme) => set({ resolvedTheme: theme }),
}));