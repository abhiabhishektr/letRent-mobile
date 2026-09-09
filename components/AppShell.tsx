import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { Screen } from "./Screen";
import { BottomNav } from "./BottomNav";
import { useAuth } from "../context/AuthContext";

/** Provides a persistent, bottom-aligned nav area for authenticated screens. */
export function AppShell({
  children,
  active,
  style,
}: {
  children: React.ReactNode;
  active: string;
  style?: ViewStyle;
}) {
  const { mode } = useAuth();
  return (
    <Screen style={styles.screen}>
      <View style={[styles.body, style]}>{children}</View>
      <BottomNav mode={mode} active={active} />
    </Screen>
  );
}
const styles = StyleSheet.create({ screen: { padding: 0 }, body: { flex: 1 } });
