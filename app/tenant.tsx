import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { AppText as Text } from "../components/AppText";
import { useRouter } from "expo-router";
import { Screen } from "../components/Screen";
import { Button } from "../components/Button";
import { ModeSwitch } from "../components/ModeSwitch";
import { rentRepository } from "../services/rentRepository";
import { useThemedStyles } from "../theme";
import type { AppTheme } from "../theme";
export default function Tenant() {
  const [data, setData] = useState<any>();
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  useEffect(() => {
    rentRepository.getTenantDashboard().then(setData);
  }, []);
  if (!data) return null;
  return (
    <Screen style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.top}>
          <View>
            <Text style={styles.hello}>Hello, {data.tenant.name} 👋</Text>
            <Text style={styles.unit}>{data.tenant.unit}</Text>
          </View>
          <ModeSwitch />
        </View>
        <View style={styles.rent}>
          <View style={styles.row}>
            <Text style={styles.month}>{data.rent.month} Rent</Text>
            <Text style={styles.due}>Due</Text>
          </View>
          <Text style={styles.date}>{data.rent.dueOn}</Text>
          <Text style={styles.amount}>
            ₹{data.rent.amount.toLocaleString("en-IN")}
          </Text>
          <Button
            title="Pay Rent"
            onPress={() => router.push("/tenant/payment")}
            style={styles.pay}
          />
        </View>
        <Text style={styles.section}>Overview</Text>
        <View style={styles.overview}>
          {data.overview.map((x: any) => (
            <View key={x.label} style={styles.metric}>
              <Text style={styles.metricLabel}>{x.label}</Text>
              <Text style={styles.metricValue}>{x.value}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.section}>Quick Actions</Text>
        <View style={styles.actions}>
          {[
            ["▣", "Payment", "/tenant/payment"],
            ["▤", "Receipts", "/tenant/receipts"],
            ["⌂", "My Tenancy", "/tenant/receipts"],
            ["☎", "Contact Owner", "/profile"],
          ].map(([icon, label, path]) => (
            <View key={label} style={styles.action}>
              <Text style={styles.actionIcon}>{icon}</Text>
              <Text
                onPress={() => router.push(path as never)}
                style={styles.actionText}
              >
                {label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}
function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
  screen: { padding: 0 },
  content: { flex: 1, padding: spacing.lg },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  hello: { fontSize: 21, fontWeight: "800", color: colors.text },
  unit: { fontSize: 12, color: colors.textSecondary, marginTop: 3 },
  rent: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.lg,
    shadowColor: colors.text,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  month: { fontWeight: "800", fontSize: 15 },
  due: {
    backgroundColor: colors.surface,
    color: colors.error,
    fontSize: 11,
    fontWeight: "800",
    padding: 4,
    borderRadius: radius.sm / 2,
  },
  date: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
  amount: { fontSize: 24, fontWeight: "800", marginVertical: spacing.md },
  pay: { minHeight: 43 },
  section: {
    fontSize: 14,
    fontWeight: "800",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  overview: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metric: {
    flex: 1,
    padding: 10,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  metricLabel: { fontSize: 10, color: colors.textSecondary },
  metricValue: { fontWeight: "800", fontSize: 14, marginTop: 4 },
  actions: { flexDirection: "row", justifyContent: "space-between" },
  action: { alignItems: "center", width: "24%" },
  actionIcon: {
    fontSize: 20,
    color: colors.primary,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 9,
    borderRadius: 10,
  },
  actionText: {
    fontSize: 9,
    textAlign: "center",
    marginTop: 5,
    color: colors.text,
  },
});
}
