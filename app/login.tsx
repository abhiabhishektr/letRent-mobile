import React, { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Image,
} from "react-native";
import { AppText as Text } from "../components/AppText";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as Google from "expo-auth-session/providers/google";
import {
  exchangeCodeAsync,
  ResponseType,
} from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

import { AnimatedBottomSheet } from "../components/AnimatedBottomSheet";
import { Button } from "../components/Button";
import { createPlatformShadow, useTheme, useThemedStyles } from "../theme";
import type { AppTheme } from "../theme";
import { useAuth } from "../context/AuthContext";

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { beginLogin, loginWithGoogle } = useAuth();
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const extra = Constants.expoConfig?.extra;
  const googleWebClientId =
    typeof extra?.googleWebClientId === "string" ? extra.googleWebClientId : "";
  const googleAndroidClientId =
    typeof extra?.googleAndroidClientId === "string"
      ? extra.googleAndroidClientId
      : "";
  const googleIosClientId =
    typeof extra?.googleIosClientId === "string" ? extra.googleIosClientId : "";
  const oauthClientId =
    Platform.OS === "android"
      ? googleAndroidClientId || googleWebClientId
      : Platform.OS === "ios"
        ? googleIosClientId || googleWebClientId
        : googleWebClientId;
  const [googleRequest, , promptGoogleSignIn] = Google.useAuthRequest({
    webClientId: googleWebClientId,
    androidClientId: googleAndroidClientId || googleWebClientId,
    iosClientId: googleIosClientId || googleWebClientId,
    responseType: ResponseType.Code,
    shouldAutoExchangeCode: false,
    scopes: ["openid", "profile", "email"],
    selectAccount: true,
  });

  const closeLogin = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  const handleContinue = async () => {
    if (phone.length < 10) {
      Alert.alert("Invalid mobile number", "Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      await beginLogin(phone);
    } catch (error) {
      Alert.alert(
        "Unable to send OTP",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (Platform.OS === "android" && !googleAndroidClientId) {
      Alert.alert(
        "Google sign-in setup required",
        "Add an Android OAuth client ID in app.json to enable Google sign-in on Android.",
      );
      return;
    }

    if (Platform.OS === "ios" && !googleIosClientId) {
      Alert.alert(
        "Google sign-in setup required",
        "Add an iOS OAuth client ID in app.json to enable Google sign-in on iOS.",
      );
      return;
    }

    if (!googleRequest) {
      Alert.alert("Google sign-in", "Please wait for Google sign-in to finish loading.");
      return;
    }

    setGoogleLoading(true);
    try {
      const result = await promptGoogleSignIn();
      if (result.type === "cancel" || result.type === "dismiss") {
        return;
      }
      if (result.type !== "success") {
        throw new Error("Google sign-in was not completed. Please try again.");
      }

      const code = result.params.code;
      if (!code) {
        throw new Error("Google did not return an authorization code.");
      }

      const tokens = await exchangeCodeAsync(
        {
          clientId: oauthClientId,
          code,
          redirectUri: googleRequest.redirectUri,
          extraParams: googleRequest.codeVerifier
            ? { code_verifier: googleRequest.codeVerifier }
            : {},
        },
        Google.discovery,
      );

      if (!tokens.idToken || !tokens.accessToken) {
        throw new Error("Google did not return the required sign-in tokens.");
      }

      await loginWithGoogle(tokens.idToken, tokens.accessToken);
    } catch (error) {
      Alert.alert(
        "Google sign-in failed",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AnimatedBottomSheet onClose={closeLogin}>
      <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
            automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.topSection}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close login"
                onPress={closeLogin}
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.backButtonPressed,
                ]}
                hitSlop={8}
              >
                <AntDesign name="close" size={20} color={colors.text} />
              </Pressable>

              <View style={styles.headerContainer}>
                <Text style={styles.title}>Welcome back</Text>

                <Text style={styles.subtitle}>
                  Enter your mobile number to continue
                </Text>
              </View>

              <View style={styles.phoneContainer}>
                <Text style={styles.code}>+91</Text>

                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  style={styles.input}
                  maxLength={10}
                  placeholder="00000 00000"
                  placeholderTextColor={colors.placeholder}
                  selectionColor={colors.primary}
                  returnKeyType="done"
                />
              </View>

              <Button
                title={loading ? "Sending OTP..." : "Continue"}
                onPress={handleContinue}
                style={styles.primaryButton}
                disabled={phone.length < 10 || loading}
                loading={loading}
              />

              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />

                <Text style={styles.orText}>OR</Text>

                <View style={styles.dividerLine} />
              </View>

              <Button
                title={googleLoading ? "Connecting to Google..." : "Continue with Google"}
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
                onPress={handleGoogleSignIn}
                loading={googleLoading}
                disabled={!googleRequest || googleLoading}
                style={styles.social}
              />

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
                onPress={handleContinue}
                style={styles.social}
              />
            </View>

            <Text style={styles.terms}>
              By continuing, you agree to our{"\n"}
              <Text style={styles.link}>Terms & Conditions</Text>
              {" and "}
              <Text style={styles.link}>Privacy Policy</Text>
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AnimatedBottomSheet>
  );
}

function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
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
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
    marginTop: Platform.OS === "android" ? spacing.md : 0,
  },

  backButtonPressed: {
    opacity: 0.6,
    backgroundColor: colors.border,
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
    color: colors.textSecondary,
    fontWeight: "400",
    lineHeight: 22,
  },

  phoneContainer: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    backgroundColor: colors.inputBackground,
    borderRadius: radius.lg,
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
    borderRightColor: colors.border,
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

    ...createPlatformShadow({
      color: colors.primary,
      opacity: 0.2,
      radius: 8,
      offset: { width: 0, height: 4 },
      android: { elevation: 3 },
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
    backgroundColor: colors.border,
  },

  orText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    marginHorizontal: spacing.md,
    letterSpacing: 0.5,
  },

  social: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    height: 56,
  },

  googleIcon: {
    width: 24,
    height: 24,
  },

  terms: {
    fontSize: 13,
    textAlign: "center",
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: spacing.lg,
  },

  link: {
    color: colors.primary,
    fontWeight: "600",
  },
});
}
