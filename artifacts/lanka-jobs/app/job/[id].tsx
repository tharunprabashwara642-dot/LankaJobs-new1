import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

export default function JobDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getJob, savedJobIds, toggleSaved } = useApp();
  const job = getJob(id);

  if (!job) {
    return <Screen><View style={styles.empty}><Ionicons name="alert-circle-outline" size={30} color={colors.mutedForeground} /><Text style={[styles.emptyTitle, { color: colors.foreground }]}>Job no longer available</Text><Text style={[styles.emptyCopy, { color: colors.mutedForeground }]}>This listing may have been removed or expired.</Text><Pressable onPress={() => router.back()}><Text style={[styles.backText, { color: colors.primary }]}>Go back</Text></Pressable></View></Screen>;
  }

  const saved = savedJobIds.includes(job.id);
  const toggle = async () => { try { await toggleSaved(job.id); } catch { router.push('/sign-in'); } };
  const apply = () => {
    if (job.applicationUrl) Linking.openURL(job.applicationUrl);
    else if (job.applicationEmail) Linking.openURL(`mailto:${job.applicationEmail}?subject=${encodeURIComponent(`Application for ${job.title}`)}`);
  };
  return (
    <Screen>
      <View style={styles.nav}><Pressable testID="job-back" onPress={() => router.back()} style={[styles.navButton, { backgroundColor: colors.card, borderColor: colors.border }]}><Ionicons name="arrow-back" size={19} color={colors.foreground} /></Pressable><Pressable testID="job-save" onPress={() => { void toggle(); }} style={[styles.navButton, { backgroundColor: colors.card, borderColor: colors.border }]}><Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={19} color={saved ? colors.primary : colors.foreground} /></Pressable></View>
      <View style={[styles.companyHero, { backgroundColor: colors.secondary }]}><View style={[styles.companyMark, { backgroundColor: colors.card }]}><Text style={[styles.companyMarkText, { color: colors.primary }]}>{job.companyMark}</Text></View><View style={styles.companyCopy}><Text style={[styles.company, { color: colors.primary }]}>{job.company}</Text><Text style={[styles.title, { color: colors.foreground }]}>{job.title}</Text><Text style={[styles.posted, { color: colors.mutedForeground }]}>{job.postedAt} · {job.location}</Text></View></View>
      <View style={styles.pillRow}><View style={[styles.pill, { backgroundColor: colors.secondary }]}><Ionicons name="briefcase-outline" size={14} color={colors.primary} /><Text style={[styles.pillText, { color: colors.secondaryForeground }]}>{job.employmentType}</Text></View><View style={[styles.pill, { backgroundColor: colors.accent }]}><Ionicons name="layers-outline" size={14} color={colors.accentForeground} /><Text style={[styles.pillText, { color: colors.accentForeground }]}>{job.workMode}</Text></View></View>
      <View style={styles.quickFacts}><Fact icon="cash-outline" label="Salary" value={job.salary ?? 'Not disclosed'} /><Fact icon="calendar-outline" label="Closing date" value={job.closingDate} /><Fact icon="trending-up-outline" label="Experience" value={job.experience} /></View>
      <Section title="About the role"><Text style={[styles.body, { color: colors.mutedForeground }]}>{job.description}</Text></Section>
      <Section title="What you’ll need"><Text style={[styles.subLabel, { color: colors.foreground }]}>Skills</Text><View style={styles.skills}>{job.skills.map((skill) => <View key={skill} style={[styles.skill, { backgroundColor: colors.muted }]}><Text style={[styles.skillText, { color: colors.foreground }]}>{skill}</Text></View>)}</View><Text style={[styles.subLabel, { color: colors.foreground }]}>Education</Text><Text style={[styles.body, { color: colors.mutedForeground }]}>{job.education}</Text></Section>
      <Section title="How to apply"><Text style={[styles.body, { color: colors.mutedForeground }]}>{job.applicationEmail ? `Send your CV and a short introduction to ${job.applicationEmail}.` : 'Follow the employer’s application instructions to apply.'}</Text></Section>
      <Pressable testID="apply-now" onPress={apply} style={({ pressed }) => [styles.applyButton, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}><Text style={[styles.applyText, { color: colors.primaryForeground }]}>Apply now</Text><Ionicons name="arrow-forward" size={18} color={colors.primaryForeground} /></Pressable>
      <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>Please verify the employer and role details before sharing personal information.</Text>
    </Screen>
  );
}

function Fact({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  const colors = useColors();
  return <View style={styles.fact}><Ionicons name={icon} size={18} color={colors.primary} /><Text style={[styles.factLabel, { color: colors.mutedForeground }]}>{label}</Text><Text style={[styles.factValue, { color: colors.foreground }]} numberOfLines={2}>{value}</Text></View>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useColors();
  return <View style={styles.section}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>{children}</View>;
}

const styles = StyleSheet.create({
  nav: { flexDirection: 'row', justifyContent: 'space-between' },
  navButton: { width: 42, height: 42, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  companyHero: { borderRadius: 22, padding: 18, flexDirection: 'row', gap: 14, alignItems: 'center' },
  companyMark: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  companyMarkText: { fontFamily: 'Inter_700Bold', fontSize: 20 },
  companyCopy: { flex: 1, gap: 4 },
  company: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 22, lineHeight: 27 },
  posted: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  pillRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pill: { borderRadius: 999, paddingHorizontal: 11, paddingVertical: 7, flexDirection: 'row', gap: 5, alignItems: 'center' },
  pillText: { fontFamily: 'Inter_500Medium', fontSize: 11 },
  quickFacts: { flexDirection: 'row', gap: 9 },
  fact: { flex: 1, gap: 5 },
  factLabel: { fontFamily: 'Inter_400Regular', fontSize: 11 },
  factValue: { fontFamily: 'Inter_600SemiBold', fontSize: 12, lineHeight: 16 },
  section: { gap: 10 },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  subLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  body: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 22 },
  skills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 },
  skillText: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  applyButton: { borderRadius: 16, minHeight: 54, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10, marginTop: 4 },
  applyText: { fontFamily: 'Inter_700Bold', fontSize: 15 },
  disclaimer: { fontFamily: 'Inter_400Regular', fontSize: 11, textAlign: 'center', lineHeight: 16, paddingHorizontal: 14 },
  empty: { alignItems: 'center', justifyContent: 'center', flex: 1, gap: 10 },
  emptyTitle: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  emptyCopy: { fontFamily: 'Inter_400Regular', fontSize: 13, textAlign: 'center' },
  backText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, marginTop: 5 },
});