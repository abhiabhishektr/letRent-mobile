import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
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
  getLandlordTenancies,
  type Tenancy,
} from "../../services/tenancyApi";
import { createPlatformShadow, useThemedStyles } from "../../theme";
import type { AppTheme } from "../../theme";

export default function Tenants() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [allTenancies, setAllTenancies] = useState<Tenancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addTenantVisible, setAddTenantVisible] = useState(false);
  const router = useRouter();
  const styles = useThemedStyles(createStyles);

  const loadTenancies = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setAllTenancies(await getLandlordTenancies());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load tenants.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTenancies();
  }, [loadTenancies]);

  const filterGroups = useMemo<FilterGroup[]>(() => {
    const properties = new Map<number, string>();
    allTenancies.forEach((t) => properties.set(t.property_id, t.property_name));
    return [
      {
        key: "status",
        label: "Status",
        options: [
          { label: "Active", value: "ACTIVE" },
          { label: "Ended", value: "ENDED" },
        ],
      },
      {
        key: "property",
        label: "Property",
        options: Array.from(properties, ([id, name]) => ({
          label: name,
          value: String(id),
        })),
      },
    ];
  }, [allTenancies]);

  const tenants = useMemo(() => {
    const term = search.trim().toLowerCase();
    return allTenancies.filter(
      (t) =>
        (!term ||
          `${t.tenant_name} ${t.current_rent_schedule?.rent_amount ?? ""}`
            .toLowerCase()
            .includes(term)) &&
        (!filters.status || t.status === filters.status) &&
        (!filters.property || String(t.property_id) === filters.property),
    );
  }, [allTenancies, search, filters]);

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
        filters={filterGroups}
        selectedFilters={filters}
        onFilterChange={(key, value) =>
          setFilters((current) => ({ ...current, [key]: value }))
        }
      />

      {loading ? <ActivityIndicator style={styles.empty} /> : null}
      {error ? (
        <Text variant="bodySmall" color="textSecondary" style={styles.emptyCopy}>
          {error}
        </Text>
      ) : null}

      {tenants.map((tenant) => (
        <Pressable
          key={tenant.id}
          style={styles.row}
          onPress={() =>
            router.push({
              pathname: "/owner/tenants/[id]",
              params: { id: String(tenant.id) },
            })
          }
        >
          <View style={styles.avatar}>
            <Text variant="label">{tenant.tenant_name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.info}>
            <Text variant="label" style={styles.name}>{tenant.tenant_name}</Text>
            <Text variant="caption" color="textSecondary" style={styles.meta}>
              {[tenant.room_number, tenant.property_name].filter(Boolean).join(" · ")}
            </Text>
            <Text variant="caption" color="textSecondary" style={styles.meta}>
              {tenant.tenant_mobile_number}
            </Text>
            {tenant.current_rent_schedule ? (
              <Text variant="bodySmall" style={styles.amount}>
                ₹{Number(tenant.current_rent_schedule.rent_amount).toLocaleString("en-IN")}
                {` / ${tenant.current_rent_schedule.frequency.toLowerCase()}`}
              </Text>
            ) : null}
          </View>
          <Text
            variant="caption"
            style={tenant.status === "ACTIVE" ? styles.paid : styles.late}
          >
            {tenant.status}
          </Text>
        </Pressable>
      ))}

      {!loading && !error && !tenants.length ? (
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
        onAdded={() => {
          setSearch("");
          setFilters({});
          loadTenancies();
        }}
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
