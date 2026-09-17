import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { AppShell } from "../components/AppShell";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { ModeSwitch } from "../components/ModeSwitch";
import { useAuth } from "../context/AuthContext";
import { colors, spacing } from "../theme";
export default function Profile() {
  const { currentUser, logout, mode, updateProfile } = useAuth();
  const r = useRouter();
  const [showDetails, setShowDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name ?? "Rahul");
  const [phone, setPhone] = useState(currentUser?.phone ?? "98765 43210");

  useEffect(() => {
    setName(currentUser?.name ?? "Rahul");
    setPhone(currentUser?.phone ?? "98765 43210");
  }, [currentUser]);

  const closeEdit = () => {
    setIsEditing(false);
    setName(currentUser?.name ?? "Rahul");
    setPhone(currentUser?.phone ?? "98765 43210");
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName || !trimmedPhone) return;

    await updateProfile({ name: trimmedName, phone: trimmedPhone });
    setIsEditing(false);
  };

  const details = [
    { label: "Name", value: currentUser?.name ?? "Rahul" },
    { label: "Mobile Number", value: `+91 ${currentUser?.phone ?? "98765 43210"}` },
    {
      label: "Role",
      value: mode === "owner" ? "Property owner" : "Tenant",
    },
  ];

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

      {showDetails ? (
        <View style={s.detailsCard}>
          <View style={s.detailsHeader}>
            <Text style={s.detailsTitle}>Personal details</Text>
            {!isEditing ? (
              <Button
                title="Edit"
                outline
                onPress={() => setIsEditing(true)}
                style={s.smallButton}
              />
            ) : null}
          </View>

          {isEditing ? (
            <View style={s.form}>
              <Input
                label="Name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
              <Input
                label="Mobile Number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <View style={s.actionRow}>
                <Button title="Cancel" outline onPress={closeEdit} style={s.actionButton} />
                <Button title="Save" onPress={handleSave} style={s.actionButton} />
              </View>
            </View>
          ) : (
            details.map((item) => (
              <View key={item.label} style={s.detailRow}>
                <Text style={s.detailLabel}>{item.label}</Text>
                <Text style={s.detailValue}>{item.value}</Text>
              </View>
            ))
          )}
        </View>
      ) : null}

      <View style={s.card}>
        {[
          ["◉", "Personal details"],
          ["♢", "Notifications"],
          ["?", "Help & Support"],
        ].map(([icon, label]) => (
          <Pressable
            key={label}
            style={s.row}
            onPress={() => {
              if (label === "Personal details") {
                setShowDetails(true);
                setIsEditing(false);
              }
            }}
          >
            <Text style={s.icon}>{icon}</Text>
            <Text style={s.rowText}>{label}</Text>
            <Text>›</Text>
          </Pressable>
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
  detailsCard: {
    marginTop: spacing.lg,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#edf0f5",
    padding: spacing.md,
  },
  detailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  detailsTitle: { fontSize: 18, fontWeight: "700" },
  smallButton: { minHeight: 36, paddingHorizontal: spacing.md },
  form: { marginTop: spacing.xs },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: spacing.md,
  },
  actionButton: { flex: 1 },
  detailRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderColor: "#edf0f5",
  },
  detailLabel: {
    fontSize: 12,
    color: colors.secondaryText,
    marginBottom: 2,
  },
  detailValue: { fontSize: 16, fontWeight: "600" },
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
