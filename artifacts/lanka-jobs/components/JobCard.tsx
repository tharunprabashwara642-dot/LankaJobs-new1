import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Job } from '@/data/jobs';
import { useColors } from '@/hooks/useColors';

type Props = {
  job: Job;
  saved: boolean;
  onPress: () => void;
  onToggleSave: () => void | Promise<void>;
  compact?: boolean;
};

export function JobCard({ job, saved, onPress, onToggleSave, compact = false }: Props) {
  const colors = useColors();
  return (
    <Pressable
      testID={`job-card-${job.id}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.88 : 1 }]}
    >
      <View style={styles.row}>
        <View style={[styles.companyMark, { backgroundColor: job.isDemo ? colors.secondary : colors.accent }]}>
          <Text style={[styles.companyMarkText, { color: job.isDemo ? colors.primary : colors.accentForeground }]}>{job.companyMark}</Text>
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>{job.title}</Text>
          <Text style={[styles.company, { color: colors.mutedForeground }]}>{job.company}</Text>
        </View>
        <Pressable testID={`save-${job.id}`} onPress={() => { void onToggleSave(); }} hitSlop={12} style={styles.saveButton}>
          <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={21} color={saved ? colors.primary : colors.mutedForeground} />
        </Pressable>
      </View>
      {!compact && (
        <>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}><Ionicons name="location-outline" size={14} color={colors.mutedForeground} /><Text style={[styles.meta, { color: colors.mutedForeground }]}>{job.location}</Text></View>
            <View style={styles.metaItem}><Ionicons name="briefcase-outline" size={14} color={colors.mutedForeground} /><Text style={[styles.meta, { color: colors.mutedForeground }]}>{job.employmentType}</Text></View>
          </View>
          <View style={styles.footer}>
            <View style={[styles.pill, { backgroundColor: colors.secondary }]}><Text style={[styles.pillText, { color: colors.secondaryForeground }]}>{job.workMode}</Text></View>
            <Text style={[styles.posted, { color: colors.mutedForeground }]}>{job.postedAt}</Text>
          </View>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 18, padding: 16, gap: 14, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  companyMark: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  companyMarkText: { fontSize: 17, fontWeight: '700' },
  content: { flex: 1, gap: 3 },
  title: { fontFamily: 'Inter_600SemiBold', fontSize: 16, lineHeight: 21 },
  company: { fontFamily: 'Inter_400Regular', fontSize: 13 },
  saveButton: { padding: 1 },
  metaRow: { flexDirection: 'row', gap: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  meta: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pill: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  pillText: { fontFamily: 'Inter_500Medium', fontSize: 11 },
  posted: { fontFamily: 'Inter_400Regular', fontSize: 12 },
});