import React, { createContext, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";
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
};

const ThemeContext = createContext<AppTheme | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const colorScheme: ColorScheme = systemColorScheme === "dark" ? "dark" : "light";
  const theme = useMemo<AppTheme>(
    () => ({
      colorScheme,
      colors: palettes[colorScheme],
      radius,
      spacing,
      typography,
    }),
    [colorScheme],
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
