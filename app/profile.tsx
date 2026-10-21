import React from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from '../components/AppText';
import { useRouter } from 'expo-router';
import { AppShell } from '../components/AppShell';
import { Button } from '../components/Button';
import { ModeSwitch } from '../components/ModeSwitch';
import { useAuth } from '../context/AuthContext';
import { useThemedStyles } from '../theme';
import type { AppTheme } from '../theme';

export default function Profile() {
  const { currentUser, logout, mode } = useAuth();
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const menu: Array<{ icon: string; label: string; onPress: () => void }> = [
    { icon: '◉', label: 'Personal details', onPress: () => router.push('/edit-profile') },
    ...(mode === 'owner' ? [{ icon: '▣', label: 'Bank accounts', onPress: () => router.push('/owner/bank-accounts') }] : []),
    { icon: '♢', label: 'Notifications', onPress: () => undefined },
    { icon: '?', label: 'Help & Support', onPress: () => undefined },
  ];

  return <AppShell active="More" style={styles.content}>
    <View style={styles.top}><Text style={styles.title}>Profile</Text><ModeSwitch /></View>
    <View style={styles.avatar}><Text style={styles.avatarText}>{currentUser?.name?.[0] ?? 'R'}</Text></View>
    <Text style={styles.name}>{currentUser?.name ?? 'Rahul'}</Text>
    <Text style={styles.phone}>+91 {currentUser?.phone ?? '98765 43210'}</Text>
    <View style={styles.card}>{menu.map(({ icon, label, onPress }) => <Pressable key={label} style={styles.row} onPress={onPress}>
      <Text style={styles.icon}>{icon}</Text><Text style={styles.rowText}>{label}</Text><Text style={styles.arrow}>›</Text>
    </Pressable>)}</View>
    <Button title="Log out" outline onPress={() => Alert.alert('Log out?', 'You will need the demo OTP to sign in again.', [{ text: 'Cancel' }, { text: 'Log out', style: 'destructive', onPress: logout }])} style={styles.logout} />
    <Text style={styles.caption}>You are using LetRent as a {mode === 'owner' ? 'property owner' : 'tenant'}.</Text>
  </AppShell>;
}
function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
    content: { padding: spacing.lg },
    top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: '800', color: colors.text },
    avatar: { width: 72, height: 72, borderRadius: radius.pill, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center', marginTop: spacing.xl },
    avatarText: { fontSize: 30, fontWeight: '800', color: colors.primary },
    name: { fontSize: 20, fontWeight: '800', color: colors.text, marginTop: spacing.md },
    phone: { fontSize: 13, color: colors.textSecondary, marginTop: 3 },
    card: { marginTop: spacing.xl, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
    row: { padding: spacing.md, flexDirection: 'row', gap: spacing.md, alignItems: 'center', borderBottomWidth: 1, borderColor: colors.border },
    icon: { fontSize: 18, color: colors.primary },
    rowText: { flex: 1, fontWeight: '600', color: colors.text },
    arrow: { fontSize: 22, color: colors.textSecondary },
    logout: { marginTop: spacing.xl },
    caption: { textAlign: 'center', fontSize: 11, color: colors.textSecondary, marginTop: spacing.md },
  });
}
