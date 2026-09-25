import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { JobCard } from '@/components/JobCard';
import { Screen } from '@/components/Screen';
import { categories } from '@/data/jobs';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { jobs, savedJobIds, toggleSaved } = useApp();
  const [query, setQuery] = useState('');
  const latest = jobs.slice(0, 4);
  const remote = useMemo(() => jobs.filter((job) => job.workMode === 'Remote').slice(0, 2), [jobs]);
  const search = () => router.push(query.trim() ? `/jobs?query=${encodeURIComponent(query.trim())}` : '/jobs');
  return (
    <Screen>
      <View style={styles.topRow}><View><Text style={[styles.brand, { color: colors.foreground }]}>Lanka<Text style={{ color: colors.primary }}>Jobs</Text></Text><Text style={[styles.greeting, { color: colors.mutedForeground }]}>Find work that moves you forward.</Text></View><Pressable testID="home-profile" onPress={() => router.push('/profile')} style={[styles.profileButton, { backgroundColor: colors.secondary }]}><Ionicons name="person-outline" size={20} color={colors.primary} /></Pressable></View>
      <View style={[styles.hero, { backgroundColor: colors.primary }]}><Text style={styles.heroKicker}>OPPORTUNITIES ACROSS SRI LANKA</Text><Text style={[styles.heroTitle, { color: colors.primaryForeground }]}>Your next chapter starts here.</Text><Text style={styles.heroCopy}>Search trusted roles from companies hiring now.</Text><View style={[styles.searchBox, { backgroundColor: colors.card }]}><Ionicons name="search" size={19} color={colors.mutedForeground} /><TextInput testID="home-search" value={query} onChangeText={setQuery} onSubmitEditing={search} placeholder="Job title, company or location" placeholderTextColor={colors.mutedForeground} style={[styles.searchInput, { color: colors.foreground }]} returnKeyType="search" /><Pressable testID="home-search-submit" onPress={search} style={[styles.searchButton, { backgroundColor: colors.accent }]}><Ionicons name="arrow-forward" size={18} color={colors.accentForeground} /></Pressable></View></View>
      <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Browse by category</Text><Pressable onPress={() => router.push('/jobs')}><Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text></Pressable></View>
      <View style={styles.categoryGrid}>{categories.map((category) => <Pressable key={category.name} testID={`category-${category.name}`} onPress={() => router.push(`/jobs?category=${encodeURIComponent(category.name)}`)} style={[styles.category, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.categoryIcon, { backgroundColor: category.colorKey === 'gold' ? colors.accent : colors.secondary }]}><Ionicons name={category.icon} size={18} color={category.colorKey === 'gold' ? colors.accentForeground : colors.primary} /></View><Text style={[styles.categoryText, { color: colors.foreground }]} numberOfLines={1}>{category.name}</Text></Pressable>)}</View>
      <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Latest jobs</Text><Pressable onPress={() => router.push('/jobs')}><Text style={[styles.seeAll, { color: colors.primary }]}>View all</Text></Pressable></View>
      {latest.map((job) => <JobCard key={job.id} job={job} saved={savedJobIds.includes(job.id)} onPress={() => router.push(`/job/${job.id}`)} onToggleSave={() => toggleSaved(job.id)} />)}
      <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Remote work</Text><Pressable onPress={() => router.push('/jobs')}><Text style={[styles.seeAll, { color: colors.primary }]}>Explore</Text></Pressable></View>
      {remote.map((job) => <JobCard key={job.id} job={job} compact saved={savedJobIds.includes(job.id)} onPress={() => router.push(`/job/${job.id}`)} onToggleSave={() => toggleSaved(job.id)} />)}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { fontFamily: 'Inter_700Bold', fontSize: 26, letterSpacing: -0.7 },
  greeting: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 4 },
  profileButton: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  hero: { borderRadius: 24, padding: 20, gap: 10 },
  heroKicker: { color: 'rgba(255,255,255,0.72)', fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.2 },
  heroTitle: { fontFamily: 'Inter_700Bold', fontSize: 26, lineHeight: 31, letterSpacing: -0.6, maxWidth: 300 },
  heroCopy: { color: 'rgba(255,255,255,0.78)', fontFamily: 'Inter_400Regular', fontSize: 13 },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 15, padding: 6, paddingLeft: 13, marginTop: 5 },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 13, minHeight: 38 },
  searchButton: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  seeAll: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  category: { borderWidth: 1, borderRadius: 16, width: '31.8%', padding: 11, gap: 8 },
  categoryIcon: { width: 32, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  categoryText: { fontFamily: 'Inter_500Medium', fontSize: 11 },
});
