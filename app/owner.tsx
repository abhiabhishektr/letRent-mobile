import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Screen } from "../components/Screen";
import { BottomNav } from "../components/BottomNav";
import { ModeSwitch } from "../components/ModeSwitch";
import { rentRepository } from "../services/rentRepository";
import { colors, spacing } from "../theme";
export default function Owner() {
  const [data, setData] = useState<any>();
  useEffect(() => {
    rentRepository.getOwnerDashboard().then(setData);
  }, []);
  if (!data) return null;
  return (
    <Screen style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.top}>
          <Text style={styles.title}>Dashboard</Text>
          <ModeSwitch />
        </View>
        <View style={styles.collection}>
          <Text style={styles.small}>Total Collection (This Month)</Text>
          <Text style={styles.total}>
            ₹{data.collection.toLocaleString("en-IN")}
          </Text>
          <Text style={styles.change}>{data.change}</Text>
          <Text style={styles.chart}>⌁</Text>
        </View>
        <View style={styles.grid}>
          {data.metrics.map((m: any) => (
            <View key={m.label} style={styles.metric}>
              <Text style={[styles.metricIcon, { backgroundColor: m.color }]}>
                {m.icon}
              </Text>
              <View>
                <Text style={styles.label}>{m.label}</Text>
                <Text style={styles.value}>{m.value}</Text>
              </View>
            </View>
          ))}
        </View>
        <Text style={styles.recent}>
          Recent Collections <Text style={styles.view}>››</Text>
        </Text>
        {data.collections.slice(0, 2).map((c: any) => (
          <View key={c.id} style={styles.list}>
            <View>
              <Text style={styles.name}>{c.tenant}</Text>
              <Text style={styles.meta}>{c.unit}</Text>
              <Text style={styles.meta}>{c.date}</Text>
            </View>
            <Text style={styles.paid}>
              ₹{c.amount.toLocaleString("en-IN")} Paid
            </Text>
          </View>
        ))}
      </View>
      <BottomNav mode="owner" active="Home" />
    </Screen>
  );
}
const styles = StyleSheet.create({
  screen: { padding: 0 },
  content: { flex: 1, padding: spacing.lg },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 22, fontWeight: "800" },
  collection: {
    backgroundColor: "#10a64d",
    borderRadius: 12,
    marginTop: spacing.lg,
    padding: spacing.lg,
    overflow: "hidden",
  },
  small: { fontSize: 11, color: "#d9ffe7" },
  total: { fontSize: 26, fontWeight: "800", color: "#fff", marginVertical: 4 },
  change: { fontSize: 11, color: "#d9ffe7" },
  chart: {
    position: "absolute",
    right: 18,
    bottom: 16,
    fontSize: 38,
    color: "#b7f3cd",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: spacing.md,
  },
  metric: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#edf0f5",
  },
  metricIcon: { fontSize: 18, padding: 5, borderRadius: 7 },
  label: { fontSize: 11, color: colors.secondaryText },
  value: { fontSize: 17, fontWeight: "800", marginTop: 2 },
  recent: {
    fontSize: 14,
    fontWeight: "800",
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  view: { color: colors.secondaryText },
  list: {
    backgroundColor: "#fff",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#edf0f5",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  name: { fontWeight: "700", fontSize: 13 },
  meta: { color: colors.secondaryText, fontSize: 11, marginTop: 2 },
  paid: {
    color: "#149946",
    fontSize: 10,
    fontWeight: "800",
    alignSelf: "center",
    backgroundColor: "#e6f9eb",
    padding: 4,
    borderRadius: 4,
  },
});
