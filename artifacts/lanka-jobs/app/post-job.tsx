import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PostJobScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addJob, categories, authUser } = useApp();
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technology');

  const submit = async () => {
    if (!authUser) {
      router.push('/sign-in');
      return;
    }
    if (!title.trim() || !company.trim() || !location.trim() || !email.trim() || !description.trim()) {
      Alert.alert('Almost there', 'Please complete every field before saving your listing.');
      return;
    }
    try {
      await addJob({
        title: title.trim(),
        company: company.trim(),
        description: description.trim(),
        categoryId: categories.find((item) => item.name === category)?.id,
        location: location.trim(),
        employmentType: 'Full-time',
        workMode: 'On-site',
        experience: 'Not specified',
        education: 'Not specified',
        skills: [],
        applicationEmail: email.trim(),
      });
      Alert.alert('Draft saved', 'Your draft is stored in LankaJobs. Submit it from My jobs when it is ready for review.', [{ text: 'Done', onPress: () => router.back() }]);
    } catch (error) {
      Alert.alert('Could not save job', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <KeyboardAwareScrollViewCompat contentContainerStyle={[styles.content, { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 22 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.nav}><Pressable onPress={() => router.back()} style={[styles.back, { backgroundColor: colors.card, borderColor: colors.border }]}><Ionicons name="arrow-back" size={19} color={colors.foreground} /></Pressable><View><Text style={[styles.navTitle, { color: colors.foreground }]}>Post a job</Text><Text style={[styles.navSub, { color: colors.mutedForeground }]}>Free in the initial version</Text></View><View style={{ width: 42 }} /></View>
        <View style={[styles.banner, { backgroundColor: colors.secondary }]}><Ionicons name="shield-checkmark-outline" size={21} color={colors.primary} /><Text style={[styles.bannerText, { color: colors.secondaryForeground }]}>Share clear, legitimate opportunities. Every submitted job will be designed for future review.</Text></View>
        <Field label="Job title" value={title} onChangeText={setTitle} placeholder="e.g. Operations Executive" colors={colors} />
        <Field label="Company or employer name" value={company} onChangeText={setCompany} placeholder="e.g. Serendib Holdings" colors={colors} />
        <Field label="Location" value={location} onChangeText={setLocation} placeholder="e.g. Colombo 02 or Remote" colors={colors} />
        <Field label="Application email" value={email} onChangeText={setEmail} placeholder="careers@company.com" colors={colors} keyboardType="email-address" />
        <View style={styles.field}><Text style={[styles.label, { color: colors.foreground }]}>Category</Text><View style={styles.categoryRow}>{categories.map((item) => <Pressable key={item.name} onPress={() => setCategory(item.name)} style={[styles.category, { backgroundColor: category === item.name ? colors.primary : colors.card, borderColor: category === item.name ? colors.primary : colors.border }]}><Text style={[styles.categoryText, { color: category === item.name ? colors.primaryForeground : colors.foreground }]}>{item.name}</Text></Pressable>)}</View></View>
        <View style={styles.field}><Text style={[styles.label, { color: colors.foreground }]}>Description</Text><TextInput multiline value={description} onChangeText={setDescription} placeholder="Tell candidates what they will do and what good looks like." placeholderTextColor={colors.mutedForeground} style={[styles.textArea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]} textAlignVertical="top" /></View>
        <Pressable testID="save-job-draft" onPress={submit} style={({ pressed }) => [styles.submit, { backgroundColor: colors.primary, opacity: pressed ? 0.86 : 1 }]}><Text style={[styles.submitText, { color: colors.primaryForeground }]}>Save job draft</Text><Ionicons name="arrow-forward" size={18} color={colors.primaryForeground} /></Pressable>
         <Text style={[styles.note, { color: colors.mutedForeground }]}>No payment is required. Drafts are private until you submit them for moderation.</Text>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

function Field({ label, value, onChangeText, placeholder, colors, keyboardType }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; colors: ReturnType<typeof useColors>; keyboardType?: 'default' | 'email-address' }) {
  return <View style={styles.field}><Text style={[styles.label, { color: colors.foreground }]}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.mutedForeground} keyboardType={keyboardType} style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]} /></View>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 17, width: '100%', maxWidth: 680, alignSelf: 'center' },
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  back: { width: 42, height: 42, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontFamily: 'Inter_700Bold', fontSize: 19, textAlign: 'center' },
  navSub: { fontFamily: 'Inter_400Regular', fontSize: 11, textAlign: 'center', marginTop: 2 },
  banner: { borderRadius: 16, padding: 14, flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  bannerText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 12, lineHeight: 18 },
  field: { gap: 7 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  input: { borderWidth: 1, borderRadius: 14, minHeight: 50, paddingHorizontal: 14, fontFamily: 'Inter_400Regular', fontSize: 14 },
  textArea: { borderWidth: 1, borderRadius: 14, minHeight: 135, padding: 14, fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20 },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  category: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 8 },
  categoryText: { fontFamily: 'Inter_500Medium', fontSize: 11 },
  submit: { minHeight: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10, marginTop: 3 },
  submitText: { fontFamily: 'Inter_700Bold', fontSize: 15 },
  note: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16, textAlign: 'center', paddingHorizontal: 18 },
});