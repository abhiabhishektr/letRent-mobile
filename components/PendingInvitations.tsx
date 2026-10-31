import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "./AppText";
import { Button } from "./Button";
import { Input } from "./Input";
import {
  acceptTenantInvitation,
  getPendingTenantInvitations,
  rejectTenantInvitation,
} from "../services/tenancyApi";
import type { PendingTenantInvitation } from "../services/tenancyApi";
import { useAuth } from "../context/AuthContext";
import { useTheme, useThemedStyles } from "../theme";
import type { AppTheme } from "../theme";

type Props = {
  compact?: boolean;
  onViewAll?: () => void;
};

function normalizePhone(value: string): string {
  return value.replace(/\D/g, "").slice(-10);
}

function formatCurrency(amount: string): string {
  const value = Number(amount);
  if (!Number.isFinite(value)) return `₹${amount}`;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string): string {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatFrequency(value: string): string {
  const frequency = value.toLowerCase();
  return frequency.charAt(0).toUpperCase() + frequency.slice(1);
}

function formatStatus(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function PendingInvitationCard({
  invitation,
  compact,
  submitting,
  disabled,
  onAccept,
  onReject,
}: {
  invitation: PendingTenantInvitation;
  compact: boolean;
  submitting: boolean;
  disabled: boolean;
  onAccept?: () => void;
  onReject?: () => void;
}) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const isPending = invitation.status.toUpperCase() === "PENDING";
  const statusColor = invitation.status.toUpperCase() === "EXPIRED"
    ? colors.error
    : isPending
      ? colors.warning
      : colors.textSecondary;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeading}>
        <View style={styles.cardCopy}>
          <AppText variant="subheading" style={styles.propertyName}>
            {invitation.property_name}
          </AppText>
          <AppText variant="bodySmall" color="textSecondary">
            Room {invitation.room_number || "—"}
          </AppText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: colors.surfaceSecondary }]}>
          <AppText variant="caption" style={{ color: statusColor }}>
            {formatStatus(invitation.status)}
          </AppText>
        </View>
      </View>

      <AppText variant="bodySmall" style={styles.rent}>
        {formatCurrency(invitation.rent_amount)} / {formatFrequency(invitation.frequency)}
      </AppText>

      {!compact ? (
        <>
          <View style={styles.details}>
            <AppText variant="caption" color="textSecondary">
              First rent due
            </AppText>
            <AppText variant="bodySmall">
              {formatDate(invitation.first_due_date)}
            </AppText>
          </View>
          {invitation.expires_at ? (
            <View style={styles.details}>
              <AppText variant="caption" color="textSecondary">
                Expires
              </AppText>
              <AppText variant="bodySmall">
                {formatDate(invitation.expires_at)}
              </AppText>
            </View>
          ) : null}
          {isPending ? (
            <View style={styles.actions}>
              <Button
                title="Accept Invitation"
                onPress={() => onAccept?.()}
                loading={submitting}
                disabled={disabled}
                style={styles.actionButton}
              />
              <Button
                title="Reject Invitation"
                onPress={() => onReject?.()}
                danger
                outline
                disabled={disabled}
                style={styles.actionButton}
              />
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

export function PendingInvitations({ compact = false, onViewAll }: Props) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { currentUser } = useAuth();
  const [invitations, setInvitations] = useState<PendingTenantInvitation[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [rejectingInvitation, setRejectingInvitation] =
    useState<PendingTenantInvitation | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const requestVersion = useRef(0);
  const isFocused = useRef(false);
  const submissionLock = useRef<number | null>(null);

  const recipientPhone = normalizePhone(currentUser?.phone ?? "");

  const refresh = useCallback(async (excludedIds: number[] = []) => {
    const version = ++requestVersion.current;
    setLoading(true);
    setError(null);

    try {
      const response = await getPendingTenantInvitations();
      if (version !== requestVersion.current || !isFocused.current) return;
      const excluded = new Set(excludedIds);
      const visibleInvitations = response.results.filter(
        (invitation) =>
          !excluded.has(invitation.id) &&
          recipientPhone.length === 10 &&
          normalizePhone(invitation.mobile_number) === recipientPhone,
      );
      setInvitations(visibleInvitations);
      setCount(visibleInvitations.length);
    } catch (fetchError) {
      if (version !== requestVersion.current || !isFocused.current) return;
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Unable to load pending invitations.",
      );
    } finally {
      if (version === requestVersion.current && isFocused.current) {
        setLoading(false);
      }
    }
  }, [recipientPhone]);

  useFocusEffect(
    useCallback(() => {
      isFocused.current = true;
      void refresh();
      return () => {
        isFocused.current = false;
        requestVersion.current += 1;
      };
    }, [refresh]),
  );

  const removeInvitationAndRefresh = async (invitation: PendingTenantInvitation) => {
    if (isFocused.current) {
      setInvitations((current) =>
        current.filter(({ id }) => id !== invitation.id),
      );
      setCount((current) => Math.max(0, current - 1));
      await refresh([invitation.id]);
    }
  };

  const submitAccept = async (invitation: PendingTenantInvitation) => {
    if (submissionLock.current !== null || !isFocused.current) return;
    submissionLock.current = invitation.id;
    setSubmittingId(invitation.id);
    try {
      await acceptTenantInvitation(invitation.id);
      await removeInvitationAndRefresh(invitation);
      if (isFocused.current) {
        Alert.alert("Invitation accepted", "Your tenancy is now active.");
      }
    } catch (actionError) {
      if (isFocused.current) {
        Alert.alert(
          "Unable to accept invitation",
          actionError instanceof Error
            ? actionError.message
            : "Please try again.",
        );
      }
    } finally {
      submissionLock.current = null;
      setSubmittingId(null);
    }
  };

  const confirmAccept = (invitation: PendingTenantInvitation) => {
    Alert.alert(
      "Accept invitation?",
      `Accept the invitation for ${invitation.property_name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Accept", onPress: () => void submitAccept(invitation) },
      ],
    );
  };

  const submitReject = async () => {
    if (
      !rejectingInvitation ||
      submissionLock.current !== null ||
      !isFocused.current
    ) {
      return;
    }
    const invitation = rejectingInvitation;
    submissionLock.current = invitation.id;
    setSubmittingId(invitation.id);
    try {
      await rejectTenantInvitation(invitation.id, rejectReason.trim());
      setRejectingInvitation(null);
      setRejectReason("");
      await removeInvitationAndRefresh(invitation);
      if (isFocused.current) {
        Alert.alert("Invitation rejected", "The invitation has been removed.");
      }
    } catch (actionError) {
      if (isFocused.current) {
        Alert.alert(
          "Unable to reject invitation",
          actionError instanceof Error
            ? actionError.message
            : "Please try again.",
        );
      }
    } finally {
      submissionLock.current = null;
      setSubmittingId(null);
    }
  };

  const openRejectDialog = (invitation: PendingTenantInvitation) => {
    setRejectReason("");
    setRejectingInvitation(invitation);
  };

  const preview = invitations[0];

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeading}>
        <AppText variant="subheading">Pending Invitations</AppText>
        <View style={styles.countBadge}>
          <AppText variant="caption" style={styles.countText}>
            {count}
          </AppText>
        </View>
      </View>

      {loading && invitations.length === 0 ? (
        <AppText variant="bodySmall" color="textSecondary">
          Loading invitations…
        </AppText>
      ) : null}
      {loading && invitations.length > 0 ? (
        <View style={styles.refreshing}>
          <ActivityIndicator size="small" color={colors.primary} />
          <AppText variant="caption" color="textSecondary">
            Refreshing invitations…
          </AppText>
        </View>
      ) : null}
      {error ? (
        <View style={styles.messageBlock}>
          <AppText variant="bodySmall" color="error">{error}</AppText>
          <Button
            title="Try again"
            onPress={() => void refresh()}
            outline
            style={styles.retryButton}
          />
        </View>
      ) : null}
      {!loading && !error && invitations.length === 0 ? (
        <AppText variant="bodySmall" color="textSecondary">
          No pending invitations.
        </AppText>
      ) : null}
      {invitations.length > 0 && compact ? (
        <>
          {preview ? (
            <PendingInvitationCard
              invitation={preview}
              compact
              submitting={false}
              disabled
            />
          ) : null}
          {count > 1 ? (
            <AppText variant="caption" color="textSecondary" style={styles.moreText}>
              +{count - 1} more {count === 2 ? "invitation" : "invitations"}
            </AppText>
          ) : null}
          {onViewAll ? (
            <Button
              title="View invitations"
              onPress={onViewAll}
              outline
              style={styles.viewButton}
            />
          ) : null}
        </>
      ) : null}
      {invitations.length > 0 && !compact ? (
        invitations.map((invitation) => (
          <PendingInvitationCard
            key={invitation.id}
            invitation={invitation}
            compact={false}
            submitting={submittingId === invitation.id}
            disabled={submittingId !== null}
            onAccept={() => confirmAccept(invitation)}
            onReject={() => openRejectDialog(invitation)}
          />
        ))
      ) : null}

      <Modal
        visible={rejectingInvitation !== null}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (submittingId === null) setRejectingInvitation(null);
        }}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <KeyboardAvoidingView
            style={styles.modalKeyboard}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <ScrollView
              contentContainerStyle={styles.modalBackdrop}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalCard}>
                <AppText variant="subheading">Reject invitation?</AppText>
                <AppText variant="bodySmall" color="textSecondary" style={styles.modalDescription}>
                  You can optionally tell the owner why you are declining.
                </AppText>
                <Input
                  label="Reason (optional)"
                  value={rejectReason}
                  onChangeText={setRejectReason}
                  multiline
                  maxLength={500}
                  style={styles.reasonInput}
                  editable={submittingId === null}
                />
                <View style={styles.actions}>
                  <Button
                    title="Cancel"
                    onPress={() => setRejectingInvitation(null)}
                    outline
                    disabled={submittingId !== null}
                    style={styles.actionButton}
                  />
                  <Button
                    title="Reject Invitation"
                    onPress={() => void submitReject()}
                    danger
                    loading={submittingId === rejectingInvitation?.id}
                    disabled={submittingId !== null}
                    style={styles.actionButton}
                  />
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
    section: {
      gap: spacing.sm,
    },
    sectionHeading: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginBottom: spacing.xs,
    },
    countBadge: {
      minWidth: 24,
      height: 24,
      paddingHorizontal: spacing.xs,
      borderRadius: radius.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.secondary,
    },
    countText: {
      color: colors.primary,
      fontWeight: "700",
    },
    card: {
      padding: spacing.md,
      gap: spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardHeading: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: spacing.sm,
    },
    cardCopy: {
      flex: 1,
      gap: spacing.xs,
    },
    propertyName: {
      color: colors.text,
    },
    statusBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.pill,
    },
    rent: {
      color: colors.text,
      fontWeight: "600",
    },
    details: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: spacing.sm,
    },
    actions: {
      flexDirection: "row",
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    actionButton: {
      flex: 1,
      minHeight: 44,
      paddingHorizontal: spacing.sm,
    },
    moreText: {
      textAlign: "right",
    },
    viewButton: {
      minHeight: 42,
    },
    messageBlock: {
      gap: spacing.sm,
    },
    refreshing: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    retryButton: {
      alignSelf: "flex-start",
      minHeight: 40,
    },
    modalBackdrop: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      flexGrow: 1,
      padding: spacing.lg,
      backgroundColor: colors.overlay,
    },
    modalSafeArea: {
      flex: 1,
    },
    modalKeyboard: {
      flex: 1,
    },
    modalCard: {
      width: "100%",
      maxWidth: 440,
      padding: spacing.lg,
      gap: spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
    },
    modalDescription: {
      marginBottom: spacing.sm,
    },
    reasonInput: {
      minHeight: 92,
      textAlignVertical: "top",
      paddingTop: spacing.md,
    },
  });
}
