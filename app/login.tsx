import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { AntDesign, FontAwesome } from "@expo/vector-icons";

import { Button } from "../components/Button";
import { colors, spacing } from "../theme";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [phone, setPhone] = useState("");

  const { beginLogin } = useAuth();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView style={styles.keyboardAvoidingView} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "none"}
        automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.topSection}>
          {/* Back Button */}
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}
            hitSlop={8}
          >
            <AntDesign
              name="left"
              size={20}
              color={colors.text}
              style={
                Platform.OS === "ios"
                  ? { marginLeft: -2 }
                  : undefined
              }
            />
          </Pressable>

          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Welcome back</Text>

            <Text style={styles.subtitle}>
              Enter your mobile number to continue
            </Text>
          </View>

          {/* Phone Input */}
          <View style={styles.phoneContainer}>
            <Text style={styles.code}>+91</Text>

            <TextInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={styles.input}
              maxLength={10}
              placeholder="00000 00000"
              placeholderTextColor={colors.secondaryText}
              selectionColor={colors.primary}
              returnKeyType="done"
            />
          </View>

          {/* Continue */}
          <Button
            title="Continue"
            onPress={() => beginLogin(phone)}
            style={styles.primaryButton}
            disabled={phone.length < 10}
          />

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />

            <Text style={styles.orText}>OR</Text>

            <View style={styles.dividerLine} />
          </View>

          {/* Google */}
          <Button
            title="Continue with Google"
            icon={
              <Image
                source={{
                  uri: "https://img.icons8.com/color/48/000000/google-logo.png",
                }}
                style={styles.googleIcon}
                resizeMode="contain"
              />
            }
            outline
            onPress={() => beginLogin(phone)}
            style={styles.social}
          />

          {/* Apple */}
          <Button
            title={
              Platform.OS === "ios"
                ? "Continue with Apple"
                : "Sign in with Apple"
            }
            icon={
              <FontAwesome
                name="apple"
                size={22}
                color={colors.text}
              />
            }
            outline
            onPress={() => beginLogin(phone)}
            style={styles.social}
          />
        </View>

        {/* Footer */}
        <Text style={styles.terms}>
          By continuing, you agree to our{"\n"}
          <Text style={styles.link}>Terms & Conditions</Text>
          {" and "}
          <Text style={styles.link}>Privacy Policy</Text>
        </Text>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background || "#FFFFFF",
  },

  keyboardAvoidingView: { flex: 1 },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom:
      Platform.OS === "ios" ? spacing.xl : spacing.lg,
    justifyContent: "space-between",
  },

  topSection: {
    flex: 1,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F4F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
    marginTop: Platform.OS === "android" ? spacing.md : 0,
  },

  backButtonPressed: {
    opacity: 0.6,
    backgroundColor: "#EAEAEC",
  },

  headerContainer: {
    marginBottom: spacing.xl,
  },

  title: {
    fontSize: Platform.OS === "ios" ? 28 : 26,
    fontWeight: Platform.OS === "ios" ? "700" : "bold",
    color: colors.text,
    letterSpacing: Platform.OS === "ios" ? 0.3 : 0,
    marginBottom: spacing.xs,
  },

  subtitle: {
    fontSize: 15,
    color: colors.secondaryText,
    fontWeight: "400",
    lineHeight: 22,
  },

  phoneContainer: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    backgroundColor: "#F9F9FA",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "transparent",
    marginBottom: spacing.lg,
  },

  code: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    paddingRight: spacing.sm,
    borderRightWidth: 1,
    borderRightColor: "#EAEAEC",
  },

  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: "500",
    paddingLeft: spacing.md,
    color: colors.text,
    height: "100%",
    letterSpacing: 1,
  },

  primaryButton: {
    borderRadius: 16,
    height: 56,

    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },

      android: {
        elevation: 3,
      },
    }),
  },

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.xl,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#EAEAEC",
  },

  orText: {
    color: colors.secondaryText,
    fontSize: 13,
    fontWeight: "600",
    marginHorizontal: spacing.md,
    letterSpacing: 0.5,
  },

  social: {
    backgroundColor: "#FFFFFF",
    borderColor: "#EAEAEC",
    borderWidth: 1,
    marginBottom: spacing.md,
    borderRadius: 16,
    height: 56,
  },

  googleIcon: {
    width: 24,
    height: 24,
  },

  terms: {
    fontSize: 13,
    textAlign: "center",
    color: colors.secondaryText,
    lineHeight: 20,
    marginTop: spacing.lg,
  },

  link: {
    color: colors.primary,
    fontWeight: "600",
  },
});
