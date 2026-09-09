import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { colors, spacing, typography } from "../theme";
type Props = TextInputProps & { label: string; error?: string };
export function Input({ label, error, ...props }: Props) {
  return (
    <View style={styles.container}>
      {label ? (
        <Text style={[typography.label, styles.label]}>{label}</Text>
      ) : null}
      <TextInput
        {...props}
        style={[styles.input, error && styles.errorInput]}
        placeholderTextColor={colors.secondaryText}
      />
      {error ? (
        <Text style={[typography.caption, styles.error]}>{error}</Text>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { color: colors.text, marginBottom: spacing.xs },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 16,
  },
  errorInput: { borderColor: colors.error },
  error: { color: colors.error, marginTop: spacing.xs },
});
