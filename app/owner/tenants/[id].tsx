import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { AppText as Text } from "../../../components/AppText";
import { Screen } from "../../../components/Screen";
import { getTenancy, type Tenancy } from "../../../services/tenancyApi";
import { useTheme, useThemedStyles } from "../../../theme";
import type { AppTheme } from "../../../theme";

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function TenantDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const tenancyId = Array.isArray(params.id) ? params.id[0] : params.id;
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const [tenancy, setTenancy] = useState<Tenancy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenancyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getTenancy(tenancyId)
      .then(setTenancy)
      .catch((error) =>
        Alert.alert(
          "Unable to load tenant",
          error instanceof Error ? error.message : "Unable to load tenant details.",
        ),
      )
      .finally(() => setLoading(false));
  }, [tenancyId]);

  if (loading) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator color={colors.primary} size="small" />
      </Screen>
    );
  }

  if (!tenancy) {
    return (
      <Screen style={styles.center}>
        <Text style={styles.emptyTitle}>Tenant not found</Text>
      </Screen>
    );
  }

  const rent = tenancy.current_rent_schedule;

  return (
    <Screen scroll style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button">
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
        <Text style={styles.title}>{tenancy.tenant_name}</Text>
        <Text variant="caption" style={tenancy.status === "ACTIVE" ? styles.active : styles.ended}>
          {tenancy.status}
        </Text>
      </View>

      <View style={styles.grid}>
        <InfoCard label="Mobile" value={tenancy.tenant_mobile_number} />
        <InfoCard label="Property" value={`${tenancy.property_name}, ${tenancy.property_city}`} />
        <InfoCard label="Room" value={tenancy.room_number || "—"} />
        <InfoCard label="Joined" value={formatDate(tenancy.accepted_at)} />
        {tenancy.ended_at ? <InfoCard label="Ended" value={formatDate(tenancy.ended_at)} /> : null}
        {rent ? (
          <>
            <InfoCard
              label="Rent"
              value={`₹${Number(rent.rent_amount).toLocaleString("en-IN")} / ${rent.frequency.toLowerCase()}`}
            />
            <InfoCard label="First due date" value={formatDate(rent.first_due_date)} />
            <InfoCard label="Rent effective from" value={formatDate(rent.effective_from)} />
            {rent.remarks ? <InfoCard label="Remarks" value={rent.remarks} /> : null}
          </>
        ) : null}
      </View>
    </Screen>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
    screen: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
    center: { justifyContent: "center", alignItems: "center" },
    emptyTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: spacing.sm,
      marginBottom: spacing.lg,
    },
    backButton: {
      width: 34,
      height: 34,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    backIcon: { fontSize: 28, color: colors.text, lineHeight: 28 },
    title: { flex: 1, fontSize: 24, fontWeight: "800", marginHorizontal: spacing.sm, color: colors.text },
    active: { color: colors.success, fontWeight: "800" },
    ended: { color: colors.info, fontWeight: "800" },
    grid: { gap: spacing.sm },
    infoCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
    },
    infoLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: spacing.xs },
    infoValue: { fontSize: 16, fontWeight: "600", color: colors.text },
  });
}
