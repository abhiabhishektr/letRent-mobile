import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
  View,
} from "react-native";
import type { ReactNode } from "react";
import { colors, spacing, typography } from "../theme";
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
  return (
    <Pressable
      accessibilityRole="button"
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
        <ActivityIndicator color={outline ? colors.primary : "#fff"} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text
            style={[
              typography.button,
              outline ? styles.outlineText : styles.text,
              !!icon && styles.titleWithIcon,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: 10,
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
  disabled: { backgroundColor: colors.disabled },
  pressed: { opacity: 0.75 },
  text: { color: "#fff" },
  outlineText: { color: colors.primary },
  content: { flexDirection: "row", alignItems: "center" },
  titleWithIcon: { marginLeft: spacing.sm },
});
