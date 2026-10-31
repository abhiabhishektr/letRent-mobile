import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { AppText as Text } from '../../components/AppText';
import { useFocusEffect, useRouter } from 'expo-router';
import { AnimatedFab } from '../../components/AnimatedFab';
import { AppShell } from '../../components/AppShell';
import { SearchFilterBar } from '../../components/SearchFilterBar';
import { createPlatformShadow, useThemedStyles } from '../../theme';
import { USE_NATIVE_DRIVER } from '../../utils/nativeDriver';
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
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.spring(sheetTranslate, {
          toValue: 0,
          speed: 18,
          bounciness: 8,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.spring(sheetTranslate, {
          toValue: 260,
          speed: 18,
          bounciness: 8,
          useNativeDriver: USE_NATIVE_DRIVER,
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

  return <AppShell active="Properties" style={styles.screenContent}>
    <ScrollView style={styles.listScroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <View style={styles.headerRow}>
      <Text onPress={() => router.back()} style={styles.back}>‹</Text>
      <Text style={styles.title}>Properties</Text>
    </View>
    <Text style={styles.sub}>{filteredProperties.length} propert{filteredProperties.length === 1 ? 'y' : 'ies'}</Text>
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
    </ScrollView>

    <AnimatedFab label="Add property" onPress={() => setShowAddModal(true)} />

    <Modal transparent visible={showAddModal} animationType="fade" onRequestClose={() => setShowAddModal(false)}>
      <Pressable style={styles.modalBackdrop} onPress={() => setShowAddModal(false)}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
      </Pressable>
      <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetTranslate }] }]}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeader}>
          <View style={styles.sheetHeaderText}>
            <Text style={styles.sheetTitle}>Add Property</Text>
            <Text style={styles.sheetSubtitle}>Choose how you want to list your property</Text>
          </View>
          <Pressable
            style={styles.closeButton}
            onPress={() => setShowAddModal(false)}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Text style={styles.closeIcon}>✕</Text>
          </Pressable>
        </View>
        <View style={styles.grid}>
          {PROPERTY_TYPE_OPTIONS.map((option, index) => (
            <Pressable
              key={option.value}
              style={({ pressed }) => [
                styles.typeCard,
                index === PROPERTY_TYPE_OPTIONS.length - 1 && styles.wideCard,
                pressed && styles.cardPressed,
              ]}
              onPress={() => handleSelectType(option.value)}
              accessibilityRole="button"
              accessibilityLabel={option.label}
            >
              <View style={styles.iconBox}>
                <Text style={styles.optionIcon}>{option.icon}</Text>
              </View>
              <View style={styles.cardTitleRow}>
                <Text style={styles.optionLabel} numberOfLines={1}>{option.label}</Text>
                <Text style={styles.chevron}>›</Text>
              </View>
              <Text style={styles.optionDescription} numberOfLines={2}>{option.description}</Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>
    </Modal>
  </AppShell>;
}
function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
  screenContent:{flex:1,padding:0},
  listScroll:{flex:1},
  content:{padding:spacing.lg,paddingBottom:spacing.xxl + 56},
  headerRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  back:{fontSize:36,lineHeight:35,marginRight:spacing.md},
  title:{fontSize:24,fontWeight:'800',marginTop:spacing.sm,flex: 1},
  sub:{color:colors.textSecondary,fontSize:13,marginTop:4,marginBottom:spacing.lg},
  card:{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:radius.md,padding:spacing.md,marginBottom:spacing.sm,...createPlatformShadow({color:colors.text,opacity:0.06,radius:8,elevation:2})},
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
  sheet:{backgroundColor:colors.surface,borderTopLeftRadius:radius.xl,borderTopRightRadius:radius.xl,paddingHorizontal:spacing.lg,paddingTop:spacing.sm,paddingBottom:spacing.xl,marginTop:'auto',...createPlatformShadow({color:colors.text,opacity:0.08,radius:14,elevation:10})},
  sheetHandle:{width:44,height:4,borderRadius:radius.pill,backgroundColor:colors.border,alignSelf:'center',marginBottom:spacing.md},
  sheetHeader:{flexDirection:'row',alignItems:'flex-start',justifyContent:'space-between',marginBottom:spacing.lg},
  sheetHeaderText:{flex:1,paddingRight:spacing.md},
  sheetTitle:{fontSize:22,fontWeight:'800'},
  sheetSubtitle:{fontSize:14,color:colors.textSecondary,marginTop:spacing.xs},
  closeButton:{width:36,height:36,borderRadius:radius.pill,backgroundColor:colors.surfaceSecondary,alignItems:'center',justifyContent:'center'},
  closeIcon:{fontSize:16,color:colors.text},
  grid:{flexDirection:'row',flexWrap:'wrap',gap:spacing.md},
  typeCard:{width:'47%',flexGrow:1,backgroundColor:colors.surface,borderRadius:radius.lg,borderWidth:1,borderColor:colors.border,padding:spacing.md,...createPlatformShadow({color:colors.text,opacity:0.05,radius:8,offset:{width:0,height:2},elevation:2})},
  wideCard:{width:'100%'},
  iconBox:{width:48,height:48,borderRadius:radius.md,backgroundColor:colors.secondary,alignItems:'center',justifyContent:'center',marginBottom:spacing.md},
  optionIcon:{fontSize:24},
  cardTitleRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  optionLabel:{flexShrink:1,fontSize:16,fontWeight:'700',color:colors.text},
  chevron:{fontSize:22,lineHeight:24,color:colors.textSecondary,marginLeft:spacing.xs},
  optionDescription:{fontSize:12,color:colors.textSecondary,marginTop:spacing.xs},
  cardPressed:{opacity:0.7},
});
}
