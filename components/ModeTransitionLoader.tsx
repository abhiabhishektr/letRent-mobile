import React, { useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, Animated, Image, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { useTheme } from '../theme';
import { USE_NATIVE_DRIVER } from '../utils/nativeDriver';

export function ModeTransitionLoader() {
  const { colors, typography, spacing } = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    overlay: { ...StyleSheet.absoluteFill, zIndex: 100, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
    card: { alignItems: 'center' },
    logo: { width: 128, height: 128 },
    brand: { ...typography.subheading, fontSize: 24, fontWeight: '800', color: colors.text, marginTop: spacing.xs },
    message: { ...typography.caption, color: colors.textSecondary, marginTop: 5 },
    spinner: { marginTop: spacing.lg },
  }), [colors, spacing, typography]);
  const pulse = useRef(new Animated.Value(0.96)).current;
  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([Animated.timing(pulse, { toValue: 1.04, duration: 700, useNativeDriver: USE_NATIVE_DRIVER }), Animated.timing(pulse, { toValue: 0.96, duration: 700, useNativeDriver: USE_NATIVE_DRIVER })]));
    animation.start();
    return () => animation.stop();
  }, [pulse]);
  return <View style={styles.overlay} accessibilityRole="progressbar" accessibilityLabel="Switching LetRent mode">
    <Animated.View style={[styles.card, { transform: [{ scale: pulse }] }]}><Image source={require('../assets/images/logo.png')} style={styles.logo} resizeMode="contain" /><AppText style={styles.brand}>LetRent</AppText><AppText style={styles.message}>Updating your workspace</AppText><ActivityIndicator color={colors.primary} style={styles.spinner} /></Animated.View>
  </View>;
}
