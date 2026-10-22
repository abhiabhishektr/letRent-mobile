import React, { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { AppText } from "./AppText";
import { useThemedStyles } from "../theme";
import type { AppTheme } from "../theme";

type Props = {
  label: string;
  onPress: () => void;
};

const COLLAPSED_WIDTH = 56;
const EXPANDED_WIDTH = 150;

export function AnimatedFab({ label, onPress }: Props) {
  const styles = useThemedStyles(createStyles);
  const progress = useSharedValue(0);

  const containerStyle = useAnimatedStyle(() => ({
    width: interpolate(
      progress.value,
      [0, 1],
      [COLLAPSED_WIDTH, EXPANDED_WIDTH],
    ),
  }));
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(progress.value, [0, 1], [0, 45])}deg` }],
  }));
  const labelStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [-8, 0]) },
    ],
  }));

  useEffect(() => {
    progress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) }),
        withDelay(
          2200,
          withTiming(0, { duration: 450, easing: Easing.out(Easing.cubic) }),
        ),
        withDelay(5000, withTiming(0, { duration: 1 })),
      ),
      -1,
    );
    return () => cancelAnimation(progress);
  }, [progress]);

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        style={styles.pressable}
      >
        <Animated.View style={[styles.iconWrap, iconStyle]}>
          <AppText style={styles.icon}>+</AppText>
        </Animated.View>
        <Animated.View style={labelStyle}>
          <AppText variant="label" style={styles.label} numberOfLines={1}>
            {label}
          </AppText>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
    container: {
      position: "absolute",
      right: spacing.lg,
      bottom: spacing.lg,
      height: COLLAPSED_WIDTH,
      borderRadius: radius.pill,
      backgroundColor: colors.primary,
      overflow: "hidden",
      elevation: 5,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.22,
      shadowRadius: 5,
    },
    pressable: {
      width: EXPANDED_WIDTH,
      height: COLLAPSED_WIDTH,
      paddingHorizontal: spacing.md,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    iconWrap: {
      width: 32,
      alignItems: "center",
      justifyContent: "center",
    },
    icon: {
      color: colors.primaryForeground,
      fontSize: 32,
      lineHeight: 36,
      fontWeight: "400",
    },
    label: {
      color: colors.primaryForeground,
      fontWeight: "700",
    },
  });
}
