import React, { useEffect, useMemo, useRef } from "react";
import { useRouter } from "expo-router";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "./AppText";
import { useTheme } from "../theme";
import { USE_NATIVE_DRIVER } from "../utils/nativeDriver";

type BottomNavItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  path: string;
};

const tenant: BottomNavItem[] = [
  { icon: "home-outline", label: "Home", path: "/tenant" },
  { icon: "card-outline", label: "Payment", path: "/tenant/payment" },
  { icon: "receipt-outline", label: "History", path: "/tenant/receipts" },
  { icon: "ellipsis-horizontal-circle-outline", label: "More", path: "/profile" },
];

const owner: BottomNavItem[] = [
  { icon: "home-outline", label: "Home", path: "/owner" },
  { icon: "business-outline", label: "Properties", path: "/owner/properties" },
  { icon: "people-outline", label: "Tenants", path: "/owner/tenants" },
  { icon: "ellipsis-horizontal-circle-outline", label: "More", path: "/profile" },
];

export function BottomNav({
  mode,
  active,
}: {
  mode: "tenant" | "owner";
  active: string;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, typography } = useTheme();
  const items = mode === "tenant" ? tenant : owner;
  const animations = useRef(items.map(() => new Animated.Value(0))).current;
  const styles = useMemo(
    () =>
      StyleSheet.create({
        nav: {
          flexDirection: "row",
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderColor: colors.border,
          paddingVertical: spacing.sm,
        },
        item: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          minHeight: 48,
          gap: spacing.xs,
        },
        label: {
          ...typography.caption,
          fontSize: 10,
          color: colors.textSecondary,
        },
        selected: { color: colors.primary, fontWeight: "800" },
      }),
    [colors, spacing, typography],
  );

  useEffect(() => {
    Animated.parallel(
      items.map(({ label }, index) =>
        Animated.spring(animations[index], {
          toValue: active === label ? 1 : 0,
          useNativeDriver: USE_NATIVE_DRIVER,
          speed: 18,
          bounciness: 6,
        }),
      ),
    ).start();
  }, [active, animations, items]);

  return (
    <View style={[styles.nav, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {items.map(({ icon, label, path }, index) => (
        <Pressable
          key={label}
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityState={{ selected: active === label }}
          onPress={() => {
            if (active !== label) router.replace(path as never);
          }}
          style={styles.item}
        >
          <Animated.View
            style={{
              alignItems: "center",
              opacity: animations[index].interpolate({
                inputRange: [0, 1],
                outputRange: [0.72, 1],
              }),
              transform: [{ scale: animations[index].interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.08] }) }],
            }}
          >
            <Ionicons
              name={icon}
              size={22}
              color={active === label ? colors.primary : colors.textSecondary}
            />
            <AppText style={[styles.label, active === label && styles.selected]}>
              {label}
            </AppText>
          </Animated.View>
        </Pressable>
      ))}
    </View>
  );
}
