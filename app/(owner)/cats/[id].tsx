import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { CatAvatar, Card, Badge, Button, ErrorState } from '@/components';
import { Colors } from '@/constants/colors';
import { supabase } from '@/lib/supabase';

export default function CatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: cat, isLoading, error, refetch } = useQuery({
    queryKey: ['cat', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('cats').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.owner.primary} />
      </SafeAreaView>
    );
  }

  if (error || !cat) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState title="猫の情報が見つかりませんでした" onRetry={refetch} />
      </SafeAreaView>
    );
  }

  const birthDate = cat.birth_date ? new Date(cat.birth_date) : null;
  const ageYears = birthDate
    ? Math.floor((Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365))
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: cat.name, headerBackTitle: '戻る' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroSection}>
          <CatAvatar uri={cat.avatar_url} name={cat.name} size="xl" />
          <Text style={styles.name}>{cat.name}</Text>
          {cat.breed && <Text style={styles.breed}>{cat.breed}</Text>}
          <View style={styles.metaRow}>
            {cat.gender !== 'unknown' && (
              <Badge variant="info">{cat.gender === 'male' ? '♂️ オス' : '♀️ メス'}</Badge>
            )}
            {ageYears !== null && <Badge variant="default">{ageYears}歳</Badge>}
          </View>
        </View>

        {/* 性格タグ */}
        {Array.isArray(cat.personality_tags) && cat.personality_tags.length > 0 && (
          <Card style={{ marginBottom: 12 }}>
            <Text style={styles.sectionTitle}>性格</Text>
            <View style={styles.tagRow}>
              {cat.personality_tags.map((t: string) => (
                <Badge key={t} variant="primary">#{t}</Badge>
              ))}
            </View>
          </Card>
        )}

        {/* アレルギー・既往歴 */}
        {cat.allergy_notes && (
          <Card style={{ marginBottom: 12 }}>
            <Text style={styles.sectionTitle}>アレルギー・要注意事項</Text>
            <Text style={styles.bodyText}>{cat.allergy_notes}</Text>
          </Card>
        )}

        {/* 体重履歴 */}
        <Card style={{ marginBottom: 12 }}>
          <Text style={styles.sectionTitle}>体重の記録</Text>
          {Array.isArray(cat.weight_history) && cat.weight_history.length > 0 ? (
            cat.weight_history.slice(-5).reverse().map((w: any, i: number) => (
              <View key={i} style={styles.weightRow}>
                <Text style={styles.weightDate}>
                  {new Date(w.date).toLocaleDateString('ja-JP')}
                </Text>
                <Text style={styles.weightValue}>{w.kg} kg</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>まだ記録がありません</Text>
          )}
          <Button onPress={() => {}} variant="secondary" size="sm" style={{ marginTop: 12 }}>
            体重を記録する
          </Button>
        </Card>

        {/* ワクチン・医療 */}
        <Card style={{ marginBottom: 12 }}>
          <Text style={styles.sectionTitle}>医療記録</Text>
          {Array.isArray(cat.medical_history) && cat.medical_history.length > 0 ? (
            cat.medical_history.map((m: any, i: number) => (
              <View key={i} style={styles.medRow}>
                <Text style={styles.medDate}>{new Date(m.date).toLocaleDateString('ja-JP')}</Text>
                <Text style={styles.medNote}>{m.note}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>まだ記録がありません</Text>
          )}
        </Card>

        <Button onPress={() => router.push(`/(owner)/cats/${id}/edit`)} variant="secondary" fullWidth>
          プロフィールを編集
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.owner.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, paddingBottom: 32 },
  heroSection: { alignItems: 'center', padding: 24, marginBottom: 16 },
  name: { fontSize: 28, fontWeight: '700', color: Colors.neutral.ink, marginTop: 12 },
  breed: { fontSize: 14, color: Colors.neutral.whisker, marginTop: 4 },
  metaRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.neutral.ink, marginBottom: 10 },
  bodyText: { fontSize: 14, color: Colors.neutral.ink, lineHeight: 20 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  weightRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  weightDate: { fontSize: 13, color: Colors.neutral.whisker },
  weightValue: { fontSize: 14, fontWeight: '700', color: Colors.neutral.ink },
  emptyText: { fontSize: 13, color: Colors.neutral.whisker, textAlign: 'center', paddingVertical: 8 },
  medRow: { paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.neutral.fur },
  medDate: { fontSize: 12, color: Colors.neutral.whisker },
  medNote: { fontSize: 14, color: Colors.neutral.ink, marginTop: 2 },
});
