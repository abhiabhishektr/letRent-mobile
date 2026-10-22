import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "../components/AppText";
import { AppShell } from "../components/AppShell";
import { useTheme, useThemedStyles } from "../theme";
import type { AppTheme } from "../theme";

export default function Notifications() {
  const { colorScheme, colors, toggleColorScheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const isDark = colorScheme === "dark";

  return (
    <AppShell active="More" style={styles.content}>
      <View style={styles.top}>
        <AppText style={styles.title}>Notifications</AppText>
        <Pressable
          onPress={toggleColorScheme}
          hitSlop={4}
          style={styles.toggle}
          accessibilityRole="button"
          accessibilityLabel={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={22} color={colors.text} />
        </Pressable>
      </View>
      <AppText style={styles.empty}>You're all caught up.</AppText>
    </AppShell>
  );
}

function createStyles({ colors, spacing }: AppTheme) {
  return StyleSheet.create({
    content: { padding: spacing.lg },
    top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    title: { fontSize: 24, fontWeight: "800", color: colors.text },
    toggle: { width: 44, height: 44, alignItems: "center", justifyContent: "center", marginRight: -spacing.md },
    empty: { marginTop: spacing.xl, color: colors.textSecondary },
  });
}
