import React from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";

import { useAuth } from "../context/AuthContext";
import { colors, spacing } from "../theme";
import { AppMode } from "../types/user";

export default function SelectRole() {
  const { mode, switchMode, isModeSwitching } = useAuth();
  const router = useRouter();

  const chooseMode = async (selectedMode: AppMode) => {
    if (isModeSwitching) return;

    if (selectedMode === mode) {
      router.replace(selectedMode === "tenant" ? "/tenant" : "/owner");
      return;
    }

    try {
      await switchMode(selectedMode);
    } catch (error) {
      Alert.alert(
        "Unable to save your choice",
        error instanceof Error ? error.message : "Please try again.",
      );
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.intro}>
          <View style={styles.eyebrow}>
            <View style={styles.eyebrowDot} />
            <Text style={styles.eyebrowText}>LETRENT</Text>
          </View>
          <Text style={styles.title}>What brings you here?</Text>
          <Text style={styles.subtitle}>Choose your place to get started.</Text>
        </View>

        <View style={styles.options}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: isModeSwitching }}
            disabled={isModeSwitching}
            onPress={() => chooseMode("tenant")}
            style={({ pressed }) => [
              styles.option,
              pressed && styles.optionPressed,
              isModeSwitching && styles.optionDisabled,
            ]}
          >
            <View style={[styles.iconWrap, styles.tenantIconWrap]}>
              <AntDesign name="key" size={23} color={colors.primary} />
            </View>
            <View style={styles.optionCopy}>
              <Text style={styles.optionTitle}>I'm a tenant</Text>
              <Text style={styles.optionSubtitle}>My home and rent</Text>
            </View>
            <AntDesign name="arrow-right" size={20} color={colors.text} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: isModeSwitching }}
            disabled={isModeSwitching}
            onPress={() => chooseMode("owner")}
            style={({ pressed }) => [
              styles.option,
              pressed && styles.optionPressed,
              isModeSwitching && styles.optionDisabled,
            ]}
          >
            <View style={[styles.iconWrap, styles.ownerIconWrap]}>
              <AntDesign name="home" size={23} color={styles.ownerIcon.color as string} />
            </View>
            <View style={styles.optionCopy}>
              <Text style={styles.optionTitle}>I'm an owner</Text>
              <Text style={styles.optionSubtitle}>My properties and tenants</Text>
            </View>
            <AntDesign name="arrow-right" size={20} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.bottomMark}>
          <View style={styles.bottomLine} />
          <Text style={styles.bottomText}>A better way to rent</Text>
          <View style={styles.bottomLine} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background || "#FFFFFF",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  intro: {
    marginBottom: spacing.xl,
  },
  eyebrow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  eyebrowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: spacing.sm,
  },
  eyebrowText: {
    color: colors.secondaryText,
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    color: colors.text,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.secondaryText,
    fontSize: 16,
    lineHeight: 23,
  },
  options: {
    gap: spacing.md,
  },
  option: {
    minHeight: 112,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E7EAF0",
  },
  optionPressed: {
    backgroundColor: "#F7F8FA",
    borderColor: colors.primary,
  },
  optionDisabled: {
    opacity: 0.65,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  tenantIconWrap: {
    backgroundColor: "#EAF1FF",
  },
  ownerIconWrap: {
    backgroundColor: "#EAF7EF",
  },
  ownerIcon: {
    color: "#24834D",
  },
  optionCopy: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  optionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 4,
  },
  optionSubtitle: {
    color: colors.secondaryText,
    fontSize: 13,
    lineHeight: 18,
  },
  bottomMark: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xxl,
  },
  bottomLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E7EAF0",
  },
  bottomText: {
    color: colors.secondaryText,
    fontSize: 12,
    marginHorizontal: spacing.md,
  },
});