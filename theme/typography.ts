import { Platform, StyleSheet } from "react-native";

export const fontFamilies = {
  sans: Platform.select({
    ios: "System",
    android: "sans-serif",
    default: "sans-serif",
  }),
} as const;

export const fontSizes = {
  caption: 12,
  bodySmall: 14,
  body: 16,
  subheading: 18,
  heading: 24,
  display: 32,
} as const;

export const lineHeights = {
  caption: 16,
  bodySmall: 20,
  body: 24,
  subheading: 24,
  heading: 30,
  display: 38,
} as const;

export const fontWeights = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  heavy: "800",
} as const;

export const typography = StyleSheet.create({
  display: {
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.display,
    lineHeight: lineHeights.display,
    fontWeight: fontWeights.heavy,
  },
  heading: {
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.heading,
    lineHeight: lineHeights.heading,
    fontWeight: fontWeights.bold,
  },
  subheading: {
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.subheading,
    lineHeight: lineHeights.subheading,
    fontWeight: fontWeights.semibold,
  },
  body: {
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.body,
    lineHeight: lineHeights.body,
  },
  bodySmall: {
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.bodySmall,
    lineHeight: lineHeights.bodySmall,
  },
  label: {
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.bodySmall,
    lineHeight: lineHeights.bodySmall,
    fontWeight: fontWeights.medium,
  },
  caption: {
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.caption,
    lineHeight: lineHeights.caption,
  },
  button: {
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.body,
    lineHeight: lineHeights.body,
    fontWeight: fontWeights.semibold,
  },
  screenTitle: {
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.heading,
    lineHeight: lineHeights.heading,
    fontWeight: fontWeights.bold,
  },
  sectionTitle: {
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.subheading,
    lineHeight: lineHeights.subheading,
    fontWeight: fontWeights.semibold,
  },
  secondary: {
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.bodySmall,
    lineHeight: lineHeights.bodySmall,
  },
});
