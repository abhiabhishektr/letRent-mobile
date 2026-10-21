import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import type { TextInputProps } from "react-native";
import { AppText } from "./AppText";
import { useTheme } from "../theme";

type Props = TextInputProps & { label: string; error?: string };
export function Input({
  label,
  error,
  style,
  editable = true,
  onFocus,
  onBlur,
  placeholderTextColor,
  accessibilityLabel,
  ...props
}: Props) {
  const { colors, spacing, typography, radius } = useTheme();
  const [focused, setFocused] = useState(false);
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { marginBottom: spacing.md },
        label: { color: colors.text, marginBottom: spacing.xs },
        input: {
          minHeight: 48,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.md,
          paddingHorizontal: spacing.md,
          backgroundColor: colors.inputBackground,
          color: colors.text,
          ...typography.body,
        },
        focusedInput: { borderColor: colors.primary },
        errorInput: { borderColor: colors.error },
        disabledInput: {
          backgroundColor: colors.surfaceSecondary,
          color: colors.textDisabled,
        },
        error: { color: colors.error, marginTop: spacing.xs },
      }),
    [colors, radius, spacing, typography],
  );

  return (
    <View style={styles.container}>
      {label ? (
        <AppText variant="label" style={styles.label}>{label}</AppText>
      ) : null}
      <TextInput
        {...props}
        accessibilityLabel={accessibilityLabel ?? label}
        editable={editable}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[
          styles.input,
          focused && styles.focusedInput,
          error && styles.errorInput,
          !editable && styles.disabledInput,
          style,
        ]}
        placeholderTextColor={placeholderTextColor ?? colors.placeholder}
      />
      {error ? (
        <AppText variant="caption" style={styles.error}>{error}</AppText>
      ) : null}
    </View>
  );
}
