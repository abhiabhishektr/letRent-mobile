import React from "react";
import { Text } from "react-native";
import type { TextProps } from "react-native";
import { useTheme } from "../theme";

export type TextVariant =
  | "display"
  | "heading"
  | "subheading"
  | "body"
  | "bodySmall"
  | "label"
  | "caption"
  | "button";

type Props = TextProps & {
  variant?: TextVariant;
  color?: string;
};

export function AppText({
  variant,
  color,
  style,
  ...props
}: Props) {
  const { colors, typography } = useTheme();
  return (
    <Text
      {...props}
      style={[
        variant ? typography[variant] : undefined,
        {
          fontFamily: typography.body.fontFamily,
          color: color ?? colors.text,
        },
        style,
      ]}
    />
  );
}
