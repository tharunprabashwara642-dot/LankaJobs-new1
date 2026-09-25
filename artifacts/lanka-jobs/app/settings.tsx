import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

const languages = ['English', 'සිංහල', 'தமிழ்'] as const;

export default function SettingsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { language, updateLanguage } = useApp();
  return (
    <Screen>
      <View style={styles.nav}><Pressable onPress={() => router.back()} style={[styles.back, { backgroundColor: colors.card, borderColor: colors.border }]}><Ionicons name="arrow-back" size={19} color={colors.foreground} /></Pressable></View>
      <View><Text style={[styles.eyebrow, { color: colors.primary }]}>PREFERENCES</Text><Text style={[styles.title, { color: colors.foreground }]}>Settings</Text><Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Make LankaJobs work for you.</Text></View>
      <View style={styles.section}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>App language</Text><Text style={[styles.helper, { color: colors.mutedForeground }]}>Choose the language used throughout the app.</Text><View style={styles.languages}>{languages.map((item) => <Pressable key={item} testID={`language-${item}`} onPress={() => updateLanguage(item)} style={[styles.language, { backgroundColor: language === item ? colors.secondary : colors.card, borderColor: language === item ? colors.primary : colors.border }]}><Text style={[styles.languageText, { color: language === item ? colors.primary : colors.foreground }]}>{item}</Text>{language === item && <Ionicons name="checkmark-circle" size={18} color={colors.primary} />}</Pressable>)}</View></View>
      <View style={styles.section}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>About LankaJobs</Text>{['Help & support', 'Privacy policy', 'Terms & conditions'].map((item) => <Pressable key={item} style={[styles.item, { borderBottomColor: colors.border }]}><Text style={[styles.itemText, { color: colors.foreground }]}>{item}</Text><Ionicons name="chevron-forward" size={17} color={colors.mutedForeground} /></Pressable>)}</View>
      <Text style={[styles.note, { color: colors.mutedForeground }]}>LankaJobs is currently running with local demo listings. Live account, moderation, and employer workflows will use the future platform backend.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  nav: { flexDirection: 'row' },
  back: { width: 42, height: 42, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 1.1, marginBottom: 5 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 29, letterSpacing: -0.7 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 6 },
  section: { gap: 8 },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 17 },
  helper: { fontFamily: 'Inter_400Regular', fontSize: 12, marginBottom: 5 },
  languages: { gap: 8 },
  language: { borderWidth: 1, minHeight: 49, borderRadius: 14, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  languageText: { fontFamily: 'Inter_500Medium', fontSize: 14 },
  item: { borderBottomWidth: 1, minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemText: { fontFamily: 'Inter_500Medium', fontSize: 14 },
  note: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, textAlign: 'center', padding: 10 },
});