import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { AppText } from "./AppText";
import { useTheme } from "../theme";

export type FilterGroup = {
  key: string;
  label: string;
  options: Array<{ label: string; value: string }>;
};

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  placeholder: string;
  filters?: FilterGroup[];
  selectedFilters?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
};

export function SearchFilterBar({
  query,
  onQueryChange,
  placeholder,
  filters = [],
  selectedFilters = {},
  onFilterChange,
}: Props) {
  const [filtersVisible, setFiltersVisible] = useState(false);
  const activeCount = Object.values(selectedFilters).filter(Boolean).length;
  const { colors, spacing, radius, typography } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrapper: { marginBottom: spacing.lg },
        row: { flexDirection: "row", gap: spacing.sm },
        search: {
          flex: 1,
          minHeight: 48,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.inputBackground,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: spacing.md,
        },
        searchIcon: {
          fontSize: 23,
          color: colors.textSecondary,
          marginRight: spacing.sm,
        },
        input: {
          ...typography.bodySmall,
          flex: 1,
          color: colors.text,
          paddingVertical: 0,
        },
        filterButton: {
          minHeight: 48,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.inputBackground,
          justifyContent: "center",
          paddingHorizontal: spacing.md,
        },
        filterButtonActive: {
          backgroundColor: colors.secondary,
          borderColor: colors.primary,
        },
        filterText: {
          ...typography.caption,
          fontWeight: "700",
          color: colors.text,
        },
        filterTextActive: { color: colors.primary },
        filters: {
          marginTop: spacing.sm,
          padding: spacing.md,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.md,
        },
        group: { marginBottom: spacing.md },
        groupLabel: {
          ...typography.caption,
          fontWeight: "700",
          color: colors.textSecondary,
          marginBottom: spacing.sm,
        },
        chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
        chip: {
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.pill,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
        },
        chipActive: {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        },
        chipText: { ...typography.caption, color: colors.text },
        chipTextActive: {
          color: colors.primaryForeground,
          fontWeight: "700",
        },
      }),
    [colors, radius, spacing, typography],
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <View style={styles.search}>
          <AppText style={styles.searchIcon}>⌕</AppText>
          <TextInput
            value={query}
            onChangeText={onQueryChange}
            placeholder={placeholder}
            placeholderTextColor={colors.placeholder}
            style={styles.input}
            returnKeyType="search"
            accessibilityLabel={placeholder}
          />
        </View>
        {filters.length ? (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: filtersVisible }}
            onPress={() => setFiltersVisible((current) => !current)}
            style={[
              styles.filterButton,
              activeCount > 0 && styles.filterButtonActive,
            ]}
          >
            <AppText
              style={[
                styles.filterText,
                activeCount > 0 && styles.filterTextActive,
              ]}
            >
              {`≡ Filter${activeCount ? ` (${activeCount})` : ""}`}
            </AppText>
          </Pressable>
        ) : null}
      </View>
      {filtersVisible ? (
        <View style={styles.filters}>
          {filters.map((group) => (
            <View key={group.key} style={styles.group}>
              <AppText style={styles.groupLabel}>{group.label}</AppText>
              <View style={styles.chips}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: !selectedFilters[group.key] }}
                  onPress={() => onFilterChange?.(group.key, "")}
                  style={[
                    styles.chip,
                    !selectedFilters[group.key] && styles.chipActive,
                  ]}
                >
                  <AppText
                    style={[
                      styles.chipText,
                      !selectedFilters[group.key] && styles.chipTextActive,
                    ]}
                  >
                    All
                  </AppText>
                </Pressable>
                {group.options.map((option) => {
                  const selected =
                    selectedFilters[group.key] === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() =>
                        onFilterChange?.(
                          group.key,
                          selected ? "" : option.value,
                        )
                      }
                      style={[
                        styles.chip,
                        selected && styles.chipActive,
                      ]}
                    >
                      <AppText
                        style={[
                          styles.chipText,
                          selected && styles.chipTextActive,
                        ]}
                      >
                        {option.label}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
