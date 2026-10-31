import React, { useState, useRef, useEffect } from "react";
import {
  Alert,
  StyleSheet,
  View,
  TextInput,
  type TextInputInstance,
  Platform,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { AppText as Text } from "../components/AppText";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Button } from "../components/Button";
import {
  createPlatformShadow,
  useTheme,
  useThemedStyles,
} from "../theme";
import type { AppTheme } from "../theme";
import { useAuth } from "../context/AuthContext";

const OTP_LENGTH = 6;

export default function Otp() {
  const { verifyOtp, resendOtp, pendingPhone } = useAuth();
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendAfter, setResendAfter] = useState<number | null>(null);

  const inputRef = useRef<TextInputInstance>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 400);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (resendAfter === null || resendAfter <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setResendAfter((current) => (current !== null ? Math.max(0, current - 1) : current));
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendAfter]);

  const submit = async () => {
    if (otp.length < OTP_LENGTH) {
      Alert.alert("Missing OTP", "Please enter the full 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(otp);
    } catch (error) {
      Alert.alert(
        "Verification failed",
        error instanceof Error ? error.message : "Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendLoading || (resendAfter !== null && resendAfter > 0)) {
      return;
    }

    setResendLoading(true);
    try {
      const seconds = await resendOtp();
      setResendAfter(seconds > 0 ? seconds : 0);
    } catch (error) {
      Alert.alert(
        "Resend failed",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setResendLoading(false);
    }
  };

  const focusOtpInput = () => {
    inputRef.current?.blur();
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const resendLabel =
    resendLoading
      ? "Resending OTP..."
      : resendAfter !== null && resendAfter > 0
        ? `Resend OTP in ${resendAfter}s`
        : "Resend OTP";

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.topSection}>
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
                style={Platform.OS === "ios" ? { marginLeft: -2 } : {}}
              />
            </Pressable>

            <Animated.View
              entering={FadeInDown.duration(400)}
              style={styles.headerContainer}
            >
              <Text style={styles.title}>Verify your login</Text>
              <Text style={styles.subtitle}>
                We&apos;ve sent a 6-digit code to {pendingPhone || "your mobile number"}.
              </Text>
            </Animated.View>

            <Pressable style={styles.otpContainer} onPressIn={focusOtpInput}>
              {Array(OTP_LENGTH).fill(0).map((_, index) => {
                const char = otp[index] || "";
                const isCurrentCell = index === otp.length;
                const isLastCellFocused = index === OTP_LENGTH - 1 && otp.length === OTP_LENGTH;
                const isActive = isCurrentCell || isLastCellFocused;
                const isFilled = !!char;

                return (
                  <Animated.View
                    key={index}
                    entering={FadeInDown.delay(80 + index * 60).springify()}
                    style={[
                      styles.otpCell,
                      isFilled && styles.otpCellFilled,
                      isActive && styles.otpCellActive,
                    ]}
                  >
                    <Text style={styles.otpText}>{char}</Text>
                    {isActive && !char && <View style={styles.cursor} />}
                  </Animated.View>
                );
              })}
            </Pressable>

            <TextInput
              ref={inputRef}
              value={otp}
              onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ""))}
              maxLength={OTP_LENGTH}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
              showSoftInputOnFocus
              style={styles.hiddenInput}
              caretHidden={true}
            />

            <Animated.View
              entering={FadeInDown.delay(500).duration(350)}
            >
              <Button
                title={loading ? "Verifying OTP..." : "Verify OTP"}
                onPress={submit}
                loading={loading}
                disabled={otp.length !== OTP_LENGTH || loading}
                style={styles.primaryButton}
              />

              <Button
                title={resendLabel}
                onPress={handleResend}
                outline
                loading={resendLoading}
                disabled={resendLoading || (resendAfter !== null && resendAfter > 0)}
                style={styles.resendButton}
              />
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: Platform.OS === "ios" ? spacing.xl : spacing.lg,
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
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xxl,
    width: "100%",
  },
  otpCell: {
    width: 50,
    height: 60,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  otpCellFilled: {
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
  },
  otpCellActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    ...createPlatformShadow({
      color: colors.primary,
      opacity: 0.15,
      radius: 8,
      offset: { width: 0, height: 4 },
      android: { elevation: 4, shadowColor: colors.primary },
    }),
  },
  otpText: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
  },
  cursor: {
    position: "absolute",
    width: 2,
    height: 24,
    backgroundColor: colors.primary,
    borderRadius: radius.sm / 2,
  },
  hiddenInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
  primaryButton: {
    borderRadius: radius.lg,
    height: 56,
    marginBottom: spacing.md,
    ...createPlatformShadow({
      color: colors.primary,
      opacity: 0.18,
      radius: 12,
      offset: { width: 0, height: 8 },
      android: { elevation: 4 },
    }),
  },
  resendButton: {
    borderRadius: radius.lg,
    height: 52,
    marginTop: spacing.sm,
  },
});
}
