import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type RootStackParamList = {
  Home: undefined;
  Courses: undefined;
  CourseDetail: { id: string };
  Login: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>Ads learning</Text>
      <Text style={styles.title}>Simple courses, clear layout.</Text>
      <Text style={styles.body}>
        Browse published lessons on the go. Sign in when you need your profile.
      </Text>
      <View style={styles.actions}>
        <Pressable style={styles.primary} onPress={() => navigation.navigate('Courses')}>
          <Text style={styles.primaryText}>Browse catalog</Text>
        </Pressable>
        <Pressable style={styles.secondary} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.secondaryText}>Sign in</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', gap: 12 },
  kicker: { fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#64748b' },
  title: { fontSize: 28, fontWeight: '700', color: '#0f172a' },
  body: { fontSize: 16, lineHeight: 24, color: '#475569' },
  actions: { marginTop: 16, gap: 10 },
  primary: {
    backgroundColor: '#0f172a',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  secondary: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryText: { color: '#0f172a', fontWeight: '600', fontSize: 15 },
});
