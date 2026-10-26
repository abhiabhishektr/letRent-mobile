export const brandColors = {
  blue: "#353779",
  green: "#15803D",
};

const lightColors = {
  primary: brandColors.blue,
  primaryForeground: "#FFFFFF",
  secondary: "#EDECF8",
  background: "#FFFFFF",
  surface: "#F7F5FC",
  surfaceSecondary: "#F1EEF9",
  text: "#252653",
  textSecondary: "#55578A",
  secondaryText: "#55578A",
  textDisabled: "#77799A",
  disabled: "#E6E1F0",
  border: "#E6E1F0",
  inputBackground: "#FFFFFF",
  placeholder: "#77799A",
  success: brandColors.green,
  successForeground: "#FFFFFF",
  successBackground: "#DCFCE7",
  warning: "#B45309",
  error: "#B91C1C",
  info: "#0369A1",
  overlay: "rgba(15, 23, 42, 0.45)",
};

const darkColors = {
  primary: "#C7B8F0",
  primaryForeground: "#252653",
  secondary: "#383953",
  background: "#17182B",
  surface: "#22233B",
  surfaceSecondary: "#2C2D49",
  text: "#F4F0FF",
  textSecondary: "#C4BEDF",
  secondaryText: "#C4BEDF",
  textDisabled: "#A19ABF",
  disabled: "#383953",
  border: "#383953",
  inputBackground: "#17182B",
  placeholder: "#A19ABF",
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
