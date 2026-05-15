import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { Course } from '@repo/types';
import { apiGet } from '../lib/api';

type RootStackParamList = {
  Home: undefined;
  Courses: undefined;
  CourseDetail: { id: string };
  Login: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Courses'>;

type ListResponse = { items: Course[] };

export function CoursesScreen({ navigation }: Props) {
  const q = useQuery({
    queryKey: ['courses'],
    queryFn: () => apiGet<ListResponse>('/courses?limit=50'),
  });

  if (q.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <Text style={styles.muted}>Loading courses…</Text>
      </View>
    );
  }

  if (q.isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Could not load courses. Is the API running?</Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={{ padding: 16, gap: 12 }}
      data={q.data?.items ?? []}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          onPress={() => navigation.navigate('CourseDetail', { id: item._id })}
        >
          <Text style={styles.cardKicker}>{item.category?.name ?? 'Course'}</Text>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardBody} numberOfLines={2}>
            {item.description}
          </Text>
          <Text style={styles.price}>${item.price}</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 },
  muted: { color: '#64748b', marginTop: 8 },
  error: { color: '#be123c', textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  cardKicker: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#64748b' },
  cardTitle: { fontSize: 17, fontWeight: '600', color: '#0f172a' },
  cardBody: { fontSize: 14, color: '#475569', lineHeight: 20 },
  price: { marginTop: 4, fontWeight: '700', color: '#0f172a' },
});
