import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, spacing } from '../theme';

export type FilterGroup = { key: string; label: string; options: Array<{ label: string; value: string }> };
type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  placeholder: string;
  filters?: FilterGroup[];
  selectedFilters?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
};

/** Reusable client-side controls; pass the same query object to a future API. */
export function SearchFilterBar({ query, onQueryChange, placeholder, filters = [], selectedFilters = {}, onFilterChange }: Props) {
  const [filtersVisible, setFiltersVisible] = useState(false);
  const activeCount = Object.values(selectedFilters).filter(Boolean).length;
  return <View style={styles.wrapper}>
    <View style={styles.row}>
      <View style={styles.search}><Text style={styles.searchIcon}>⌕</Text><TextInput value={query} onChangeText={onQueryChange} placeholder={placeholder} placeholderTextColor={colors.secondaryText} style={styles.input} returnKeyType="search" /></View>
      {filters.length ? <Pressable onPress={() => setFiltersVisible((current) => !current)} style={[styles.filterButton, activeCount > 0 && styles.filterButtonActive]}><Text style={[styles.filterText, activeCount > 0 && styles.filterTextActive]}>≡ Filter{activeCount ? ` (${activeCount})` : ''}</Text></Pressable> : null}
    </View>
    {filtersVisible ? <View style={styles.filters}>{filters.map((group) => <View key={group.key} style={styles.group}><Text style={styles.groupLabel}>{group.label}</Text><View style={styles.chips}><Pressable onPress={() => onFilterChange?.(group.key, '')} style={[styles.chip, !selectedFilters[group.key] && styles.chipActive]}><Text style={[styles.chipText, !selectedFilters[group.key] && styles.chipTextActive]}>All</Text></Pressable>{group.options.map((option) => { const selected = selectedFilters[group.key] === option.value; return <Pressable key={option.value} onPress={() => onFilterChange?.(group.key, selected ? '' : option.value)} style={[styles.chip, selected && styles.chipActive]}><Text style={[styles.chipText, selected && styles.chipTextActive]}>{option.label}</Text></Pressable>; })}</View></View>)}</View> : null}
  </View>;
}
const styles = StyleSheet.create({ wrapper:{marginBottom:spacing.lg},row:{flexDirection:'row',gap:spacing.sm},search:{flex:1,minHeight:48,borderRadius:12,borderWidth:1,borderColor:colors.border,backgroundColor:'#fff',flexDirection:'row',alignItems:'center',paddingHorizontal:spacing.md},searchIcon:{fontSize:23,color:colors.secondaryText,marginRight:spacing.sm},input:{flex:1,fontSize:14,color:colors.text,paddingVertical:0},filterButton:{minHeight:48,borderRadius:12,borderWidth:1,borderColor:colors.border,backgroundColor:'#fff',justifyContent:'center',paddingHorizontal:spacing.md},filterButtonActive:{backgroundColor:'#e8efff',borderColor:colors.primary},filterText:{fontSize:12,fontWeight:'700',color:colors.text},filterTextActive:{color:colors.primary},filters:{marginTop:spacing.sm,padding:spacing.md,backgroundColor:'#fff',borderWidth:1,borderColor:colors.border,borderRadius:12},group:{marginBottom:spacing.md},groupLabel:{fontSize:12,fontWeight:'700',color:colors.secondaryText,marginBottom:spacing.sm},chips:{flexDirection:'row',flexWrap:'wrap',gap:spacing.sm},chip:{borderWidth:1,borderColor:colors.border,borderRadius:16,paddingHorizontal:spacing.md,paddingVertical:6},chipActive:{backgroundColor:colors.primary,borderColor:colors.primary},chipText:{fontSize:12,color:colors.text},chipTextActive:{color:'#fff',fontWeight:'700'} });
