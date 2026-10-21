export const brandColors = {
  blue: "#2563EB",
  green: "#15803D",
};

const lightColors = {
  primary: brandColors.blue,
  primaryForeground: "#FFFFFF",
  secondary: "#EEF2FF",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  surfaceSecondary: "#F1F5F9",
  text: "#0F172A",
  textSecondary: "#475569",
  secondaryText: "#475569",
  textDisabled: "#94A3B8",
  disabled: "#CBD5E1",
  border: "#E2E8F0",
  inputBackground: "#FFFFFF",
  placeholder: "#475569",
  success: brandColors.green,
  successForeground: "#FFFFFF",
  successBackground: "#DCFCE7",
  warning: "#B45309",
  error: "#B91C1C",
  info: "#0369A1",
  overlay: "rgba(15, 23, 42, 0.45)",
};

const darkColors = {
  primary: "#7AA7FF",
  primaryForeground: "#0B1B38",
  secondary: "#26344B",
  background: "#0B1220",
  surface: "#131E2E",
  surfaceSecondary: "#1C2A3D",
  text: "#F1F5F9",
  textSecondary: "#B0BDCE",
  secondaryText: "#B0BDCE",
  textDisabled: "#718096",
  disabled: "#475569",
  border: "#334155",
  inputBackground: "#131E2E",
  placeholder: "#94A3B8",
  success: "#4ADE80",
  successForeground: "#052E16",
  successBackground: "#123524",
  warning: "#FBBF24",
  error: "#F87171",
  info: "#38BDF8",
  overlay: "rgba(0, 0, 0, 0.65)",
};

export const palettes = {
  light: lightColors,
  dark: darkColors,
} as const;

export type ThemeColors = { [K in keyof typeof lightColors]: string };

// Keep the light palette export for existing screens as they are migrated.
export const colors: ThemeColors = lightColors;
