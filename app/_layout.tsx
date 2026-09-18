import { Stack } from "expo-router";
import { StyleSheet, View } from 'react-native';
import { AuthProvider } from "../context/AuthContext";
import { useAuth } from '../context/AuthContext';
import { ModeTransitionLoader } from '../components/ModeTransitionLoader';

function RootNavigator() {
  const { isModeSwitching } = useAuth();
  return <View style={styles.root}><Stack screenOptions={{ headerShown: false }} />{isModeSwitching ? <ModeTransitionLoader /> : null}</View>;
}
export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
const styles = StyleSheet.create({ root: { flex: 1 } });
