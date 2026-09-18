import { Stack, usePathname } from "expo-router";
import { StyleSheet, View } from 'react-native';
import { AuthProvider } from "../context/AuthContext";
import { useAuth } from '../context/AuthContext';
import { BottomNav } from '../components/BottomNav';
import { ModeTransitionLoader } from '../components/ModeTransitionLoader';

function RootNavigator() {
  const { currentUser, isModeSwitching } = useAuth();
  const pathname = usePathname();
  const active = pathname.startsWith('/tenant/payment')
    ? 'Payment'
    : pathname.startsWith('/tenant/receipts')
      ? 'History'
      : pathname.startsWith('/owner/properties')
        ? 'Properties'
        : pathname.startsWith('/owner/tenants')
          ? 'Tenants'
          : pathname.startsWith('/profile') || pathname.startsWith('/edit-profile') || pathname.startsWith('/owner/bank-accounts')
            ? 'More'
            : 'Home';
  const showBottomNav = Boolean(currentUser) && (pathname.startsWith('/tenant') || pathname.startsWith('/owner') || pathname.startsWith('/profile') || pathname.startsWith('/edit-profile'));

  return (
    <View style={styles.root}>
      <View style={styles.stack}>
        <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
      </View>
      {showBottomNav ? <BottomNav mode={currentUser?.mode ?? 'tenant'} active={active} /> : null}
      {isModeSwitching ? <ModeTransitionLoader /> : null}
    </View>
  );
}
export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
const styles = StyleSheet.create({ root: { flex: 1 }, stack: { flex: 1 } });
