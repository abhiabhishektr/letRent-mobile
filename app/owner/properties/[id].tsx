import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { AppText as Text } from "../../../components/AppText";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "../../../components/Screen";
import { useTheme, useThemedStyles } from "../../../theme";
import type { AppTheme } from "../../../theme";
import {
  deleteProperty,
  getProperty,
  PropertyResponse,
  PROPERTY_TYPE_LABELS,
} from "../../../services/propertyApi";

export default function PropertyDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const propertyId = Array.isArray(params.id) ? params.id[0] : params.id;
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const [property, setProperty] = useState<PropertyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!propertyId) {
      setLoading(false);
      return;
    }

    const loadProperty = async () => {
      setLoading(true);
      try {
        const next = await getProperty(propertyId);
        setProperty(next);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load property.";
        Alert.alert("Unable to load property", message);
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [propertyId]);

  const handleEdit = () => {
    if (!property) return;
    setMenuOpen(false);
    router.push({
      pathname: "/owner/properties/add",
      params: {
        mode: "edit",
        propertyId: String(property.id),
        propertyType: String(property.property_type),
        name: property.name,
        address: property.address,
        city: property.city,
        state: property.state,
        pincode: property.pincode,
      },
    });
  };

  const handleDelete = () => {
    if (!property) return;
    setMenuOpen(false);
    Alert.alert("Delete property?", `Are you sure you want to delete ${property.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteProperty(property.id);
            router.back();
          } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to delete property.";
            Alert.alert("Delete failed", message);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <Screen style={styles.loadingScreen}>
        <ActivityIndicator color={colors.primary} size="small" />
      </Screen>
    );
  }

  if (!property) {
    return (
      <Screen style={styles.emptyScreen}>
        <Text style={styles.emptyTitle}>Property not found</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button">
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>

        <Text style={styles.title}>{property.name}</Text>

        <View style={styles.actionWrap}>
          <Pressable onPress={() => setMenuOpen((current) => !current)} style={styles.gearButton} accessibilityRole="button">
            <Text style={styles.gearText}>⚙</Text>
          </Pressable>

          {menuOpen ? (
            <View style={styles.menuBox}>
              <Pressable onPress={handleEdit} style={styles.menuItem}>
                <Text style={styles.menuItemText}>Edit</Text>
              </Pressable>
              <Pressable onPress={handleDelete} style={styles.menuItemDanger}>
                <Text style={styles.menuItemDangerText}>Delete</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Property Type</Text>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{PROPERTY_TYPE_LABELS[property.property_type] ?? property.property_type}</Text>
        </View>
        <Text style={styles.address}>{property.address}</Text>
      </View>

      <View style={styles.detailsGrid}>
        <InfoCard label="City / District" value={property.city} />
        <InfoCard label="State" value={property.state} />
        <InfoCard label="PIN code" value={property.pincode} />
        <InfoCard label="Status" value={property.is_active === false ? "Inactive" : "Active"} />
      </View>
    </Screen>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
  screen: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  loadingScreen: { justifyContent: "center", alignItems: "center" },
  emptyScreen: { justifyContent: "center", alignItems: "center" },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: { fontSize: 28, color: colors.text, lineHeight: 28 },
  title: { flex: 1, fontSize: 24, fontWeight: "800", marginLeft: spacing.sm, marginRight: spacing.sm },
  actionWrap: { position: "relative", alignItems: "flex-end", zIndex: 2 },
  gearButton: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },
  gearText: { fontSize: 16, color: colors.textSecondary },
  menuBox: {
    position: "absolute",
    right: 0,
    top: 40,
    width: 128,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 6,
    shadowColor: colors.text,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 10,
  },
  menuItem: { paddingHorizontal: 12, paddingVertical: 10 },
  menuItemText: { fontSize: 14, color: colors.text, fontWeight: "600" },
  menuItemDanger: { paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border },
  menuItemDangerText: { fontSize: 14, color: colors.error, fontWeight: "600" },
  heroCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.text,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  heroLabel: { fontSize: 12, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.4 },
  typeBadge: {
    marginTop: spacing.sm,
    alignSelf: "flex-start",
    backgroundColor: colors.secondary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeText: { color: colors.primary, fontSize: 14, fontWeight: "700" },
  address: { marginTop: spacing.md, fontSize: 16, fontWeight: "600", color: colors.text, lineHeight: 24 },
  detailsGrid: {
    gap: spacing.sm,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  infoLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: spacing.xs },
  infoValue: { fontSize: 16, fontWeight: "700", color: colors.text },
});
}
