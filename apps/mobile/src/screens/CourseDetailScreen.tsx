import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Course } from '@repo/types';
import { apiGet } from '../lib/api';

type RootStackParamList = {
  Home: undefined;
  Courses: undefined;
  CourseDetail: { id: string };
  Login: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'CourseDetail'>;

export function CourseDetailScreen({ route }: Props) {
  const { id } = route.params;
  const q = useQuery({
    queryKey: ['course', id],
    queryFn: () => apiGet<Course>(`/courses/${id}`),
  });

  if (q.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (q.isError || !q.data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Course not found.</Text>
      </View>
    );
  }

  const c = q.data;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>{c.category?.name ?? 'Course'}</Text>
      <Text style={styles.title}>{c.title}</Text>
      <Text style={styles.price}>${c.price}</Text>
      <Text style={styles.body}>{c.description}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  error: { color: '#be123c' },
  container: { padding: 20, gap: 10 },
  kicker: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#64748b' },
  title: { fontSize: 26, fontWeight: '700', color: '#0f172a' },
  price: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
  body: { fontSize: 16, lineHeight: 24, color: '#475569' },
});
