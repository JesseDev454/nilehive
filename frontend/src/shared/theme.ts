import React, { createContext, useContext, useEffect, useState } from "react";
import { type OneClubThemeMode } from "./tokens";

export interface ThemeContextValue {
  theme: OneClubThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: OneClubThemeMode) => void;
}

const STORAGE_KEY = "oneclub-theme";

export const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {}
});

export const useOneClubTheme = () => useContext(ThemeContext);
export const useTheme = useOneClubTheme;

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: OneClubThemeMode;
}

export function ThemeProvider({ children, defaultTheme = "light" }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<OneClubThemeMode>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "dark" || stored === "light") {
        return stored;
      }
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    root.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Storage unavailable fallback
    }
  }, [theme]);

  const setTheme = (newTheme: OneClubThemeMode) => {
    if (newTheme === "light" || newTheme === "dark") {
      setThemeState(newTheme);
    }
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const value: ThemeContextValue = {
    theme,
    isDark: theme === "dark",
    toggleTheme,
    setTheme
  };

  return React.createElement(ThemeContext.Provider, { value }, children);
}
