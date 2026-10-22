import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AnimatedBottomSheet } from "./AnimatedBottomSheet";
import { AppText as Text } from "./AppText";
import { Button } from "./Button";
import { Input } from "./Input";
import {
  DEMO_PROPERTIES,
  rentRepository,
  type OwnerTenant,
  type PaymentFrequency,
  type Property,
} from "../services/rentRepository";
import { useThemedStyles } from "../theme";
import type { AppTheme } from "../theme";

type Props = {
  visible: boolean;
  onClose: () => void;
  onAdded: (tenant: OwnerTenant) => void;
};

type FormField =
  | "propertyId"
  | "tenant"
  | "mobileNumber"
  | "amount"
  | "paymentFrequency"
  | "collectionDate";

type FormValues = {
  propertyId: string;
  tenant: string;
  mobileNumber: string;
  unit: string;
  amount: string;
  paymentFrequency: PaymentFrequency | "";
  collectionDate: string;
};

const EMPTY_FORM: FormValues = {
  propertyId: "",
  tenant: "",
  mobileNumber: "",
  unit: "",
  amount: "",
  paymentFrequency: "",
  collectionDate: "",
};
const FREQUENCIES: PaymentFrequency[] = ["Daily", "Monthly", "Yearly"];
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function validateMobileNumber(value: string) {
  const compact = value.trim().replace(/[\s-]/g, "");
  return /^(?:\+?91)?[6-9]\d{9}$/.test(compact)
    ? compact.slice(-10)
    : null;
}

