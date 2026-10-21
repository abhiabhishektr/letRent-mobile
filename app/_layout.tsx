import { Stack, usePathname } from "expo-router";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "../context/AuthContext";
import { useAuth } from "../context/AuthContext";
import { BottomNav } from "../components/BottomNav";
import { ModeTransitionLoader } from "../components/ModeTransitionLoader";
import { ThemeProvider, useTheme } from "../theme";
import { StatusBar } from "expo-status-bar";

function RootNavigator() {
  const { currentUser, isModeSwitching } = useAuth();
  const { colorScheme } = useTheme();
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
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.root}>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <View style={styles.stack}>
          <Stack
            screenOptions={{ headerShown: false, animation: "none" }}
          >
            <Stack.Screen
              name="login"
              options={{
                presentation: "transparentModal",
                animation: "none",
                contentStyle: { backgroundColor: "transparent" },
                gestureEnabled: false,
              }}
            />
          </Stack>
        </View>
        {showBottomNav ? <BottomNav mode={currentUser?.mode ?? 'tenant'} active={active} /> : null}
        {isModeSwitching ? <ModeTransitionLoader /> : null}
      </View>
    </GestureHandlerRootView>
  );
}
export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
const styles = StyleSheet.create({ root: { flex: 1 }, stack: { flex: 1 } });
