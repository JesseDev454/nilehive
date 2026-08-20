import React from "react";
import { Moon, Sun } from "lucide-react";
import { useOneClubTheme } from "../theme";
import { IconButton } from "./IconButton";

export interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ThemeToggle({ className = "", size = "md" }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useOneClubTheme();

  return (
    <IconButton
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      icon={
        isDark ? (
          <Sun className="h-4 w-4 text-amber-400 transition-transform duration-180 hover:rotate-45" />
        ) : (
          <Moon className="h-4 w-4 text-muted-foreground transition-transform duration-180 hover:-rotate-12" />
        )}
      variant="ghost"
      size={size}
      onClick={toggleTheme}
      className={`rounded-xl border border-transparent hover:border-border hover:bg-muted ${className}`}
    />
  );
}
