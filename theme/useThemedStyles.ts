import { useMemo } from "react";
import { StyleSheet, type ImageStyle, type TextStyle, type ViewStyle } from "react-native";
import { useTheme } from "./ThemeProvider";
import type { AppTheme } from "./ThemeProvider";

export function useThemedStyles<T extends Record<string, ViewStyle | TextStyle | ImageStyle>>(
  createStyles: (theme: AppTheme) => T,
): T {
  const theme = useTheme();
  return useMemo(
    () => StyleSheet.create(createStyles(theme)),
    [createStyles, theme],
  );
}
