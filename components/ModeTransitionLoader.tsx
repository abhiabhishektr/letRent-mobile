import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export function ModeTransitionLoader() {
  const pulse = useRef(new Animated.Value(0.96)).current;
  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([Animated.timing(pulse, { toValue: 1.04, duration: 700, useNativeDriver: true }), Animated.timing(pulse, { toValue: 0.96, duration: 700, useNativeDriver: true })]));
    animation.start();
    return () => animation.stop();
  }, [pulse]);
  return <View style={styles.overlay} accessibilityRole="progressbar" accessibilityLabel="Switching LetRent mode">
    <Animated.View style={[styles.card, { transform: [{ scale: pulse }] }]}><Image source={require('../assets/images/logo.png')} style={styles.logo} resizeMode="contain" /><Text style={styles.brand}>LetRent</Text><Text style={styles.message}>Updating your workspace</Text><ActivityIndicator color={colors.primary} style={styles.spinner} /></Animated.View>
  </View>;
}
const styles = StyleSheet.create({ overlay:{...StyleSheet.absoluteFill,zIndex:100,backgroundColor:'rgba(248,250,252,0.96)',alignItems:'center',justifyContent:'center'},card:{alignItems:'center'},logo:{width:128,height:128},brand:{fontSize:24,fontWeight:'800',color:colors.text,marginTop:4},message:{fontSize:13,color:colors.secondaryText,marginTop:5},spinner:{marginTop:18} });
