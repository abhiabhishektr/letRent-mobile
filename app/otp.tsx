import React, { useState, useRef, useEffect } from "react";
import { 
  Alert, 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  Platform,
  Pressable,
  KeyboardAvoidingView,
  ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";

import { Button } from "../components/Button";
import { colors, spacing } from "../theme";
import { useAuth } from "../context/AuthContext";

const OTP_LENGTH = 6;

export default function Otp() {
  const { verifyOtp } = useAuth();
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  
  // FIX: Added <TextInput> type to useRef
  const inputRef = useRef<TextInput>(null);

  // Auto-focus the hidden input when the screen mounts
  useEffect(() => {
    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 400); // Slight delay for smooth screen transition
    return () => clearTimeout(timeout);
  }, []);

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
        error instanceof Error ? error.message : "Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const focusOtpInput = () => {
    // On Android, dismissing the keyboard does not always blur the hidden input.
    // A no-op focus call then cannot re-open it, so reset native focus first.
    inputRef.current?.blur();
    setTimeout(() => inputRef.current?.focus(), 50);
  };

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
            {/* Back Button matching standard UI */}
            <Pressable 
              onPress={() => router.back()} 
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.backButtonPressed
              ]}
              hitSlop={8}
            >
              <AntDesign 
                name="left" 
                size={20} 
                color={colors.text} 
                style={Platform.OS === 'ios' ? { marginLeft: -2 } : {}} 
              />
            </Pressable>

            <View style={styles.headerContainer}>
              <Text style={styles.title}>Verify your login</Text>
              <Text style={styles.subtitle}>
                We've sent a 6-digit code to your mobile number.
              </Text>
            </View>

            {/* Custom OTP Input Boxes */}
            <Pressable style={styles.otpContainer} onPressIn={focusOtpInput}>
              {Array(OTP_LENGTH).fill(0).map((_, index) => {
                const char = otp[index] || "";
                const isCurrentCell = index === otp.length;
                const isLastCellFocused = index === OTP_LENGTH - 1 && otp.length === OTP_LENGTH;
                const isActive = isCurrentCell || isLastCellFocused;
                const isFilled = !!char;

                return (
                  <View 
                    key={index} 
                    style={[
                      styles.otpCell,
                      isFilled && styles.otpCellFilled,
                      isActive && styles.otpCellActive,
                    ]}
                  >
                    <Text style={styles.otpText}>{char}</Text>
                    {/* Simulated blinking cursor for active cell */}
                    {isActive && !char && <View style={styles.cursor} />}
                  </View>
                );
              })}
            </Pressable>

            {/* Hidden Input field handling native keyboard & auto-fill */}
            <TextInput
              ref={inputRef}
              value={otp}
              onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ''))}
              maxLength={OTP_LENGTH}
              keyboardType="number-pad"
              textContentType="oneTimeCode" // iOS SMS Auto-fill
              autoComplete="sms-otp" // Android SMS Auto-fill
              showSoftInputOnFocus
              style={styles.hiddenInput}
              caretHidden={true}
            />

            <Button 
              title="Verify OTP" 
              onPress={submit} 
              loading={loading} 
              disabled={otp.length !== OTP_LENGTH || loading}
              style={styles.primaryButton}
            />
          </View>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.lg,
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
    marginTop: Platform.OS === 'android' ? spacing.md : 0,
  },
  backButtonPressed: {
    opacity: 0.6,
    backgroundColor: "#EAEAEC",
  },
  headerContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: Platform.OS === 'ios' ? 28 : 26, 
    fontWeight: Platform.OS === 'ios' ? "700" : "bold",
    color: colors.text,
    letterSpacing: Platform.OS === 'ios' ? 0.3 : 0, 
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    color: colors.secondaryText,
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
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#EAEAEC", 
    alignItems: "center",
    justifyContent: "center",
  },
  otpCellFilled: {
    borderColor: "#D1D1D6", 
    backgroundColor: "#F9F9FA", 
  },
  otpCellActive: {
    borderColor: colors.primary, 
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
        shadowColor: colors.primary,
      },
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
    borderRadius: 1,
  },
  hiddenInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
  primaryButton: {
    borderRadius: 16,
    height: 56,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
});
