import { Check, Moon, Sparkles, Sun } from "lucide-react";
import { useTheme } from "@/shared/theme";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/Card";

interface ExecutiveThemeCardProps {
  onThemeChanged?: (theme: "light" | "dark") => void;
}

export function ExecutiveThemeCard({ onThemeChanged }: ExecutiveThemeCardProps) {
  const { theme, setTheme } = useTheme();

  const handleSelectTheme = (selectedTheme: "light" | "dark") => {
    setTheme(selectedTheme);
    onThemeChanged?.(selectedTheme);
  };

  return (
    <Card className="border-border/80 bg-card shadow-xs">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <Sun className="h-4 w-4 text-primary" />
            <span>Theme &amp; Display Appearance</span>
          </CardTitle>
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
            Active: {theme} Mode
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-3 text-xs">
        <p className="text-muted-foreground text-[11px]">
          Configure your visual interface appearance for the OneClub executive suite. Preferences are saved locally to your device.
        </p>

        <div className="grid grid-cols-2 gap-3">
          {/* Light Theme Option */}
          <button
            type="button"
            onClick={() => handleSelectTheme("light")}
            className={`p-3.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition-all cursor-pointer ${
              theme === "light"
                ? "bg-primary text-primary-foreground border-primary shadow-xs ring-2 ring-primary/20"
                : "bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted border-border/70"
            }`}
            aria-pressed={theme === "light"}
          >
            <div className="flex items-center justify-between w-full">
              <Sun className="h-4 w-4" />
              {theme === "light" && <Check className="h-3.5 w-3.5" />}
            </div>
            <div className="text-left w-full space-y-0.5">
              <span className="block font-bold">Light Canvas</span>
              <span
                className={`text-[10px] block ${
                  theme === "light" ? "text-primary-foreground/80" : "text-muted-foreground"
                }`}
              >
                High-contrast daylight theme
              </span>
            </div>
          </button>

          {/* Dark Theme Option */}
          <button
            type="button"
            onClick={() => handleSelectTheme("dark")}
            className={`p-3.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition-all cursor-pointer ${
              theme === "dark"
                ? "bg-primary text-primary-foreground border-primary shadow-xs ring-2 ring-primary/20"
                : "bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted border-border/70"
            }`}
            aria-pressed={theme === "dark"}
          >
            <div className="flex items-center justify-between w-full">
              <Moon className="h-4 w-4" />
              {theme === "dark" && <Check className="h-3.5 w-3.5" />}
            </div>
            <div className="text-left w-full space-y-0.5">
              <span className="block font-bold">Dark Canvas</span>
              <span
                className={`text-[10px] block ${
                  theme === "dark" ? "text-primary-foreground/80" : "text-muted-foreground"
                }`}
              >
                Low-glare night atmosphere
              </span>
            </div>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
