import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { AddTenantSheet } from "../../components/AddTenantSheet";
import { AnimatedFab } from "../../components/AnimatedFab";
import { AppText as Text } from "../../components/AppText";
import { AppShell } from "../../components/AppShell";
import { FilterGroup, SearchFilterBar } from "../../components/SearchFilterBar";
import {
  rentRepository,
  type OwnerTenant,
  type TenantQuery,
} from "../../services/rentRepository";
import { createPlatformShadow, useThemedStyles } from "../../theme";
import type { AppTheme } from "../../theme";

const FILTERS: FilterGroup[] = [
  {
    key: "status",
    label: "Payment status",
    options: [
      { label: "Paid", value: "Paid" },
      { label: "Due", value: "Due" },
      { label: "Late fee", value: "Late Fee" },
    ],
  },
  {
    key: "date",
    label: "Rent month",
    options: [
      { label: "September 2025", value: "2025-09" },
      { label: "August 2025", value: "2025-08" },
    ],
  },
  {
    key: "property",
    label: "Property",
    options: [
      { label: "Green View", value: "Green View Apartments" },
      { label: "Lake Side", value: "Lake Side Residency" },
      { label: "Palm Grove", value: "Palm Grove Villa" },
    ],
  },
];

export default function Tenants() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [tenants, setTenants] = useState<OwnerTenant[]>([]);
  const [addTenantVisible, setAddTenantVisible] = useState(false);
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const query = useMemo<TenantQuery>(
    () => ({
      search,
      status: filters.status as TenantQuery["status"],
      date: filters.date,
      property: filters.property,
    }),
    [search, filters],
  );

  useEffect(() => {
    rentRepository.getOwnerTenants(query).then(setTenants);
  }, [query]);

  const handleTenantAdded = (tenant: OwnerTenant) => {
    setSearch("");
    setFilters({});
    setTenants((current) => [tenant, ...current]);
  };

  return (
    <AppShell active="Tenants" style={styles.screenContent}>
      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
      <View style={styles.headerRow}>
        <Text onPress={() => router.back()} style={styles.back}>‹</Text>
        <Text style={styles.title}>Tenants</Text>
      </View>
      <Text style={styles.sub}>
        {tenants.length} matching tenant{tenants.length === 1 ? "" : "s"}
      </Text>

      <SearchFilterBar
        query={search}
        onQueryChange={setSearch}
        placeholder="Search name or rent amount"
        filters={FILTERS}
        selectedFilters={filters}
        onFilterChange={(key, value) =>
          setFilters((current) => ({ ...current, [key]: value }))
        }
      />

      {tenants.map((tenant) => (
        <View key={tenant.id} style={styles.row}>
          <View style={styles.avatar}>
            <Text variant="label">{tenant.tenant.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.info}>
            <Text variant="label" style={styles.name}>{tenant.tenant}</Text>
            <Text variant="caption" color="textSecondary" style={styles.meta}>
              {[tenant.unit, tenant.property].filter(Boolean).join(" · ")}
            </Text>
            {tenant.mobileNumber ? (
              <Text variant="caption" color="textSecondary" style={styles.meta}>
                {tenant.mobileNumber}
              </Text>
            ) : null}
            <Text variant="bodySmall" style={styles.amount}>
              ₹{tenant.amount.toLocaleString("en-IN")}
              {tenant.paymentFrequency ? ` / ${tenant.paymentFrequency}` : ""}
            </Text>
            <Text variant="caption" color="textSecondary" style={styles.meta}>
              {tenant.collectionDate
                ? `Collection date · ${tenant.date}`
                : tenant.date}
            </Text>
          </View>
          <Text
            variant="caption"
            style={
              tenant.status === "Paid"
                ? styles.paid
                : tenant.status === "Due"
                  ? styles.due
                  : styles.late
            }
          >
            {tenant.status}
          </Text>
        </View>
      ))}

      {!tenants.length ? (
        <View style={styles.empty}>
          <Text variant="subheading" style={styles.emptyTitle}>
            {search || Object.values(filters).some(Boolean)
              ? "No tenants found"
              : "No tenants yet"}
          </Text>
          <Text variant="bodySmall" color="textSecondary" style={styles.emptyCopy}>
            {search || Object.values(filters).some(Boolean)
              ? "Change the search or filters and try again."
              : "Add a tenant to start tracking rent collections."}
          </Text>
        </View>
      ) : null}
      </ScrollView>

      <AnimatedFab label="Add tenant" onPress={() => setAddTenantVisible(true)} />
      <AddTenantSheet
        visible={addTenantVisible}
        onClose={() => setAddTenantVisible(false)}
        onAdded={handleTenantAdded}
      />
    </AppShell>
  );
}

function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
    screenContent: { flex: 1, padding: 0 },
    listScroll: { flex: 1 },
    content: { padding: spacing.lg, paddingBottom: spacing.xxl + 56 },
    headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    back: { fontSize: 36, lineHeight: 35, marginRight: spacing.md, color: colors.text },
    title: { fontSize: 24, fontWeight: "800", marginTop: spacing.sm, flex: 1, color: colors.text },
    sub: { color: colors.textSecondary, fontSize: 13, marginTop: 4, marginBottom: spacing.lg },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
      ...createPlatformShadow({ color: colors.text, opacity: 0.06, radius: 8, elevation: 2 }),
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: radius.pill,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    info: { flex: 1, gap: spacing.xs },
    name: { color: colors.text, fontWeight: "800" },
    meta: { lineHeight: 16 },
    amount: { color: colors.text, fontWeight: "600" },
    paid: { color: colors.success, fontWeight: "800" },
    due: { color: colors.warning, fontWeight: "800" },
    late: { color: colors.info, fontWeight: "800" },
    empty: { alignItems: "center", paddingVertical: spacing.xxl },
    emptyTitle: { color: colors.text },
    emptyCopy: {
      color: colors.textSecondary,
      marginTop: spacing.xs,
      textAlign: "center",
    },
  });
}
