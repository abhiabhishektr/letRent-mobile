import React from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { AppShell } from "../components/AppShell";
import { Button } from "../components/Button";
import { ModeSwitch } from "../components/ModeSwitch";
import { useAuth } from "../context/AuthContext";
import { colors, spacing } from "../theme";
export default function Profile() {
  const { currentUser, logout, mode } = useAuth();
  const r = useRouter();
  return (
    <AppShell active="More" style={s.content}>
      <Text onPress={() => r.back()} style={s.back}>
        ‹
      </Text>
      <View style={s.top}>
        <Text style={s.title}>Profile</Text>
        <ModeSwitch />
      </View>
      <View style={s.avatar}>
        <Text style={s.avatarText}>{currentUser?.name?.[0] ?? "R"}</Text>
      </View>
      <Text style={s.name}>{currentUser?.name}</Text>
      <Text style={s.phone}>+91 {currentUser?.phone}</Text>
      <View style={s.card}>
        {[
          ["◉", "Personal details"],
          ["♢", "Notifications"],
          ["?", "Help & Support"],
        ].map(([icon, label]) => (
          <View key={label} style={s.row}>
            <Text style={s.icon}>{icon}</Text>
            <Text style={s.rowText}>{label}</Text>
            <Text>›</Text>
          </View>
        ))}
      </View>
      <Button
        title="Log out"
        outline
        onPress={() =>
          Alert.alert(
            "Log out?",
            "You will need the demo OTP to sign in again.",
            [
              { text: "Cancel" },
              { text: "Log out", style: "destructive", onPress: logout },
            ],
          )
        }
        style={s.logout}
      />
      <Text style={s.caption}>
        You are using LetRent as a{" "}
        {mode === "owner" ? "property owner" : "tenant"}.
      </Text>
    </AppShell>
  );
}
const s = StyleSheet.create({
  content: { padding: spacing.lg },
  back: { fontSize: 36, lineHeight: 35 },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 24, fontWeight: "800" },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#e8efff",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xl,
  },
  avatarText: { fontSize: 30, fontWeight: "800", color: colors.primary },
  name: { fontSize: 20, fontWeight: "800", marginTop: spacing.md },
  phone: { fontSize: 13, color: colors.secondaryText, marginTop: 3 },
  card: {
    marginTop: spacing.xl,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#edf0f5",
  },
  row: {
    padding: spacing.md,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#edf0f5",
  },
  icon: { fontSize: 18, color: colors.primary },
  rowText: { flex: 1, fontWeight: "600" },
  logout: { marginTop: spacing.xl },
  caption: {
    textAlign: "center",
    fontSize: 11,
    color: colors.secondaryText,
    marginTop: spacing.md,
  },
});
