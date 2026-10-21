import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText as Text } from '../../components/AppText';
import { useRouter } from 'expo-router';
import { AppShell } from '../../components/AppShell';
import { FilterGroup, SearchFilterBar } from '../../components/SearchFilterBar';
import { OwnerTenant, rentRepository, TenantQuery } from '../../services/rentRepository';
import { useThemedStyles } from '../../theme';
import type { AppTheme } from '../../theme';

const FILTERS: FilterGroup[] = [
  { key: 'status', label: 'Payment status', options: [{ label: 'Paid', value: 'Paid' }, { label: 'Due', value: 'Due' }, { label: 'Late fee', value: 'Late Fee' }] },
  { key: 'date', label: 'Rent month', options: [{ label: 'September 2025', value: '2025-09' }, { label: 'August 2025', value: '2025-08' }] },
  { key: 'property', label: 'Property', options: [{ label: 'Green View', value: 'Green View Apartments' }, { label: 'Lake Side', value: 'Lake Side Residency' }, { label: 'Palm Grove', value: 'Palm Grove Villa' }] },
];
export default function Tenants() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [tenants, setTenants] = useState<OwnerTenant[]>([]);
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const query = useMemo<TenantQuery>(() => ({ search, status: filters.status as TenantQuery['status'], date: filters.date, property: filters.property }), [search, filters]);
  useEffect(() => { rentRepository.getOwnerTenants(query).then(setTenants); }, [query]);
  return <AppShell active="Tenants" scroll style={styles.content}>
    <Text onPress={() => router.back()} style={styles.back}>‹</Text>
    <Text style={styles.title}>Tenants</Text>
    <Text style={styles.sub}>{tenants.length} matching tenant{tenants.length === 1 ? '' : 's'}</Text>
    <SearchFilterBar query={search} onQueryChange={setSearch} placeholder="Search name or rent amount" filters={FILTERS} selectedFilters={filters} onFilterChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))} />
    {tenants.map((tenant) => <View key={tenant.id} style={styles.row}>
      <View style={styles.avatar}><Text>{tenant.tenant[0]}</Text></View><View style={styles.info}><Text style={styles.name}>{tenant.tenant}</Text><Text style={styles.meta}>{tenant.unit} · {tenant.property}</Text><Text style={styles.amount}>₹{tenant.amount.toLocaleString('en-IN')} · {tenant.date}</Text></View><Text style={tenant.status === 'Paid' ? styles.paid : tenant.status === 'Due' ? styles.due : styles.late}>{tenant.status}</Text>
    </View>)}
    {!tenants.length ? <View style={styles.empty}><Text style={styles.emptyTitle}>No tenants found</Text><Text style={styles.emptyCopy}>Change the search or filters and try again.</Text></View> : null}
  </AppShell>;
}
function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
    content: { padding: spacing.lg, paddingBottom: spacing.xxl },
    back: { fontSize: 36, lineHeight: 35, color: colors.text },
    title: { fontSize: 24, fontWeight: '800', color: colors.text, marginTop: spacing.sm },
    sub: { fontSize: 13, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.lg },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderBottomWidth: 1, borderColor: colors.border, paddingVertical: spacing.md },
    avatar: { width: 38, height: 38, borderRadius: radius.pill, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
    info: { flex: 1 },
    name: { fontSize: 14, fontWeight: '800', color: colors.text },
    meta: { fontSize: 11, color: colors.textSecondary, marginTop: spacing.xs },
    amount: { fontSize: 11, color: colors.text, marginTop: spacing.xs, fontWeight: '600' },
    paid: { color: colors.success, fontWeight: '800', fontSize: 11 },
    due: { color: colors.warning, fontWeight: '800', fontSize: 11 },
    late: { color: colors.info, fontWeight: '800', fontSize: 11 },
    empty: { alignItems: 'center', paddingVertical: spacing.xxl },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
    emptyCopy: { fontSize: 13, color: colors.textSecondary, marginTop: spacing.xs },
  });
}
