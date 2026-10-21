import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { AppText as Text } from "../../components/AppText";
import { useRouter } from "expo-router";
import { AppShell } from "../../components/AppShell";
import { rentRepository } from "../../services/rentRepository";
import { useThemedStyles } from "../../theme";
import type { AppTheme } from "../../theme";
export default function Receipts() {
  const [d, setD] = useState<any[]>([]);
  const r = useRouter();
  const s = useThemedStyles(createStyles);
  useEffect(() => {
    rentRepository.getReceipts().then(setD);
  }, []);
  return (
    <AppShell active="History" style={s.content}>
      <Text onPress={() => r.back()} style={s.back}>
        ‹
      </Text>
      <Text style={s.title}>Payment History</Text>
      <Text style={s.sub}>Your rent receipts and transactions</Text>
      {d.map((x) => (
        <View key={x.id} style={s.row}>
          <View>
            <Text style={s.name}>{x.tenant}</Text>
            <Text style={s.meta}>{x.unit}</Text>
          </View>
          <View>
            <Text style={s.amount}>₹{x.amount.toLocaleString("en-IN")}</Text>
            <Text style={s.paid}>Paid</Text>
          </View>
        </View>
      ))}
    </AppShell>
  );
}
function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
  content: { padding: spacing.lg },
  back: { fontSize: 36, lineHeight: 35 },
  title: { fontSize: 24, fontWeight: "800", marginTop: spacing.sm },
  sub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: spacing.xl,
  },
  row: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  name: { fontSize: 15, fontWeight: "700" },
  meta: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  amount: { fontWeight: "800", textAlign: "right" },
  paid: {
    fontSize: 11,
    color: colors.success,
    fontWeight: "700",
    textAlign: "right",
    marginTop: 4,
  },
});
}
