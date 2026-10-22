import React, { useCallback, useEffect, useMemo } from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-worklets";
import Animated, {
  type WithSpringConfig,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { useTheme } from "../theme";

type Props = {
  children: React.ReactNode | ((close: () => void) => React.ReactNode);
  onClose: () => void;
  animation?: {
    openSpringConfig?: WithSpringConfig;
    closeDuration?: number;
    backdropOpenDuration?: number;
    backdropCloseDuration?: number;
  };
  accessibilityLabel?: string;
};

const DEFAULT_ANIMATION = {
  openSpringConfig: { damping: 24, stiffness: 220 },
  closeDuration: 220,
  backdropOpenDuration: 220,
  backdropCloseDuration: 180,
} satisfies NonNullable<Props["animation"]>;

export function AnimatedBottomSheet({
  children,
  onClose,
  animation,
  accessibilityLabel = "Close login",
}: Props) {
  const { colors, radius } = useTheme();
  const animationConfig = { ...DEFAULT_ANIMATION, ...animation };
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "transparent",
        },
        backdrop: {
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: colors.overlay,
        },
        sheet: {
          height: "92%",
          overflow: "hidden",
          borderTopLeftRadius: radius.xl,
          borderTopRightRadius: radius.xl,
          backgroundColor: colors.background,
        },
        dragHandleArea: {
          height: 28,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        },
        dragHandle: {
          width: 40,
          height: 4,
          borderRadius: radius.sm / 2,
          backgroundColor: colors.border,
        },
      }),
    [colors, radius],
  );
  const initialHeight = Dimensions.get("window").height;
  const windowHeight = useSharedValue(initialHeight);
  const sheetY = useSharedValue(initialHeight);
  const backdropOpacity = useSharedValue(0);
  const isClosing = useSharedValue(false);

  const close = useCallback(() => {
    if (isClosing.value) return;
    isClosing.value = true;
    backdropOpacity.value = withTiming(0, {
      duration: animationConfig.backdropCloseDuration,
    });
    sheetY.value = withTiming(
      windowHeight.value,
      { duration: animationConfig.closeDuration },
      (finished) => {
        if (finished) runOnJS(onClose)();
      },
    );
  }, [animationConfig.backdropCloseDuration, animationConfig.closeDuration, backdropOpacity, isClosing, onClose, sheetY, windowHeight]);

  useEffect(() => {
    sheetY.value = withSpring(0, animationConfig.openSpringConfig);
    backdropOpacity.value = withTiming(1, {
      duration: animationConfig.backdropOpenDuration,
    });
  }, [animationConfig.backdropOpenDuration, animationConfig.openSpringConfig, backdropOpacity, sheetY, windowHeight]);

  const panGesture = Gesture.Pan()
    .activeOffsetY(8)
    .failOffsetX([-20, 20])
    .onUpdate((event) => {
      if (!isClosing.value) {
        sheetY.value = Math.max(0, event.translationY);
      }
    })
    .onEnd((event) => {
      if (event.translationY > 100 || event.velocityY > 800) {
        runOnJS(close)();
      } else if (!isClosing.value) {
        sheetY.value = withSpring(0, animationConfig.openSpringConfig);
      }
    });

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetY.value }],
  }));
  const content = typeof children === "function" ? children(close) : children;

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={close}
        style={StyleSheet.absoluteFill}
      >
        <Animated.View style={[styles.backdrop, backdropStyle]} />
      </Pressable>
      <Animated.View style={[styles.sheet, sheetStyle]}>
        <GestureDetector gesture={panGesture}>
          <View style={styles.dragHandleArea}>
            <View style={styles.dragHandle} />
          </View>
        </GestureDetector>
        {content}
      </Animated.View>
    </View>
  );
}
