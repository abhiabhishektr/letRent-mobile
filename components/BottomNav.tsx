import React, { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme";
const tenant = [
  ["⌂", "Home", "/tenant"],
  ["▣", "Payment", "/tenant/payment"],
  ["▤", "History", "/tenant/receipts"],
  ["•••", "More", "/profile"],
];
const owner = [
  ["⌂", "Home", "/owner"],
  ["▥", "Properties", "/owner/properties"],
  ["♙", "Tenants", "/owner/tenants"],
  ["•••", "More", "/profile"],
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
  const items = mode === "tenant" ? tenant : owner;
  const animations = useRef(items.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.parallel(
      items.map(([, label], index) =>
        Animated.spring(animations[index], {
          toValue: active === label ? 1 : 0,
          useNativeDriver: true,
          speed: 18,
          bounciness: 6,
        }),
      ),
    ).start();
  }, [active, animations, items]);

  return (
    <View style={[styles.nav, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {items.map(([icon, label, path], index) => (
        <Pressable
          key={label}
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
            <Text style={[styles.icon, active === label && styles.selected]}>
              {icon}
            </Text>
            <Text style={[styles.label, active === label && styles.selected]}>
              {label}
            </Text>
          </Animated.View>
        </Pressable>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  nav: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#edf0f5",
    paddingVertical: 8,
  },
  item: { flex: 1, alignItems: "center", gap: 3 },
  icon: { fontSize: 19, color: "#8a96a8" },
  label: { fontSize: 10, color: "#8a96a8" },
  selected: { color: colors.primary, fontWeight: "800" },
});
