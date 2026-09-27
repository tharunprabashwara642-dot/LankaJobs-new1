import { Pressable, StyleSheet, Text, TextInput, View, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { Screen } from '@/components/Screen';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

export default function ProfileSetupScreen() {
  const colors = useColors();
  const router = useRouter();
  const { authUser, profile, updateProfile } = useApp();
  const [name, setName] = useState(authUser?.name ?? '');
  const [location, setLocation] = useState(profile?.location ?? '');
  const [interests, setInterests] = useState(profile?.interests.join(', ') ?? '');
  const [experience, setExperience] = useState(profile?.experience ?? '');
  const [education, setEducation] = useState(profile?.education ?? '');
  const [skills, setSkills] = useState(profile?.skills.join(', ') ?? '');
  const [employmentType, setEmploymentType] = useState(profile?.employmentType ?? 'Full-time');
  const [workPreference, setWorkPreference] = useState(profile?.workPreference ?? '');
  const [workMode, setWorkMode] = useState(profile?.workMode ?? 'Hybrid');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!name.trim() || !location.trim()) {
      Alert.alert('A little more detail', 'Name and location are required to finish your profile.');
      return;
    }
    setBusy(true);
    try {
      await updateProfile({
        name: name.trim(),
        location: location.trim(),
        interests: interests.split(',').map((item) => item.trim()).filter(Boolean),
        experience: experience.trim(),
        education: education.trim(),
        skills: skills.split(',').map((item) => item.trim()).filter(Boolean),
        employmentType,
        workPreference: workPreference.trim(),
        workMode,
      });
      router.replace('/profile');
    } catch (error) {
      Alert.alert('Could not save profile', error instanceof Error ? error.message : 'Please try again.');
    } finally { setBusy(false); }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <KeyboardAwareScrollViewCompat contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>WELCOME TO LANKAJOBS</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Tell us what work fits you.</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>This powers transparent job recommendations. You can edit these details anytime.</Text>
        <Field label="Name" value={name} setValue={setName} placeholder="Your full name" colors={colors} />
        <Field label="Location" value={location} setValue={setLocation} placeholder="Colombo, Kandy, or another city" colors={colors} />
        <Field label="Job interests" value={interests} setValue={setInterests} placeholder="Technology, Finance" colors={colors} />
        <Field label="Experience" value={experience} setValue={setExperience} placeholder="Entry level, 2 years, 5+ years" colors={colors} />
        <Field label="Education" value={education} setValue={setEducation} placeholder="Degree, diploma, or qualification" colors={colors} />
        <Field label="Skills" value={skills} setValue={setSkills} placeholder="React, sales, accounting" colors={colors} />
        <Choice label="Employment type" options={['Full-time', 'Part-time', 'Internship', 'Contract']} value={employmentType} onChange={setEmploymentType} colors={colors} />
        <Field label="Work preference" value={workPreference} setValue={setWorkPreference} placeholder="What kind of work environment suits you?" colors={colors} />
        <Choice label="Work mode" options={['On-site', 'Hybrid', 'Remote']} value={workMode} onChange={setWorkMode} colors={colors} />
        <Pressable disabled={busy} onPress={() => { void submit(); }} style={[styles.submit, { backgroundColor: colors.primary, opacity: busy ? 0.55 : 1 }]}><Text style={[styles.submitText, { color: colors.primaryForeground }]}>{busy ? 'Saving…' : 'Save profile'}</Text></Pressable>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

function Field({ label, value, setValue, placeholder, colors }: { label: string; value: string; setValue: (value: string) => void; placeholder: string; colors: ReturnType<typeof useColors> }) {
  return <View style={styles.field}><Text style={[styles.label, { color: colors.foreground }]}>{label}</Text><TextInput value={value} onChangeText={setValue} placeholder={placeholder} placeholderTextColor={colors.mutedForeground} style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]} /></View>;
}

function Choice({ label, options, value, onChange, colors }: { label: string; options: string[]; value: string; onChange: (value: string) => void; colors: ReturnType<typeof useColors> }) {
  return <View style={styles.field}><Text style={[styles.label, { color: colors.foreground }]}>{label}</Text><View style={styles.choices}>{options.map((option) => <Pressable key={option} onPress={() => onChange(option)} style={[styles.choice, { backgroundColor: value === option ? colors.primary : colors.card, borderColor: value === option ? colors.primary : colors.border }]}><Text style={[styles.choiceText, { color: value === option ? colors.primaryForeground : colors.foreground }]}>{option}</Text></Pressable>)}</View></View>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 20, gap: 16, paddingTop: 58, paddingBottom: 35 },
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 1.1 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 29, lineHeight: 34, letterSpacing: -0.7 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, marginTop: -7 },
  field: { gap: 7 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  input: { borderWidth: 1, borderRadius: 14, minHeight: 50, paddingHorizontal: 14, fontFamily: 'Inter_400Regular', fontSize: 14 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  choice: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9 },
  choiceText: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  submit: { minHeight: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  submitText: { fontFamily: 'Inter_700Bold', fontSize: 15 },
});