export function AddTenantSheet({ visible, onClose, onAdded }: Props) {
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles(createStyles);
  const [values, setValues] = useState<FormValues>({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Partial<Record<FormField, string>>>({});
  const [propertyPickerVisible, setPropertyPickerVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const closeSheetRef = useRef(onClose);
  const successNameRef = useRef<string | null>(null);
  closeSheetRef.current = onClose;

  const handleSheetClose = () => {
    onClose();
    if (successNameRef.current) {
      Alert.alert(
        "Tenant added",
        `${successNameRef.current} has been added successfully.`,
      );
      successNameRef.current = null;
    }
  };

  const selectedProperty = DEMO_PROPERTIES.find(
    (property) => property.id === values.propertyId,
  );
  const calendarDays = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return [
      ...Array.from({ length: firstWeekday }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ];
  }, [visibleMonth]);
  const calendarCells = useMemo(
    () =>
      calendarDays.map((day) => {
        if (day === null) return null;
        const date = new Date(
          visibleMonth.getFullYear(),
          visibleMonth.getMonth(),
          day,
        );
        return {
          day,
          key: dateKey(date),
          label: date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        };
      }),
    [calendarDays, visibleMonth],
  );

  const updateValue = <K extends keyof FormValues>(
    field: K,
    value: FormValues[K],
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors: Partial<Record<FormField, string>> = {};
    if (!selectedProperty) nextErrors.propertyId = "Choose a property.";
    if (!values.tenant.trim()) nextErrors.tenant = "Enter the tenant name.";
    if (!validateMobileNumber(values.mobileNumber)) {
      nextErrors.mobileNumber = "Enter a valid 10-digit Indian mobile number.";
    }
    if (values.amount.trim() === "") {
      nextErrors.amount = "Enter the rent amount.";
    } else if (
      !/^(?:\d+(\.\d{1,2})?|\.\d{1,2})$/.test(values.amount.trim()) ||
      !Number.isFinite(Number(values.amount)) ||
      Number(values.amount) <= 0
    ) {
      nextErrors.amount = "Enter a valid amount greater than zero.";
    }
    if (!values.paymentFrequency) {
      nextErrors.paymentFrequency = "Choose a payment frequency.";
    }
    if (!values.collectionDate) {
      nextErrors.collectionDate = "Choose a collection date.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async () => {
    if (submittingRef.current || !validate() || !selectedProperty) return;
    const mobileNumber = validateMobileNumber(values.mobileNumber);
    if (!mobileNumber || !values.paymentFrequency) return;

    submittingRef.current = true;
    setSubmitting(true);
    try {
      const tenant = await rentRepository.addOwnerTenant({
        propertyId: selectedProperty.id,
        property: selectedProperty.name,
        tenant: values.tenant.trim(),
        mobileNumber,
        unit: values.unit.trim() || undefined,
        amount: Number(values.amount),
        paymentFrequency: values.paymentFrequency,
        collectionDate: values.collectionDate,
      });
      onAdded(tenant);
      setValues({ ...EMPTY_FORM });
      setErrors({});
      setPropertyPickerVisible(false);
      setCalendarVisible(false);
      successNameRef.current = tenant.tenant;
      closeSheetRef.current();
    } catch (error) {
      Alert.alert(
        "Unable to add tenant",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const selectProperty = (property: Property) => {
    updateValue("propertyId", property.id);
    setPropertyPickerVisible(false);
  };

  const selectDate = (day: number) => {
    updateValue(
      "collectionDate",
      dateKey(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day)),
    );
    setCalendarVisible(false);
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      animationType="none"
      visible={visible}
      onRequestClose={() => closeSheetRef.current()}
      statusBarTranslucent
    >
      <AnimatedBottomSheet
        onClose={handleSheetClose}
        accessibilityLabel="Close add tenant form"
        animation={{
          closeDuration: 250,
          backdropCloseDuration: 200,
        }}
      >
        {(closeSheet) => {
          closeSheetRef.current = closeSheet;
          return (
          <KeyboardAvoidingView
            style={styles.form}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text variant="caption" style={styles.eyebrow}>NEW RENTAL</Text>
              <Text variant="heading" style={styles.title}>Add a tenant</Text>
              <Text variant="bodySmall" color="textSecondary">
                Add tenant details and rent schedule
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close add tenant form"
              onPress={closeSheet}
              style={styles.closeButton}
            >
              <Text style={styles.closeIcon}>×</Text>
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={[
              styles.formContent,
              { paddingBottom: insets.bottom + 24 },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionNumber}>
                  <Text variant="caption" style={styles.sectionNumberText}>1</Text>
                </View>
                <View style={styles.sectionCopy}>
                  <Text variant="subheading" style={styles.sectionTitle}>
                    Property details
                  </Text>
                  <Text variant="caption" color="textSecondary">
                    Choose where the tenant will be staying
                  </Text>
                </View>
              </View>
              <Text variant="label" style={styles.fieldLabel}>Property *</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Select property"
              accessibilityState={{ expanded: propertyPickerVisible }}
              onPress={() => setPropertyPickerVisible((current) => !current)}
              style={[styles.select, errors.propertyId && styles.errorBorder]}
            >
              <Text color={selectedProperty ? "text" : "placeholder"}>
                {selectedProperty?.name ?? "Choose a property"}
              </Text>
              <Text color="textSecondary">{propertyPickerVisible ? "⌃" : "⌄"}</Text>
            </Pressable>
            {errors.propertyId ? (
              <Text variant="caption" color="error" style={styles.errorText}>
                {errors.propertyId}
              </Text>
            ) : null}
            {propertyPickerVisible ? (
              <View style={styles.options}>
                {DEMO_PROPERTIES.map((property) => (
                  <Pressable
                    key={property.id}
                    accessibilityRole="button"
                    onPress={() => selectProperty(property)}
                    style={styles.option}
                  >
                    <Text>{property.name}</Text>
                    <Text variant="caption" color="textSecondary">
                      {property.address}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
              <View style={styles.unitLabelRow}>
                <Text variant="label" style={styles.fieldLabel}>
                  Room number / unit identifier
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="About the unit or vehicle identifier"
                  onPress={() =>
                    Alert.alert(
                      "Unit or vehicle identifier",
                      "For a property rental, enter the room or unit number (for example, 101 or A-204). For a vehicle rental, use this field for the vehicle registration number.",
                    )
                  }
                  style={styles.helpButton}
                >
                  <Text variant="caption" style={styles.helpText}>?</Text>
                </Pressable>
              </View>
              <Input
                label=""
                placeholder="e.g. 101, A-204, or Room 3"
                value={values.unit}
                onChangeText={(value) => updateValue("unit", value)}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionNumber}>
                  <Text variant="caption" style={styles.sectionNumberText}>2</Text>
                </View>
                <View style={styles.sectionCopy}>
                  <Text variant="subheading" style={styles.sectionTitle}>
                    Tenant information
                  </Text>
                  <Text variant="caption" color="textSecondary">
                    Add the tenant's contact details
                  </Text>
                </View>
              </View>
            <Input
              label="Tenant name *"
              placeholder="Enter full name"
              value={values.tenant}
              onChangeText={(value) => updateValue("tenant", value)}
              autoCapitalize="words"
              error={errors.tenant}
            />
            <Input
              label="Mobile number *"
              placeholder="10-digit mobile number"
              value={values.mobileNumber}
              onChangeText={(value) => updateValue("mobileNumber", value)}
              keyboardType="phone-pad"
              maxLength={14}
              error={errors.mobileNumber}
            />
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionNumber}>
                  <Text variant="caption" style={styles.sectionNumberText}>3</Text>
                </View>
                <View style={styles.sectionCopy}>
                  <Text variant="subheading" style={styles.sectionTitle}>
                    Rent schedule
                  </Text>
                  <Text variant="caption" color="textSecondary">
                    Set the rent amount and collection timing
                  </Text>
                </View>
              </View>
            <Input
              label="Rent amount *"
              placeholder="₹ 12,000"
              value={values.amount}
              onChangeText={(value) => updateValue("amount", value)}
              keyboardType="decimal-pad"
              error={errors.amount}
            />

            <Text variant="label" style={styles.fieldLabel}>
              Payment frequency *
            </Text>
            <View style={styles.frequencyRow}>
              {FREQUENCIES.map((frequency) => (
                <Pressable
                  key={frequency}
                  accessibilityRole="button"
                  accessibilityState={{
                    selected: values.paymentFrequency === frequency,
                  }}
                  onPress={() => updateValue("paymentFrequency", frequency)}
                  style={[
                    styles.frequencyOption,
                    values.paymentFrequency === frequency &&
                      styles.selectedFrequency,
                  ]}
                >
                  <Text
                    style={
                      values.paymentFrequency === frequency
                        ? styles.selectedFrequencyText
                        : undefined
                    }
                  >
                    {frequency}
                  </Text>
                </Pressable>
              ))}
            </View>
            {errors.paymentFrequency ? (
              <Text variant="caption" color="error" style={styles.errorText}>
                {errors.paymentFrequency}
              </Text>
            ) : null}

            <Text variant="label" style={styles.fieldLabel}>
              Collection date *
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Choose collection date"
              accessibilityState={{ expanded: calendarVisible }}
              onPress={() => setCalendarVisible((current) => !current)}
              style={[styles.select, errors.collectionDate && styles.errorBorder]}
            >
              <Text color={values.collectionDate ? "text" : "placeholder"}>
                {values.collectionDate
                  ? formatDate(values.collectionDate)
                  : "Choose a collection date"}
              </Text>
              <Text color="textSecondary">▦</Text>
            </Pressable>
            {errors.collectionDate ? (
              <Text variant="caption" color="error" style={styles.errorText}>
                {errors.collectionDate}
              </Text>
            ) : null}
            {calendarVisible ? (
              <View style={styles.calendar}>
                <View style={styles.calendarHeader}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Previous month"
                    onPress={() =>
                      setVisibleMonth(
                        (month) =>
                          new Date(month.getFullYear(), month.getMonth() - 1, 1),
                      )
                    }
                    style={styles.monthButton}
                  >
                    <Text>‹</Text>
                  </Pressable>
                  <Text variant="label">
                    {visibleMonth.toLocaleDateString("en-IN", {
                      month: "long",
                      year: "numeric",
                    })}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Next month"
                    onPress={() =>
                      setVisibleMonth(
                        (month) =>
                          new Date(month.getFullYear(), month.getMonth() + 1, 1),
                      )
                    }
                    style={styles.monthButton}
                  >
                    <Text>›</Text>
                  </Pressable>
                </View>
                <View style={styles.calendarGrid}>
                  {WEEKDAYS.map((weekday, index) => (
                    <Text
                      key={`${weekday}-${index}`}
                      variant="caption"
                      color="textSecondary"
                      style={styles.calendarCell}
                    >
                      {weekday}
                    </Text>
                  ))}
                  {calendarCells.map((cell, index) =>
                    cell === null ? (
                      <View
                        key={`blank-${index}`}
                        style={styles.calendarCell}
                      />
                    ) : (
                      <Pressable
                        key={cell.key}
                        accessibilityRole="button"
                        accessibilityLabel={`Select ${cell.label}`}
                        accessibilityState={{
                          selected: values.collectionDate === cell.key,
                        }}
                        onPress={() => selectDate(cell.day)}
                        style={[
                          styles.calendarCell,
                          values.collectionDate === cell.key &&
                            styles.selectedDay,
                        ]}
                      >
                        <Text
                          style={
                            values.collectionDate === cell.key
                              ? styles.selectedDayText
                              : undefined
                          }
                        >
                          {cell.day}
                        </Text>
                      </Pressable>
                    ),
                  )}
                </View>
              </View>
            ) : null}
            </View>

            <View style={styles.actions}>
              <Button
                title="Cancel"
                outline
                disabled={submitting}
                onPress={closeSheet}
                style={styles.actionButton}
              />
              <Button
                title="Add Tenant"
                loading={submitting}
                onPress={submit}
                style={styles.actionButton}
              />
            </View>
          </ScrollView>
          </KeyboardAvoidingView>
          );
        }}
      </AnimatedBottomSheet>
    </Modal>
  );
}

function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
    form: { flex: 1 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xs,
      paddingBottom: spacing.md,
    },
    headerCopy: { flex: 1, gap: spacing.xs },
    eyebrow: {
      color: colors.primary,
      fontWeight: "800",
      letterSpacing: 1,
    },
    title: { color: colors.text },
    closeButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.pill,
      backgroundColor: colors.surfaceSecondary,
    },
    closeIcon: { fontSize: 28, lineHeight: 30, color: colors.textSecondary },
    formContent: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
    },
    section: {
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    sectionNumber: {
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.pill,
      backgroundColor: colors.secondary,
    },
    sectionNumberText: { color: colors.primary, fontWeight: "800" },
    sectionCopy: { flex: 1, gap: spacing.xs },
    sectionTitle: { color: colors.text },
    fieldLabel: { color: colors.text, marginBottom: spacing.xs },
    unitLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
    helpButton: {
      width: 20,
      height: 20,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.textSecondary,
      borderRadius: radius.pill,
      marginBottom: spacing.xs,
    },
    helpText: { color: colors.textSecondary, fontWeight: "700", lineHeight: 18 },
    select: {
      minHeight: 48,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.inputBackground,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    errorBorder: { borderColor: colors.error },
    errorText: { color: colors.error, marginTop: spacing.xs, marginBottom: spacing.sm },
    options: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      marginTop: spacing.xs,
      marginBottom: spacing.md,
      overflow: "hidden",
    },
    option: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: spacing.xs,
    },
    frequencyRow: { flexDirection: "row", gap: spacing.sm },
    frequencyOption: {
      flex: 1,
      minHeight: 44,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor: colors.inputBackground,
    },
    selectedFrequency: {
      borderColor: colors.primary,
      backgroundColor: colors.secondary,
    },
    selectedFrequencyText: { color: colors.primary, fontWeight: "700" },
    calendar: {
      marginTop: spacing.sm,
      padding: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
    },
    calendarHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.sm,
    },
    monthButton: {
      width: 40,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
    },
    calendarGrid: { flexDirection: "row", flexWrap: "wrap" },
    calendarCell: {
      width: "14.2857%",
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    selectedDay: { borderRadius: radius.pill, backgroundColor: colors.primary },
    selectedDayText: { color: colors.primaryForeground, fontWeight: "700" },
    actions: {
      flexDirection: "row",
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    actionButton: { flex: 1 },
  });
}
