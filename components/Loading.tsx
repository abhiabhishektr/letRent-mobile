import React, { useMemo } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useTheme } from "../theme";
export function Loading() {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        },
      }),
    [colors],
  );
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
