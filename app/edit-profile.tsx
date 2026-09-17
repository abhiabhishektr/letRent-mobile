import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '../components/AppShell';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { colors, spacing } from '../theme';

/** Local-only profile form. It can be replaced with a profile API call later. */
export default function EditProfile() {
  const { currentUser, updateProfile } = useAuth();
  const router = useRouter();
  const [name, setName] = useState(currentUser?.name ?? 'Rahul');
  const [phone, setPhone] = useState(currentUser?.phone ?? '98765 43210');
  const [email, setEmail] = useState('rahul@example.com');

  useEffect(() => { setName(currentUser?.name ?? 'Rahul'); setPhone(currentUser?.phone ?? '98765 43210'); }, [currentUser]);
  const save = async () => {
    if (!name.trim() || phone.replace(/\s/g, '').length < 10) { Alert.alert('Check your details', 'Enter your name and a valid mobile number.'); return; }
    await updateProfile({ name: name.trim(), phone: phone.trim() });
    Alert.alert('Profile updated', 'Your details have been saved locally.');
    router.back();
  };
  return <AppShell active="More" style={styles.content}>
    <Text onPress={() => router.back()} style={styles.back}>‹</Text>
    <Text style={styles.title}>Edit profile</Text>
    <Text style={styles.subtitle}>Keep your personal details up to date.</Text>
    <View style={styles.avatar}><Text style={styles.avatarText}>{name.trim()[0]?.toUpperCase() ?? 'R'}</Text></View>
    <View style={styles.form}>
      <Input label="Full name" value={name} onChangeText={setName} autoCapitalize="words" placeholder="Your name" />
      <Input label="Mobile number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={10} placeholder="98765 43210" />
      <Input label="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" />
    </View>
    <Button title="Save changes" onPress={save} style={styles.save} />
  </AppShell>;
}
const styles = StyleSheet.create({ content:{padding:spacing.lg},back:{fontSize:36,lineHeight:35,color:colors.text},title:{fontSize:24,fontWeight:'800',color:colors.text,marginTop:spacing.sm},subtitle:{fontSize:13,color:colors.secondaryText,marginTop:4},avatar:{width:64,height:64,borderRadius:32,backgroundColor:'#e8efff',alignItems:'center',justifyContent:'center',marginTop:spacing.xl},avatarText:{fontSize:26,fontWeight:'800',color:colors.primary},form:{marginTop:spacing.xl},save:{marginTop:'auto'} });
