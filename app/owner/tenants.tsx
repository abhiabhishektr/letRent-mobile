import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import { AddTenantSheet } from "../../components/AddTenantSheet";
import { AppText as Text } from "../../components/AppText";
import { AppShell } from "../../components/AppShell";
import { Button } from "../../components/Button";
import { FilterGroup, SearchFilterBar } from "../../components/SearchFilterBar";
import {
  rentRepository,
  type OwnerTenant,
  type TenantQuery,
} from "../../services/rentRepository";
import { useThemedStyles } from "../../theme";
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
    <AppShell active="Tenants" scroll style={styles.content}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <Text style={styles.back}>‹</Text>
      </Pressable>
      <View style={styles.titleRow}>
        <View style={styles.titleContainer}>
          <Text variant="heading" style={styles.title}>Tenants</Text>
          <Text variant="bodySmall" color="textSecondary">
            {tenants.length} matching tenant{tenants.length === 1 ? "" : "s"}
          </Text>
        </View>
        <Button
          title="Add Tenant"
          onPress={() => setAddTenantVisible(true)}
          style={styles.addButton}
        />
      </View>

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
    content: { padding: spacing.lg, paddingBottom: spacing.xxl },
    backButton: { alignSelf: "flex-start", paddingRight: spacing.md },
    back: { fontSize: 36, lineHeight: 35, color: colors.text },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
      marginTop: spacing.sm,
      marginBottom: spacing.lg,
    },
    titleContainer: { flex: 1, gap: spacing.xs },
    title: { color: colors.text },
    addButton: { paddingHorizontal: spacing.md },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      borderBottomWidth: 1,
      borderColor: colors.border,
      paddingVertical: spacing.md,
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
