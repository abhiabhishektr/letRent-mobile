import React from "react";
import { ScrollView, StyleSheet, View, ViewStyle } from "react-native";
import { Screen } from "./Screen";
import { BottomNav } from "./BottomNav";
import { useAuth } from "../context/AuthContext";
/** Provides a persistent, bottom-aligned nav area for authenticated screens. */
export function AppShell({
  children,
  active,
  style,
  scroll = false,
}: {
  children: React.ReactNode;
  active: string;
  style?: ViewStyle;
  scroll?: boolean;
}) {
  const { mode } = useAuth();
  return (
    <Screen style={styles.screen}>
      {scroll ? (
        <ScrollView contentContainerStyle={[styles.scrollBody, style]} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : <View style={[styles.body, style]}>{children}</View>}
      <BottomNav mode={mode} active={active} />
    </Screen>
  );
}
const styles = StyleSheet.create({ screen: { padding: 0 }, body: { flex: 1 }, scrollBody: { flexGrow: 1 } });
