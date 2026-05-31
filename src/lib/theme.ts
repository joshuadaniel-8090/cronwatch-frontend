export type ThemeMode = "dark" | "light";

export const THEME_STORAGE_KEY = "cronwatch-theme";

export function applyTheme(theme: ThemeMode) {
  if (typeof document === "undefined") return;

  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function getStoredTheme(): ThemeMode | null {
  if (typeof window === "undefined") return null;

  const value = localStorage.getItem(THEME_STORAGE_KEY);
  return value === "light" || value === "dark" ? value : null;
}

export function getInitialTheme(): ThemeMode {
  const storedTheme = getStoredTheme();
  if (storedTheme) return storedTheme;
  return "dark";
}
