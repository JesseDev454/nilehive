/**
 * OneClub Design Tokens
 * Nile University Campus One Design System
 * Light and Dark mode CSS variables and hex color references.
 */

export const ONECLUB_TOKENS = {
  colors: {
    light: {
      primary: "#0B57D0",
      primaryForeground: "#FFFFFF",
      primaryContainer: "#D3E3FD",
      primaryHover: "#0842A0",
      
      background: "#F8FAFD",
      surface1: "#FFFFFF", // Cards
      surface2: "#F1F3F4", // Muted / Hover
      
      foreground: "#1F1F1F",
      mutedForeground: "#5E5E5E",
      
      border: "#DADCE0",
      input: "#DADCE0",
      ring: "#0B57D0",
      
      success: "#0F5132",
      successForeground: "#FFFFFF",
      successContainer: "#CEEAD6",
      
      warning: "#B06000",
      warningForeground: "#FFFFFF",
      warningContainer: "#FEEFC3",
      
      destructive: "#B3261E",
      destructiveForeground: "#FFFFFF",
      destructiveContainer: "#FCE8E6"
    },
    dark: {
      primary: "#A8C7FA",
      primaryForeground: "#041E49",
      primaryContainer: "#0842A0",
      primaryHover: "#8AB4F8",
      
      background: "#111318",
      surface1: "#1D1F24", // Cards
      surface2: "#282A2F", // Muted / Hover
      
      foreground: "#E2E2E6",
      mutedForeground: "#C4C7C5",
      
      border: "#444746",
      input: "#444746",
      ring: "#A8C7FA",
      
      success: "#81C995",
      successForeground: "#0D4526",
      successContainer: "#0F5132",
      
      warning: "#FDD663",
      warningForeground: "#3B2600",
      warningContainer: "#5B3B00",
      
      destructive: "#F28B82",
      destructiveForeground: "#601410",
      destructiveContainer: "#8C1D18"
    }
  },
  radii: {
    sm: "8px",
    md: "12px", // 0.75rem (standard inputs, badges)
    lg: "16px", // 1.0rem (standard cards, dialogs)
    xl: "24px", // 1.5rem (large hero containers, floating sheets)
    full: "9999px" // Pills, round badges, avatars
  },
  typography: {
    fontFamily: "'Roboto Flex', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    weights: {
      regular: "400",
      medium: "500",
      semibold: "600",
      bold: "700"
    }
  },
  animation: {
    durationFast: "180ms",
    durationNormal: "240ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  }
} as const;

export type OneClubTokens = typeof ONECLUB_TOKENS;
export type OneClubThemeMode = "light" | "dark";
