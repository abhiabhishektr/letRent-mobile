import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { AppText as Text } from '../../components/AppText';
import { useFocusEffect, useRouter } from 'expo-router';
import { AppShell } from '../../components/AppShell';
import { SearchFilterBar } from '../../components/SearchFilterBar';
import { useThemedStyles } from '../../theme';
import type { AppTheme } from '../../theme';
import { getProperties, PROPERTY_TYPE_OPTIONS, PropertyResponse } from '../../services/propertyApi';

export default function Properties() {
  const [search, setSearch] = useState('');
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const sheetTranslate = useRef(new Animated.Value(260)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const loadProperties = useCallback(async () => {
    try {
      const next = await getProperties();
      setProperties(next);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load properties.';
      Alert.alert('Unable to load properties', message);
      setProperties([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProperties();
    }, [loadProperties]),
  );

  useEffect(() => {
    if (showAddModal) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(sheetTranslate, {
          toValue: 0,
          speed: 18,
          bounciness: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(sheetTranslate, {
          toValue: 260,
          speed: 18,
          bounciness: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showAddModal, backdropOpacity, sheetTranslate]);

  const handleSelectType = (value: number) => {
    setShowAddModal(false);
    router.push({ pathname: '/owner/properties/add', params: { propertyType: String(value) } });
  };

  const handleView = (property: PropertyResponse) => {
    router.push({ pathname: '/owner/properties/[id]', params: { id: String(property.id) } });
  };

  const filteredProperties = properties.filter((property) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return `${property.name} ${property.address} ${property.city} ${property.state}`.toLowerCase().includes(query);
  });

  return <AppShell active="Properties" scroll style={styles.content}>
    <View style={styles.headerRow}>
      <Text onPress={() => router.back()} style={styles.back}>‹</Text>
      <Text style={styles.title}>Properties</Text>
      <Pressable onPress={() => setShowAddModal(true)} style={styles.addButton} accessibilityRole="button">
        <Text style={styles.addIcon}>＋</Text>
      </Pressable>
    </View>
    <Text style={styles.sub}>12 properties · 24 units</Text>
    <SearchFilterBar query={search} onQueryChange={setSearch} placeholder="Search properties or location" />
    {filteredProperties.map((property) => <View key={property.id} style={styles.card}>
      <Pressable onPress={() => handleView(property)} style={styles.cardBody}>
        <View style={styles.icon}><Text>⌂</Text></View>
        <View style={styles.cardContent}>
          <Text style={styles.name}>{property.name}</Text>
          <Text style={styles.meta}>{property.address}</Text>
          <Text style={styles.meta}>{property.city}, {property.state}</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </Pressable>
    </View>)}
    {!filteredProperties.length ? <View style={styles.empty}><Text style={styles.emptyTitle}>No properties found</Text><Text style={styles.emptyCopy}>Try searching by property name or location.</Text></View> : null}

    <Modal transparent visible={showAddModal} animationType="fade" onRequestClose={() => setShowAddModal(false)}>
      <Pressable style={styles.modalBackdrop} onPress={() => setShowAddModal(false)}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
      </Pressable>
      <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetTranslate }] }]}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>Add Property</Text>
        {PROPERTY_TYPE_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            style={styles.optionRow}
            onPress={() => handleSelectType(option.value)}
            accessibilityRole="button"
          >
            <Text style={styles.optionIcon}>{option.icon}</Text>
            <Text style={styles.optionLabel}>{option.label}</Text>
          </Pressable>
        ))}
      </Animated.View>
    </Modal>
  </AppShell>;
}
function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
  content:{padding:spacing.lg,paddingBottom:spacing.xxl},
  headerRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  back:{fontSize:36,lineHeight:35,flex:1},
  title:{fontSize:24,fontWeight:'800',marginTop:spacing.sm,flex: 1},
  addButton:{width:34,height:34,borderRadius:radius.pill,backgroundColor:colors.secondary,alignItems:'center',justifyContent:'center',marginTop:spacing.sm},
  addIcon:{fontSize:24,color:colors.primary,fontWeight:'700'},
  sub:{color:colors.textSecondary,fontSize:13,marginTop:4,marginBottom:spacing.lg},
  card:{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:radius.md,padding:spacing.md,marginBottom:spacing.sm,shadowColor:colors.text,shadowOpacity:0.06,shadowRadius:8,elevation:2},
  cardBody:{flexDirection:'row',alignItems:'center',gap:12},
  icon:{backgroundColor:colors.successBackground,padding:12,borderRadius:radius.sm},
  cardContent:{flex:1},
  name:{fontSize:15,fontWeight:'800'},
  meta:{fontSize:12,color:colors.textSecondary,marginTop:4},
  arrow:{fontSize:24,color:colors.textSecondary},
  empty:{alignItems:'center',paddingVertical:spacing.xxl},
  emptyTitle:{fontSize:16,fontWeight:'700',color:colors.text},
  emptyCopy:{fontSize:13,color:colors.textSecondary,marginTop:4},
  modalBackdrop:{flex:1,justifyContent:'flex-end'},
  backdrop:{...StyleSheet.absoluteFill,backgroundColor:colors.overlay},
  sheet:{backgroundColor:colors.surface,borderTopLeftRadius:radius.xl,borderTopRightRadius:radius.xl,paddingHorizontal:spacing.lg,paddingTop:spacing.sm,paddingBottom:spacing.xl,marginTop:'auto',shadowColor:colors.text,shadowOpacity:0.08,shadowRadius:14,elevation:10},
  sheetHandle:{width:44,height:4,borderRadius:radius.pill,backgroundColor:colors.border,alignSelf:'center',marginBottom:spacing.md},
  sheetTitle:{fontSize:22,fontWeight:'800',marginBottom:spacing.md},
  optionRow:{flexDirection:'row',alignItems:'center',paddingVertical:spacing.md,borderBottomWidth:1,borderBottomColor:colors.border},
  optionIcon:{fontSize:24,marginRight:spacing.md},
  optionLabel:{fontSize:17,fontWeight:'600',color:colors.text},
});
}
