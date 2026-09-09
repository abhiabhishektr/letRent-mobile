import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";
export function ModeSwitch() {
  const { mode, switchMode } = useAuth();
  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => switchMode("tenant")}
        style={[styles.item, mode === "tenant" && styles.active]}
      >
        <Text style={[styles.text, mode === "tenant" && styles.activeText]}>
          Tenant
        </Text>
      </Pressable>
      <Pressable
        onPress={() => switchMode("owner")}
        style={[styles.item, mode === "owner" && styles.active]}
      >
        <Text style={[styles.text, mode === "owner" && styles.activeText]}>
          Owner
        </Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    backgroundColor: "#edf1f7",
    borderRadius: 18,
    padding: 3,
  },
  item: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15 },
  active: { backgroundColor: colors.primary },
  text: { fontSize: 11, fontWeight: "700", color: colors.secondaryText },
  activeText: { color: "#fff" },
});
