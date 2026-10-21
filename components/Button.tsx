import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  ViewStyle,
  View,
} from "react-native";
import type { ReactNode } from "react";
import { AppText } from "./AppText";
import { useTheme } from "../theme";
type Props = {
  title: string;
  icon?: ReactNode;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  danger?: boolean;
  outline?: boolean;
  style?: ViewStyle;
};
export function Button({
  title,
  icon,
  onPress,
  loading,
  disabled,
  danger,
  outline,
  style,
}: Props) {
  const inactive = disabled || loading;
  const { colors, spacing, typography, radius } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        base: {
          minHeight: 48,
          borderRadius: radius.md,
          backgroundColor: colors.primary,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: spacing.lg,
        },
        danger: { backgroundColor: colors.error },
        outline: {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: colors.primary,
        },
        disabled: { backgroundColor: colors.surfaceSecondary, opacity: 0.7 },
        pressed: { opacity: 0.75 },
        text: { color: colors.primaryForeground },
        disabledText: { color: colors.textDisabled },
        outlineText: { color: colors.primary },
        content: { flexDirection: "row", alignItems: "center" },
        titleWithIcon: { marginLeft: spacing.sm },
      }),
    [colors, radius, spacing],
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: inactive, busy: Boolean(loading) }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        danger && styles.danger,
        outline && styles.outline,
        inactive && styles.disabled,
        pressed && !inactive && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={colors.primary}
        />
      ) : (
        <View style={styles.content}>
          {icon}
          <AppText
            style={[
              typography.button,
              outline ? styles.outlineText : styles.text,
              inactive && !loading && styles.disabledText,
              !!icon && styles.titleWithIcon,
            ]}
          >
            {title}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}
