import { useTheme } from "@/shared/theme";
import { Moon, Palette, Sun, Check } from "lucide-react";

export function AdminThemePreferencesCard() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      id="admin-theme-preferences-card"
      className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xs"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/70 pb-3.5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Palette className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">
              Interface Display Mode
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Theme appearance for this browser session
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold text-primary capitalize">
          {theme === "dark" ? "Dark Mode" : "Light Mode"}
        </span>
      </div>

      {/* Theme Choice Buttons */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-1">
        {/* Light Theme Button */}
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={`flex items-center justify-between rounded-xl border p-3.5 text-left transition-all duration-180 ${
            !isDark
              ? "border-primary bg-primary/5 ring-1 ring-primary shadow-2xs"
              : "border-border bg-background hover:bg-muted/40 text-muted-foreground"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Sun className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground block">
                Light Appearance
              </span>
              <span className="text-[11px] text-muted-foreground">
                High contrast daylight palette
              </span>
            </div>
          </div>
          {!isDark && <Check className="h-4 w-4 text-primary shrink-0" />}
        </button>

        {/* Dark Theme Button */}
        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={`flex items-center justify-between rounded-xl border p-3.5 text-left transition-all duration-180 ${
            isDark
              ? "border-primary bg-primary/5 ring-1 ring-primary shadow-2xs"
              : "border-border bg-background hover:bg-muted/40 text-muted-foreground"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Moon className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground block">
                Dark Appearance
              </span>
              <span className="text-[11px] text-muted-foreground">
                Eye-safe evening contrast
              </span>
            </div>
          </div>
          {isDark && <Check className="h-4 w-4 text-primary shrink-0" />}
        </button>
      </div>
    </div>
  );
}
