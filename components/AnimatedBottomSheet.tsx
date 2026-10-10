import React, { useCallback, useEffect } from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-worklets";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { colors } from "../theme";

type Props = {
  children: React.ReactNode;
  onClose: () => void;
};

export function AnimatedBottomSheet({ children, onClose }: Props) {
  const initialHeight = Dimensions.get("window").height;
  const windowHeight = useSharedValue(initialHeight);
  const sheetY = useSharedValue(initialHeight);
  const backdropOpacity = useSharedValue(0);
  const isClosing = useSharedValue(false);

  const close = useCallback(() => {
    if (isClosing.value) return;
    isClosing.value = true;
    backdropOpacity.value = withTiming(0, { duration: 180 });
    sheetY.value = withTiming(windowHeight.value, { duration: 220 }, (finished) => {
      if (finished) runOnJS(onClose)();
    });
  }, [backdropOpacity, isClosing, onClose, sheetY, windowHeight]);

  useEffect(() => {
    sheetY.value = withSpring(0, { damping: 24, stiffness: 220 });
    backdropOpacity.value = withTiming(1, { duration: 220 });
  }, [backdropOpacity, sheetY, windowHeight]);

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
        sheetY.value = withSpring(0, { damping: 24, stiffness: 220 });
      }
    });

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetY.value }],
  }));

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close login"
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
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
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
    borderRadius: 2,
    backgroundColor: colors.border,
  },
});
