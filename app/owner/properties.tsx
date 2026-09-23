import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { AppShell } from '../../components/AppShell';
import { SearchFilterBar } from '../../components/SearchFilterBar';
import { Property, rentRepository } from '../../services/rentRepository';
import { colors, spacing } from '../../theme';

const PROPERTY_TYPE_OPTIONS = [
  { value: 'HOSTEL', label: 'Hostel', icon: '🏢' },
  { value: 'RESIDENTIAL', label: 'Residential / Home', icon: '🏠' },
  { value: 'RENTAL_ITEM', label: 'Rental Items', icon: '📦' },
  { value: 'OTHER', label: 'Others', icon: '⋯' },
] as const;

export default function Properties() {
  const [search, setSearch] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const router = useRouter();
  const sheetTranslate = useRef(new Animated.Value(260)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const loadProperties = useCallback(async () => {
    const next = await rentRepository.getProperties({ search });
    setProperties(next);
  }, [search]);

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

  const handleSelectType = (value: string) => {
    setShowAddModal(false);
    router.push({ pathname: '/owner/properties/add', params: { propertyType: value } });
  };

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
    {properties.map((property) => <View key={property.id} style={styles.card}>
      <View style={styles.icon}><Text>⌂</Text></View><View style={styles.cardContent}><Text style={styles.name}>{property.name}</Text><Text style={styles.meta}>{property.address}</Text><Text style={styles.meta}>{property.units} · {property.occupied}</Text></View><Text style={styles.arrow}>›</Text>
    </View>)}
    {!properties.length ? <View style={styles.empty}><Text style={styles.emptyTitle}>No properties found</Text><Text style={styles.emptyCopy}>Try searching by property name or location.</Text></View> : null}

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
const styles = StyleSheet.create({
  content:{padding:spacing.lg,paddingBottom:spacing.xxl},
  headerRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  back:{fontSize:36,lineHeight:35,flex:1},
  title:{fontSize:24,fontWeight:'800',marginTop:spacing.sm,flex: 1},
  addButton:{width:34,height:34,borderRadius:17,backgroundColor:'#eef5ff',alignItems:'center',justifyContent:'center',marginTop:spacing.sm},
  addIcon:{fontSize:24,color:colors.primary,fontWeight:'700'},
  sub:{color:colors.secondaryText,fontSize:13,marginTop:4,marginBottom:spacing.lg},
  card:{backgroundColor:'#fff',borderWidth:1,borderColor:'#edf0f5',borderRadius:12,padding:spacing.md,marginBottom:spacing.sm,flexDirection:'row',alignItems:'center',gap:12},
  icon:{backgroundColor:'#eaf9ef',padding:12,borderRadius:10},
  cardContent:{flex:1},
  name:{fontSize:15,fontWeight:'800'},
  meta:{fontSize:12,color:colors.secondaryText,marginTop:4},
  arrow:{fontSize:24,color:colors.secondaryText},
  empty:{alignItems:'center',paddingVertical:spacing.xxl},
  emptyTitle:{fontSize:16,fontWeight:'700',color:colors.text},
  emptyCopy:{fontSize:13,color:colors.secondaryText,marginTop:4},
  modalBackdrop:{flex:1,justifyContent:'flex-end'},
  backdrop:{...StyleSheet.absoluteFill,backgroundColor:'rgba(15, 23, 42, 0.35)'},
  sheet:{backgroundColor:'#fff',borderTopLeftRadius:22,borderTopRightRadius:22,paddingHorizontal:spacing.lg,paddingTop:spacing.sm,paddingBottom:spacing.xl,marginTop:'auto',shadowColor:'#000',shadowOpacity:0.08,shadowRadius:14,elevation:10},
  sheetHandle:{width:44,height:4,borderRadius:4,backgroundColor:'#dfe6f1',alignSelf:'center',marginBottom:spacing.md},
  sheetTitle:{fontSize:22,fontWeight:'800',marginBottom:spacing.md},
  optionRow:{flexDirection:'row',alignItems:'center',paddingVertical:spacing.md,borderBottomWidth:1,borderBottomColor:'#edf0f5'},
  optionIcon:{fontSize:24,marginRight:spacing.md},
  optionLabel:{fontSize:17,fontWeight:'600',color:colors.text},
});
