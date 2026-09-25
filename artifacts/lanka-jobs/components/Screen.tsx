import { PropsWithChildren } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

export function Screen({ children, scroll = true }: PropsWithChildren<{ scroll?: boolean }>) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const content = (
    <View style={[styles.content, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 14), paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 18) }]}>
      {children}
    </View>
  );
  return <View style={[styles.root, { backgroundColor: colors.background }]}>{scroll ? <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>{content}</ScrollView> : content}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1 },
  content: { paddingHorizontal: 20, gap: 20, width: '100%', maxWidth: 680, alignSelf: 'center' },
});