import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { API_BASE_URL, apiRequest } from '@/api';

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const colors = useColors();
  const router = useRouter();
  const { signIn } = useApp();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const requestCode = async () => {
    if (phone.trim().length < 7) {
      Alert.alert('Enter your phone number', 'Use the international format where possible, for example +94771234567.');
      return;
    }
    setBusy(true);
    try {
      await apiRequest('/api/auth/phone/request', { method: 'POST', body: JSON.stringify({ phone: phone.trim() }), headers: { 'Content-Type': 'application/json' } });
      setCodeSent(true);
      Alert.alert('Code sent', 'Check your phone for the six-digit LankaJobs verification code.');
    } catch (error) {
      Alert.alert('Phone sign-in unavailable', error instanceof Error ? error.message : 'Please try again.');
    } finally { setBusy(false); }
  };

  const verifyCode = async () => {
    setBusy(true);
    try {
      const result = await apiRequest<{ accessToken: string }>('/api/auth/phone/verify', { method: 'POST', body: JSON.stringify({ phone: phone.trim(), code }), headers: { 'Content-Type': 'application/json' } });
      await signIn(result.accessToken);
      router.replace('/profile-setup');
    } catch (error) {
      Alert.alert('Invalid code', error instanceof Error ? error.message : 'Please request a new code.');
    } finally { setBusy(false); }
  };

  const signInWithGoogle = async () => {
    if (!API_BASE_URL) {
      Alert.alert('API is not configured', 'Set EXPO_PUBLIC_API_URL before using account features.');
      return;
    }
    setBusy(true);
    try {
      const redirectUri = Linking.createURL('auth');
      const result = await WebBrowser.openAuthSessionAsync(`${API_BASE_URL}/api/auth/google/start`, redirectUri);
      if (result.type !== 'success') return;
      const accessToken = new URL(result.url).searchParams.get('accessToken');
      if (!accessToken) throw new Error('Google sign-in did not return a session.');
      await signIn(accessToken);
      router.replace('/profile-setup');
    } catch (error) {
      Alert.alert('Google sign-in failed', error instanceof Error ? error.message : 'Please try again.');
    } finally { setBusy(false); }
  };

  return (
    <Screen>
      <Pressable testID="sign-in-back" onPress={() => router.back()} style={[styles.back, { backgroundColor: colors.card, borderColor: colors.border }]}><Ionicons name="arrow-back" size={19} color={colors.foreground} /></Pressable>
      <View style={styles.hero}><View style={[styles.logo, { backgroundColor: colors.secondary }]}><Ionicons name="lock-closed-outline" size={30} color={colors.primary} /></View><Text style={[styles.title, { color: colors.foreground }]}>Sign in to LankaJobs</Text><Text style={[styles.copy, { color: colors.mutedForeground }]}>Sync saved jobs, manage your profile, and post legitimate vacancies.</Text></View>
      <View style={[styles.notice, { backgroundColor: colors.accent }]}><Ionicons name="shield-checkmark-outline" size={20} color={colors.accentForeground} /><Text style={[styles.noticeText, { color: colors.accentForeground }]}>Your session is stored securely on this device and verified by the LankaJobs server.</Text></View>
      <View style={styles.form}>
        <Text style={[styles.label, { color: colors.foreground }]}>Phone number</Text>
        <TextInput value={phone} onChangeText={setPhone} placeholder="+94 77 123 4567" placeholderTextColor={colors.mutedForeground} keyboardType="phone-pad" style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]} />
        {codeSent && <><Text style={[styles.label, { color: colors.foreground }]}>Verification code</Text><TextInput value={code} onChangeText={setCode} placeholder="Six-digit code" placeholderTextColor={colors.mutedForeground} keyboardType="number-pad" maxLength={6} style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]} /></>}
        <Pressable disabled={busy} onPress={() => { void (codeSent ? verifyCode() : requestCode()); }} style={[styles.method, { backgroundColor: colors.primary, opacity: busy ? 0.55 : 1 }]}><Ionicons name="call-outline" size={19} color={colors.primaryForeground} /><Text style={[styles.methodText, { color: colors.primaryForeground }]}>{codeSent ? 'Verify phone' : 'Continue with phone'}</Text></Pressable>
      </View>
      <Pressable disabled={busy} onPress={() => { void signInWithGoogle(); }} style={[styles.method, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, opacity: busy ? 0.55 : 1 }]}><Ionicons name="logo-google" size={19} color={colors.foreground} /><Text style={[styles.methodText, { color: colors.foreground }]}>Continue with Google</Text></Pressable>
      <Text style={[styles.footer, { color: colors.mutedForeground }]}>By continuing, you agree to use LankaJobs for genuine employment opportunities.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { width: 42, height: 42, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { alignItems: 'center', gap: 11, paddingTop: 28 },
  logo: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 26, textAlign: 'center', letterSpacing: -0.6 },
  copy: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21, textAlign: 'center', maxWidth: 320 },
  notice: { borderRadius: 16, padding: 14, flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  noticeText: { fontFamily: 'Inter_500Medium', fontSize: 12, lineHeight: 18, flex: 1 },
  form: { gap: 9 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  input: { borderWidth: 1, borderRadius: 14, minHeight: 50, paddingHorizontal: 14, fontFamily: 'Inter_400Regular', fontSize: 14 },
  method: { minHeight: 53, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9 },
  methodText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  footer: { fontFamily: 'Inter_400Regular', fontSize: 12, textAlign: 'center', lineHeight: 18, paddingHorizontal: 20 },
});