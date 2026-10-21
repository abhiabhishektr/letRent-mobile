import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Switch, View } from 'react-native';
import { AppText as Text } from '../../components/AppText';
import { useRouter } from 'expo-router';
import { AppShell } from '../../components/AppShell';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { BankAccount, bankAccountRepository } from '../../services/bankAccountRepository';
import { useTheme, useThemedStyles } from '../../theme';
import type { AppTheme } from '../../theme';

const EMPTY_FORM = { accountHolder: 'Rahul Sharma', bankName: '', ifsc: '', accountNumber: '', upiId: '' };
const maskAccountNumber = (accountNumber: string) => `•••• ${accountNumber.slice(-4)}`;

export default function BankAccounts() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const loadAccounts = useCallback(() => { bankAccountRepository.getAccounts().then(setAccounts); }, []);
  useEffect(() => { loadAccounts(); }, [loadAccounts]);
  const changeField = (field: keyof typeof EMPTY_FORM, value: string) => setForm((current) => ({ ...current, [field]: field === 'ifsc' ? value.toUpperCase() : value }));
  const addAccount = async () => {
    if (!form.accountHolder.trim() || !form.bankName.trim() || form.ifsc.length !== 11 || form.accountNumber.replace(/\s/g, '').length < 9 || !form.upiId.includes('@')) {
      Alert.alert('Check account details', 'Enter a bank name, 11-character IFSC, valid account number, and UPI ID.');
      return;
    }
    await bankAccountRepository.addAccount({ ...form, accountHolder: form.accountHolder.trim(), bankName: form.bankName.trim(), ifsc: form.ifsc.trim(), accountNumber: form.accountNumber.replace(/\s/g, ''), upiId: form.upiId.trim() });
    setForm(EMPTY_FORM); setShowForm(false); loadAccounts();
  };
  const removeAccount = (account: BankAccount) => Alert.alert('Remove account?', `${account.bankName} will no longer receive rent payments.`, [{ text: 'Cancel' }, { text: 'Remove', style: 'destructive', onPress: async () => { await bankAccountRepository.deleteAccount(account.id); loadAccounts(); } }]);
  const setReceivingAccount = async (id: string) => { await bankAccountRepository.setReceivingAccount(id); loadAccounts(); };

  return <AppShell active="More" scroll style={styles.content}>
    <Text onPress={() => router.back()} style={styles.back}>‹</Text>
    <Text style={styles.title}>Bank accounts</Text>
    <Text style={styles.subtitle}>Choose where you receive rent payments.</Text>
    <View style={styles.notice}><Text style={styles.noticeIcon}>i</Text><Text style={styles.noticeText}>Only one account can receive payments at a time.</Text></View>
    {accounts.map((account) => <View key={account.id} style={[styles.card, account.isReceivingAccount && styles.activeCard]}>
      <View style={styles.cardHeader}><View style={styles.bankMark}><Text style={styles.bankMarkText}>{account.bankName[0]}</Text></View><View style={styles.bankInfo}><Text style={styles.bankName}>{account.bankName}</Text><Text style={styles.holder}>{account.accountHolder}</Text></View><Switch value={account.isReceivingAccount} onValueChange={() => setReceivingAccount(account.id)} trackColor={{ false: colors.border, true: colors.secondary }} thumbColor={account.isReceivingAccount ? colors.primary : colors.surface} /></View>
      <View style={styles.details}><Text style={styles.detail}>A/C {maskAccountNumber(account.accountNumber)}</Text><Text style={styles.detail}>IFSC {account.ifsc}</Text><Text style={styles.detail}>UPI {account.upiId}</Text></View>
      <View style={styles.cardFooter}><Text style={account.isReceivingAccount ? styles.receiving : styles.notReceiving}>{account.isReceivingAccount ? 'Receiving payments' : 'Not receiving payments'}</Text><Text onPress={() => removeAccount(account)} style={styles.remove}>Remove</Text></View>
    </View>)}
    {showForm ? <View style={styles.form}><Text style={styles.formTitle}>Add bank account</Text><Input label="Account holder name" value={form.accountHolder} onChangeText={(value) => changeField('accountHolder', value)} autoCapitalize="words" /><Input label="Bank name" value={form.bankName} onChangeText={(value) => changeField('bankName', value)} placeholder="e.g. ICICI Bank" autoCapitalize="words" /><Input label="IFSC code" value={form.ifsc} onChangeText={(value) => changeField('ifsc', value)} placeholder="ICIC0000123" autoCapitalize="characters" maxLength={11} /><Input label="Account number" value={form.accountNumber} onChangeText={(value) => changeField('accountNumber', value)} keyboardType="number-pad" placeholder="Enter account number" /><Input label="UPI ID" value={form.upiId} onChangeText={(value) => changeField('upiId', value)} autoCapitalize="none" placeholder="name@bank" /><View style={styles.formActions}><Button title="Cancel" outline onPress={() => { setForm(EMPTY_FORM); setShowForm(false); }} style={styles.actionButton} /><Button title="Add account" onPress={addAccount} style={styles.actionButton} /></View></View> : <Button title="+  Add bank account" outline onPress={() => setShowForm(true)} style={styles.addButton} />}
  </AppShell>;
}
function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
    content: { padding: spacing.lg, paddingBottom: spacing.xxl },
    back: { fontSize: 36, lineHeight: 35, color: colors.text },
    title: { fontSize: 24, fontWeight: '800', color: colors.text, marginTop: spacing.sm },
    subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: spacing.xs },
    notice: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', backgroundColor: colors.secondary, padding: spacing.md, borderRadius: radius.sm, marginTop: spacing.lg, marginBottom: spacing.md },
    noticeIcon: { color: colors.primary, fontWeight: '800', borderWidth: 1, borderColor: colors.primary, width: 16, height: 16, borderRadius: radius.pill, textAlign: 'center', fontSize: 11 },
    noticeText: { flex: 1, fontSize: 12, color: colors.textSecondary },
    card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
    activeCard: { borderColor: colors.primary, backgroundColor: colors.surfaceSecondary },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    bankMark: { width: 40, height: 40, borderRadius: radius.sm, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
    bankMarkText: { fontSize: 18, fontWeight: '800', color: colors.primary },
    bankInfo: { flex: 1 },
    bankName: { fontSize: 15, fontWeight: '800', color: colors.text },
    holder: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    details: { marginTop: spacing.md, gap: spacing.xs },
    detail: { fontSize: 12, color: colors.textSecondary },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md, paddingTop: spacing.sm, borderTopWidth: 1, borderColor: colors.border },
    receiving: { fontSize: 12, fontWeight: '700', color: colors.success },
    notReceiving: { fontSize: 12, color: colors.textSecondary },
    remove: { fontSize: 12, fontWeight: '700', color: colors.error },
    form: { marginTop: spacing.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md },
    formTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
    formActions: { flexDirection: 'row', gap: spacing.sm },
    actionButton: { flex: 1 },
    addButton: { marginTop: spacing.md, borderStyle: 'dashed' },
  });
}
