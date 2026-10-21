import React, { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../theme";
export function ModeSwitch() {
  const { mode, switchMode, isModeSwitching } = useAuth();
  const { colors, radius, spacing, typography } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          flexDirection: "row",
          backgroundColor: colors.surfaceSecondary,
          borderRadius: radius.xl,
          padding: 3,
        },
        item: {
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          borderRadius: radius.xl,
        },
        active: { backgroundColor: colors.primary },
        text: {
          ...typography.caption,
          fontWeight: "700",
          color: colors.textSecondary,
        },
        activeText: { color: colors.primaryForeground },
        disabled: { opacity: 0.65 },
      }),
    [colors, radius, spacing, typography],
  );

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: mode === "tenant", disabled: isModeSwitching }}
        onPress={() => switchMode("tenant")}
        disabled={isModeSwitching || mode === "tenant"}
        style={[styles.item, mode === "tenant" && styles.active, isModeSwitching && styles.disabled]}
      >
        <AppText style={[styles.text, mode === "tenant" && styles.activeText]}>
          Tenant
        </AppText>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: mode === "owner", disabled: isModeSwitching }}
        onPress={() => switchMode("owner")}
        disabled={isModeSwitching || mode === "owner"}
        style={[styles.item, mode === "owner" && styles.active, isModeSwitching && styles.disabled]}
      >
        <AppText style={[styles.text, mode === "owner" && styles.activeText]}>
          Owner
        </AppText>
      </Pressable>
    </View>
  );
}
