import { useCallback, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "me-health-theme";

function readInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // localStorage can throw in private-browsing modes; fall through.
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>(readInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Persisting the preference is best-effort only.
    }
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme((current) => (current === "dark" ? "light" : "dark")),
    []
  );

  return { theme, setTheme, toggleTheme, isDark: theme === "dark" };
}

/** Country line colours, tuned per theme so they stay legible on both canvases. */
export const COUNTRY_COLORS: Record<ThemeMode, Record<string, string>> = {
  light: {
    Iran: "#db2777",
    Turkey: "#dc2626",
    Azerbaijan: "#0891b2",
    "Saudi Arabia": "#059669",
    UAE: "#7c3aed",
    Egypt: "#d97706",
    Iraq: "#475569",
    Jordan: "#1d4ed8"
  },
  dark: {
    Iran: "#f472b6",
    Turkey: "#f87171",
    Azerbaijan: "#22d3ee",
    "Saudi Arabia": "#34d399",
    UAE: "#a78bfa",
    Egypt: "#fbbf24",
    Iraq: "#94a3b8",
    Jordan: "#60a5fa"
  }
};

/** Neutral colours Recharts needs as literal values rather than CSS classes. */
export const CHART_COLORS: Record<ThemeMode, {
  grid: string;
  axis: string;
  scatter: string;
  fit: string;
  groupA: string;
  groupB: string;
}> = {
  light: {
    grid: "#e2e8f0",
    axis: "#64748b",
    scatter: "#db2777",
    fit: "#0891b2",
    groupA: "#7c3aed",
    groupB: "#94a3b8"
  },
  dark: {
    grid: "#2a3852",
    axis: "#94a3b8",
    scatter: "#f472b6",
    fit: "#22d3ee",
    groupA: "#a78bfa",
    groupB: "#64748b"
  }
};

/** Diverging scale for the correlation matrix: red (−1) → neutral (0) → teal (+1). */
export function correlationColor(r: number, isDark: boolean): string {
  const magnitude = Math.min(Math.abs(r), 1);
  const alpha = 0.12 + magnitude * (isDark ? 0.62 : 0.75);
  return r >= 0
    ? `rgba(13, 148, 136, ${alpha.toFixed(3)})`
    : `rgba(225, 29, 72, ${alpha.toFixed(3)})`;
}
