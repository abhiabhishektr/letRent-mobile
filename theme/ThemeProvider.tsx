import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Appearance, useColorScheme } from "react-native";
import { storage } from "../services/storage";
import { palettes } from "./colors";
import type { ThemeColors } from "./colors";
import { radius } from "./radius";
import { spacing } from "./spacing";
import { typography } from "./typography";

type ColorScheme = keyof typeof palettes;

export type AppTheme = {
  colorScheme: ColorScheme;
  colors: ThemeColors;
  radius: typeof radius;
  spacing: typeof spacing;
  typography: typeof typography;
  toggleColorScheme: () => void;
};

const THEME_STORAGE_KEY = "themePreference";

const ThemeContext = createContext<AppTheme | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [override, setOverride] = useState<ColorScheme | null>(null);
  const colorScheme: ColorScheme =
    override ?? (systemColorScheme === "dark" ? "dark" : "light");

  const userToggled = useRef(false);

  useEffect(() => {
    storage
      .get<ColorScheme>(THEME_STORAGE_KEY)
      .then((saved) => {
        if (!userToggled.current && (saved === "light" || saved === "dark")) setOverride(saved);
      })
      .catch(() => undefined);
  }, []);

  // Aligns native chrome (Alert, keyboard, pickers) with a manual choice.
  useEffect(() => {
    if (override) Appearance.setColorScheme(override);
  }, [override]);

  const toggleColorScheme = useCallback(() => {
    const next: ColorScheme = colorScheme === "dark" ? "light" : "dark";
    userToggled.current = true;
    setOverride(next);
    storage.set(THEME_STORAGE_KEY, next).catch(() => undefined);
  }, [colorScheme]);
  const theme = useMemo<AppTheme>(
    () => ({
      colorScheme,
      colors: palettes[colorScheme],
      radius,
      spacing,
      typography,
      toggleColorScheme,
    }),
    [colorScheme, toggleColorScheme],
  );

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error("useTheme must be used within a ThemeProvider.");
  }
  return theme;
}
