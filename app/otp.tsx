import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { colors, spacing, typography } from '../theme';
import { FIXED_OTP, useAuth } from '../context/AuthContext';

export default function Otp() {
  const { verifyOtp } = useAuth();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!otp.trim()) {
      Alert.alert('Missing OTP', 'Enter the one-time password.');
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(otp);
    } catch (error) {
      Alert.alert('Verification failed', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll style={styles.screen}>
      <View style={styles.header}>
        <Text style={[typography.screenTitle, styles.title]}>Verify your login</Text>
        <Text style={[typography.body, styles.subtitle]}>Enter the one-time password to continue.</Text>
      </View>
      <Input label="One-time password" value={otp} onChangeText={setOtp} placeholder="123456" keyboardType="number-pad" maxLength={6} autoCapitalize="none" />
      <Button title="Verify OTP" onPress={submit} loading={loading} />
      <View style={styles.demo}>
        <Text style={[typography.secondary, styles.demoTitle]}>Demo OTP</Text>
        <Text style={typography.caption}>Use {FIXED_OTP} for every login.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: 'center' },
  header: { marginBottom: spacing.xl },
  title: { color: colors.text },
  subtitle: { color: colors.secondaryText, marginTop: spacing.xs },
  demo: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  demoTitle: { fontWeight: '600', marginBottom: spacing.xs },
});
