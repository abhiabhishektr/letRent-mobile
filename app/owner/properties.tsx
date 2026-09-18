import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '../../components/AppShell';
import { SearchFilterBar } from '../../components/SearchFilterBar';
import { Property, rentRepository } from '../../services/rentRepository';
import { colors, spacing } from '../../theme';

export default function Properties() {
  const [search, setSearch] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const router = useRouter();
  useEffect(() => { rentRepository.getProperties({ search }).then(setProperties); }, [search]);
  return <AppShell active="Properties" scroll style={styles.content}>
    <Text onPress={() => router.back()} style={styles.back}>‹</Text>
    <Text style={styles.title}>Properties</Text>
    <Text style={styles.sub}>12 properties · 24 units</Text>
    <SearchFilterBar query={search} onQueryChange={setSearch} placeholder="Search properties or location" />
    {properties.map((property) => <View key={property.id} style={styles.card}>
      <View style={styles.icon}><Text>⌂</Text></View><View style={styles.cardContent}><Text style={styles.name}>{property.name}</Text><Text style={styles.meta}>{property.address}</Text><Text style={styles.meta}>{property.units} · {property.occupied}</Text></View><Text style={styles.arrow}>›</Text>
    </View>)}
    {!properties.length ? <View style={styles.empty}><Text style={styles.emptyTitle}>No properties found</Text><Text style={styles.emptyCopy}>Try searching by property name or location.</Text></View> : null}
  </AppShell>;
}
const styles = StyleSheet.create({ content:{padding:spacing.lg,paddingBottom:spacing.xxl},back:{fontSize:36,lineHeight:35},title:{fontSize:24,fontWeight:'800',marginTop:spacing.sm},sub:{color:colors.secondaryText,fontSize:13,marginTop:4,marginBottom:spacing.lg},card:{backgroundColor:'#fff',borderWidth:1,borderColor:'#edf0f5',borderRadius:12,padding:spacing.md,marginBottom:spacing.sm,flexDirection:'row',alignItems:'center',gap:12},icon:{backgroundColor:'#eaf9ef',padding:12,borderRadius:10},cardContent:{flex:1},name:{fontSize:15,fontWeight:'800'},meta:{fontSize:12,color:colors.secondaryText,marginTop:4},arrow:{fontSize:24,color:colors.secondaryText},empty:{alignItems:'center',paddingVertical:spacing.xxl},emptyTitle:{fontSize:16,fontWeight:'700',color:colors.text},emptyCopy:{fontSize:13,color:colors.secondaryText,marginTop:4} });
