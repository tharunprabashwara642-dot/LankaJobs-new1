import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

const menu = [
  { label: 'My jobs', icon: 'briefcase-outline' as const, route: '/sign-in' },
  { label: 'Post a job', icon: 'add-circle-outline' as const, route: '/sign-in' },
  { label: 'Settings & language', icon: 'settings-outline' as const, route: '/settings' },
  { label: 'Help & support', icon: 'help-circle-outline' as const, route: '/settings' },
];

export default function ProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const { savedJobIds, postedJobs } = useApp();
  return (
    <Screen>
      <View style={styles.header}><View style={[styles.avatar, { backgroundColor: colors.secondary }]}><Ionicons name="person" size={28} color={colors.primary} /></View><View style={styles.headerCopy}><Text style={[styles.title, { color: colors.foreground }]}>Your profile</Text><Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Keep your job search in one place.</Text></View></View>
      <Pressable testID="sign-in-button" onPress={() => router.push('/sign-in')} style={({ pressed }) => [styles.signIn, { backgroundColor: colors.primary, opacity: pressed ? 0.86 : 1 }]}><View><Text style={styles.signInTitle}>Sign in to unlock more</Text><Text style={styles.signInCopy}>Sync saved jobs and manage your listings.</Text></View><Ionicons name="arrow-forward" size={20} color={colors.primaryForeground} /></Pressable>
      <View style={[styles.stats, { backgroundColor: colors.card }]}><View><Text style={[styles.statValue, { color: colors.foreground }]}>{savedJobIds.length}</Text><Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Saved jobs</Text></View><View><Text style={[styles.statValue, { color: colors.foreground }]}>{postedJobs.length}</Text><Text style={[styles.statLabel, { color: colors.mutedForeground }]}>My listings</Text></View><View><Text style={[styles.statValue, { color: colors.foreground }]}>3</Text><Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Languages</Text></View></View>
      <View style={styles.menu}>{menu.map((item) => <Pressable key={item.label} testID={`profile-${item.label}`} onPress={() => router.push(item.route as '/sign-in' | '/settings')} style={({ pressed }) => [styles.menuItem, { borderBottomColor: colors.border, opacity: pressed ? 0.6 : 1 }]}><View style={styles.menuLeft}><Ionicons name={item.icon} size={21} color={colors.primary} /><Text style={[styles.menuText, { color: colors.foreground }]}>{item.label}</Text></View><Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} /></Pressable>)}</View>
      <Text style={[styles.note, { color: colors.mutedForeground }]}>Secure account features will be enabled when the platform authentication service is connected.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 66, height: 66, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  headerCopy: { flex: 1, gap: 5 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 27, letterSpacing: -0.6 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 13 },
  signIn: { borderRadius: 19, padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  signInTitle: { fontFamily: 'Inter_700Bold', fontSize: 16 },
  signInCopy: { color: 'rgba(255,255,255,0.75)', fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 4 },
  stats: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 17, borderRadius: 18 },
  statValue: { fontFamily: 'Inter_700Bold', fontSize: 21, textAlign: 'center' },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 3 },
  menu: { borderTopWidth: 1 },
  menuItem: { minHeight: 61, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  menuText: { fontFamily: 'Inter_500Medium', fontSize: 15 },
  note: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, textAlign: 'center', paddingHorizontal: 8 },
});