import React from "react";
import { Redirect, useRouter } from "expo-router";
import { Pressable, StyleSheet, View, Dimensions } from "react-native";
import LottieView from "lottie-react-native";

import { AppText as Text } from "../components/AppText";
import { Screen } from "../components/Screen";
import { Button } from "../components/Button";
import { createPlatformShadow, useThemedStyles } from "../theme";
import type { AppTheme } from "../theme";
import { useAuth } from "../context/AuthContext";

const { width } = Dimensions.get("window");

export default function Welcome() {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();
  const styles = useThemedStyles(createStyles);

  if (isLoading) return null;

  if (currentUser) {
    return (
      <Redirect
        href={currentUser.mode === "tenant" ? "/tenant" : "/owner"}
      />
    );
  }

  return (
    <Screen style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome to</Text>
        <Text style={styles.brand}>
          LetRent <Text style={styles.wave}>👋</Text>
        </Text>
        <Text style={styles.copy}>
          Making rent payments{"\n"}
          simple and effortless.
        </Text>
      </View>

      {/* Illustration */}
      <View style={styles.illustrationContainer}>
        <View style={styles.illustrationBackground}>
          <LottieView
            source={require("../utils/building.json")}
            autoPlay
            loop
            style={styles.animation}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Get Started"
          onPress={() => router.push("/login")}
          style={styles.primaryButton}
        />
        <Pressable
          onPress={() => router.push("/login")}
          style={({ pressed }) => [
            styles.skipButton,
            pressed && styles.skipButtonPressed,
          ]}
        >
          <Text style={styles.skip}>Skip for now</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing.xl,
    alignItems: "flex-start",
  },
  welcome: {
    fontSize: 22,
    fontWeight: "500",
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  brand: {
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: -1.5,
    color: colors.primary, // Highlighted the brand name
    marginTop: 4,
    marginBottom: 12,
  },
  wave: {
    fontSize: 38,
  },
  copy: {
    fontSize: 18,
    lineHeight: 26,
    color: colors.text,
    fontWeight: "400",
    opacity: 0.8,
  },
  illustrationContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  illustrationBackground: {
    width: width * 0.8,
    height: width * 0.8,
    backgroundColor: colors.secondary,
    borderRadius: width * 0.4,
    alignItems: "center",
    justifyContent: "center",
    ...createPlatformShadow({
      color: colors.primary,
      opacity: 0.05,
      radius: 20,
      offset: { width: 0, height: 10 },
      elevation: 2,
    }),
  },
  animation: {
    width: "110%",
    height: "110%",
  },
  actions: {
    paddingBottom: spacing.lg,
    width: "100%",
  },
  primaryButton: {
    ...createPlatformShadow({
      color: colors.primary,
      opacity: 0.2,
      radius: 12,
      offset: { width: 0, height: 8 },
      elevation: 4,
    }),
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: spacing.lg,
    marginTop: spacing.sm,
  },
  skipButtonPressed: {
    opacity: 0.6,
  },
  skip: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
}