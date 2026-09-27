import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { JobCard } from '@/components/JobCard';
import { Screen } from '@/components/Screen';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

export default function SavedScreen() {
  const colors = useColors();
  const router = useRouter();
  const { jobs, savedJobIds, toggleSaved } = useApp();
  const save = async (jobId: string) => { try { await toggleSaved(jobId); } catch { router.push('/sign-in'); } };
  const saved = jobs.filter((job) => savedJobIds.includes(job.id));
  return (
    <Screen>
      <View><Text style={[styles.eyebrow, { color: colors.primary }]}>YOUR SHORTLIST</Text><Text style={[styles.title, { color: colors.foreground }]}>Saved jobs</Text><Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Keep the roles you want to come back to.</Text></View>
      {saved.length > 0 ? saved.map((job) => <JobCard key={job.id} job={job} saved onPress={() => router.push(`/job/${job.id}`)} onToggleSave={() => save(job.id)} />) : <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.icon, { backgroundColor: colors.secondary }]}><Ionicons name="bookmark-outline" size={26} color={colors.primary} /></View><Text style={[styles.emptyTitle, { color: colors.foreground }]}>No saved jobs yet</Text><Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Tap the bookmark on a job to build your shortlist.</Text></View>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 1.1, marginBottom: 5 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 29, letterSpacing: -0.7 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 6 },
  empty: { borderWidth: 1, borderRadius: 20, alignItems: 'center', padding: 30, gap: 10, marginTop: 12 },
  icon: { width: 58, height: 58, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginBottom: 3 },
  emptyTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 17 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 13, textAlign: 'center', lineHeight: 19 },
});