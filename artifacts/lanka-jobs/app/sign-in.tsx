import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { useColors } from '@/hooks/useColors';

export default function SignInScreen() {
  const colors = useColors();
  const router = useRouter();
  return (
    <Screen>
      <Pressable testID="sign-in-back" onPress={() => router.back()} style={[styles.back, { backgroundColor: colors.card, borderColor: colors.border }]}><Ionicons name="arrow-back" size={19} color={colors.foreground} /></Pressable>
      <View style={styles.hero}><View style={[styles.logo, { backgroundColor: colors.secondary }]}><Ionicons name="lock-closed-outline" size={30} color={colors.primary} /></View><Text style={[styles.title, { color: colors.foreground }]}>Sign in to LankaJobs</Text><Text style={[styles.copy, { color: colors.mutedForeground }]}>Save jobs across devices, manage your profile, and post legitimate vacancies.</Text></View>
      <View style={[styles.notice, { backgroundColor: colors.accent }]}><Ionicons name="information-circle-outline" size={20} color={colors.accentForeground} /><Text style={[styles.noticeText, { color: colors.accentForeground }]}>Secure phone OTP and Google sign-in will be connected before account actions are enabled. No fake account is created on this device.</Text></View>
      <View style={styles.methods}><Pressable disabled style={[styles.method, { backgroundColor: colors.primary, opacity: 0.45 }]}><Ionicons name="call-outline" size={19} color={colors.primaryForeground} /><Text style={[styles.methodText, { color: colors.primaryForeground }]}>Continue with phone</Text></Pressable><Pressable disabled style={[styles.method, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, opacity: 0.45 }]}><Ionicons name="logo-google" size={19} color={colors.foreground} /><Text style={[styles.methodText, { color: colors.foreground }]}>Continue with Google</Text></Pressable></View>
      <Text style={[styles.footer, { color: colors.mutedForeground }]}>You can still browse and save a local shortlist while exploring the app.</Text>
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
  methods: { gap: 10, marginTop: 5 },
  method: { minHeight: 53, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9 },
  methodText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  footer: { fontFamily: 'Inter_400Regular', fontSize: 12, textAlign: 'center', lineHeight: 18, paddingHorizontal: 20 },
});