import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Input } from "../../../components/Input";
import { Button } from "../../../components/Button";
import { Screen } from "../../../components/Screen";
import { colors, spacing, typography } from "../../../theme";
import { createProperty, lookupPinCode, PropertyTypeValue } from "../../../services/propertyApi";
import { rentRepository } from "../../../services/rentRepository";

const PROPERTY_TYPE_LABELS: Record<PropertyTypeValue, string> = {
  HOSTEL: "Hostel",
  RESIDENTIAL: "Residential / Home",
  RENTAL_ITEM: "Rental Items",
  OTHER: "Others",
};

const normalizeType = (value?: string | string[]): PropertyTypeValue => {
  const raw = Array.isArray(value) ? value[0] : value ?? "RESIDENTIAL";
  return raw === "HOSTEL" || raw === "RESIDENTIAL" || raw === "RENTAL_ITEM" || raw === "OTHER"
    ? raw
    : "RESIDENTIAL";
};

export default function AddPropertyDetails() {
  const router = useRouter();
  const params = useLocalSearchParams<{ propertyType?: string | string[] }>();
  const propertyType = normalizeType(params.propertyType);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [formErrors, setFormErrors] = useState<Partial<Record<"name" | "address" | "pincode" | "city" | "state", string>>>({});
  const [pinLoading, setPinLoading] = useState(false);
  const [locationLocked, setLocationLocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const checkScale = useRef(new Animated.Value(0.7)).current;
  const checkOpacity = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    if (pincode.length !== 6) {
      setPinLoading(false);
      setLocationLocked(false);
      setFormErrors((current) => ({ ...current, pincode: undefined }));
      return;
    }

    if (!/^\d{6}$/.test(pincode)) {
      setPinLoading(false);
      setLocationLocked(false);
      setFormErrors((current) => ({ ...current, pincode: "Please enter a valid 6-digit PIN code." }));
      return;
    }

    const timeoutId = setTimeout(async () => {
      setPinLoading(true);
      setFormErrors((current) => ({ ...current, pincode: undefined }));

      try {
        const result = await lookupPinCode(pincode);
        setCity(result.city);
        setState(result.state);
        setLocationLocked(true);
        setFormErrors((current) => ({ ...current, city: undefined, state: undefined }));
      } catch (error) {
        const message = error instanceof Error ? error.message : "We couldn't find this PIN code.";
        setLocationLocked(false);
        setCity("");
        setState("");
        setFormErrors((current) => ({ ...current, pincode: message }));
      } finally {
        setPinLoading(false);
      }
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [pincode]);

  useEffect(() => {
    if (!successVisible) return;

    Animated.parallel([
      Animated.spring(checkScale, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 8,
        speed: 18,
      }),
      Animated.timing(checkOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      router.back();
    }, 1600);

    return () => clearTimeout(timer);
  }, [checkOpacity, checkScale, router, successVisible]);

  const validateForm = () => {
    const nextErrors: Partial<Record<"name" | "address" | "pincode" | "city" | "state", string>> = {};

    if (!name.trim()) nextErrors.name = "Property name is required.";
    if (!address.trim()) nextErrors.address = "Address is required.";
    if (!/^\d{6}$/.test(pincode)) nextErrors.pincode = "Enter a valid 6-digit PIN code.";
    if (!city.trim()) nextErrors.city = "City or district is required.";
    if (!state.trim()) nextErrors.state = "State is required.";

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (isSubmitting || !validateForm()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        property_type: propertyType,
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
      };

      const created = await createProperty(payload);
      await rentRepository.addProperty({
        id: String(created.id ?? Date.now()),
        name: created.name,
        address: created.address,
        units: "1 unit",
        occupied: "0 occupied",
        property_type: created.property_type,
        city: created.city,
        state: created.state,
        pincode: created.pincode,
      });

      setSuccessVisible(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to add property.";
      Alert.alert("Unable to add property", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successVisible) {
    return (
      <Screen style={styles.successScreen}>
        <View style={styles.successCard}>
          <Animated.View
            style={[
              styles.successBadge,
              {
                opacity: checkOpacity,
                transform: [{ scale: checkScale }],
              },
            ]}
          >
            <Text style={styles.successCheck}>✓</Text>
          </Animated.View>
          <Text style={styles.successTitle}>Property Added</Text>
          <Text style={styles.successMessage}>
            {name.trim() || "Your property"} has been added successfully.
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll style={styles.screen}>
      <Text onPress={() => router.back()} style={styles.back}>‹</Text>
      <Text style={styles.title}>Add Property</Text>
      <Text style={styles.typeLabel}>Property type</Text>
      <View style={styles.typePill}>
        <Text style={styles.typePillText}>{PROPERTY_TYPE_LABELS[propertyType]}</Text>
      </View>

      <Input
        label="Property Name"
        value={name}
        onChangeText={setName}
        placeholder="Green Residency"
        error={formErrors.name}
        autoCapitalize="words"
      />
      <Input
        label="Address"
        value={address}
        onChangeText={setAddress}
        placeholder="Near Medical College"
        error={formErrors.address}
        autoCapitalize="words"
      />

      <Input
        label="PIN Code"
        value={pincode}
        onChangeText={(value) => setPincode(value.replace(/\D/g, "").slice(0, 6))}
        placeholder="673008"
        keyboardType="number-pad"
        maxLength={6}
        error={formErrors.pincode}
        editable={!isSubmitting}
      />

      {pinLoading ? (
        <View style={styles.lookupRow}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.lookupText}>Fetching location...</Text>
        </View>
      ) : null}

      <Input
        label="City / District"
        value={city}
        onChangeText={setCity}
        placeholder="Kozhikode"
        error={formErrors.city}
        editable={!locationLocked && !isSubmitting}
      />
      <Input
        label="State"
        value={state}
        onChangeText={setState}
        placeholder="Kerala"
        error={formErrors.state}
        editable={!locationLocked && !isSubmitting}
      />

      <View style={styles.footer}>
        <Button
          title={isSubmitting ? "Adding..." : "Add Property"}
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  back: { fontSize: 36, lineHeight: 35, marginTop: spacing.sm },
  title: { fontSize: 24, fontWeight: "800", marginBottom: spacing.md },
  typeLabel: { ...typography.label, color: colors.secondaryText, marginBottom: spacing.xs },
  typePill: {
    backgroundColor: "#edf4ff",
    borderRadius: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: "#d4e3ff",
  },
  typePillText: { fontSize: 15, fontWeight: "700", color: colors.primary },
  footer: { marginTop: spacing.lg },
  lookupRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  lookupText: { color: colors.secondaryText, fontSize: 12 },
  successScreen: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(248, 250, 252, 0.98)",
  },
  successCard: {
    width: "80%",
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e7eef8",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 6,
  },
  successBadge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#E8F8EE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  successCheck: { fontSize: 40, color: colors.success, fontWeight: "800" },
  successTitle: { fontSize: 24, fontWeight: "800", marginBottom: spacing.sm },
  successMessage: {
    fontSize: 15,
    color: colors.secondaryText,
    textAlign: "center",
    lineHeight: 22,
  },
});
