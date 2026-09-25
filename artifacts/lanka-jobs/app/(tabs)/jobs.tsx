import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { JobCard } from '@/components/JobCard';
import { Screen } from '@/components/Screen';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

const filters = ['All', 'Technology', 'Finance', 'Education', 'Remote'];

export default function JobsScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ query?: string; category?: string }>();
  const { jobs, savedJobIds, toggleSaved } = useApp();
  const [query, setQuery] = useState(() => String(params.query ?? ''));
  const [selectedFilter, setSelectedFilter] = useState(() => String(params.category ?? 'All'));
  const results = useMemo(() => jobs.filter((job) => {
    const matchesQuery = `${job.title} ${job.company} ${job.location}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || (selectedFilter === 'Remote' ? job.workMode === 'Remote' : job.category === selectedFilter);
    return matchesQuery && matchesFilter;
  }), [jobs, query, selectedFilter]);
  return (
    <Screen>
      <View style={styles.header}><View><Text style={[styles.eyebrow, { color: colors.primary }]}>EXPLORE OPPORTUNITIES</Text><Text style={[styles.title, { color: colors.foreground }]}>Find your next job</Text></View><View style={[styles.count, { backgroundColor: colors.secondary }]}><Text style={[styles.countText, { color: colors.secondaryForeground }]}>{results.length}</Text></View></View>
      <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}><Ionicons name="search" size={19} color={colors.mutedForeground} /><TextInput testID="jobs-search" value={query} onChangeText={setQuery} placeholder="Search title, company or city" placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground }]} returnKeyType="search" /></View>
      <View style={styles.filterRow}>{filters.map((filter) => <Pressable key={filter} testID={`filter-${filter}`} onPress={() => setSelectedFilter(filter)} style={[styles.filter, { backgroundColor: selectedFilter === filter ? colors.primary : colors.card, borderColor: selectedFilter === filter ? colors.primary : colors.border }]}><Text style={[styles.filterText, { color: selectedFilter === filter ? colors.primaryForeground : colors.mutedForeground }]}>{filter}</Text></Pressable>)}</View>
      <View style={styles.resultHeader}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>All jobs</Text><Text style={[styles.resultMeta, { color: colors.mutedForeground }]}>Newest first</Text></View>
      {results.length > 0 ? results.map((job) => <JobCard key={job.id} job={job} saved={savedJobIds.includes(job.id)} onPress={() => router.push(`/job/${job.id}`)} onToggleSave={() => toggleSaved(job.id)} />) : <View style={[styles.empty, { borderColor: colors.border, backgroundColor: colors.card }]}><Ionicons name="search-outline" size={28} color={colors.mutedForeground} /><Text style={[styles.emptyTitle, { color: colors.foreground }]}>No jobs found</Text><Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Try another title, company, city, or filter.</Text></View>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 },
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 1.1, marginBottom: 5 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 28, letterSpacing: -0.7 },
  count: { minWidth: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  countText: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 16, paddingHorizontal: 14, minHeight: 52 },
  input: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 15 },
  filterRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  filter: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 8 },
  filterText: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 19 },
  resultMeta: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  empty: { borderWidth: 1, borderRadius: 18, padding: 28, alignItems: 'center', gap: 9 },
  emptyTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 13, textAlign: 'center' },
});