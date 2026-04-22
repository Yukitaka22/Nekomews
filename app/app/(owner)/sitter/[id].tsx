import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { CatAvatar, Card, Badge, Button, RatingStars, PriceTag, ErrorState } from '@/components';
import { Colors } from '@/constants/colors';
import { supabase } from '@/lib/supabase';

export default function SitterDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: sitter, isLoading, error, refetch } = useQuery({
    queryKey: ['sitter', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sitter_profiles')
        .select(`
          *,
          users!inner(display_name, avatar_url, area_city, area_prefecture)
        `)
        .eq('user_id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('reviewee_id', id)
        .eq('direction', 'owner_to_sitter')
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })
        .limit(5);
      return data ?? [];
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
  if (error || !sitter) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState title="シッター情報が見つかりませんでした" onRetry={refetch} />
      </SafeAreaView>
    );
  }

  const services = sitter.services as { visit?: boolean; boarding?: boolean };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: (sitter as any).users?.display_name ?? 'シッター', headerBackTitle: '戻る' }} />
      <ScrollView contentContainerStyle={styles.content}>
        {/* ヘッダー */}
        <Card elevated style={{ marginBottom: 14 }}>
          <View style={styles.heroRow}>
            <CatAvatar uri={(sitter as any).users?.avatar_url} size="xl" />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{(sitter as any).users?.display_name}</Text>
                {sitter.license_verified && <Badge variant="success" small>認定</Badge>}
              </View>
              <Text style={styles.area}>
                📍 {(sitter as any).users?.area_prefecture}{(sitter as any).users?.area_city}
              </Text>
              <View style={{ marginTop: 8 }}>
                <RatingStars rating={4.7} count={reviews?.length ?? 0} size={14} />
              </View>
              <Text style={styles.experience}>
                シッター歴 {sitter.experience_years ?? 0}年
              </Text>
            </View>
          </View>
        </Card>

        {/* 自己紹介 */}
        <Card style={{ marginBottom: 14 }}>
          <Text style={styles.sectionTitle}>自己紹介</Text>
          <Text style={styles.bio}>{sitter.bio || '—'}</Text>
        </Card>

        {/* 提供サービス */}
        <Card style={{ marginBottom: 14 }}>
          <Text style={styles.sectionTitle}>対応サービス</Text>
          <View style={{ gap: 8, marginTop: 8 }}>
            {services?.visit && <ServiceRow icon="🏠" label="飼い主宅への訪問ケア" />}
            {services?.boarding && <ServiceRow icon="🛏️" label="自宅での預かり" />}
          </View>
        </Card>

        {/* 料金 */}
        <Card style={{ marginBottom: 14 }}>
          <Text style={styles.sectionTitle}>料金</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>基本料金</Text>
            <PriceTag amount={sitter.base_rate} size="md" suffix="/時間" />
          </View>
          <Text style={styles.priceNote}>※ 別途プラットフォーム手数料・交通費</Text>
        </Card>

        {/* レビュー */}
        <Card style={{ marginBottom: 14 }}>
          <Text style={styles.sectionTitle}>レビュー</Text>
          {!reviews || reviews.length === 0 ? (
            <Text style={styles.noReviews}>まだレビューはありません</Text>
          ) : (
            reviews.map((r: any) => (
              <View key={r.id} style={styles.reviewItem}>
                <RatingStars rating={r.rating} size={12} showScore={false} />
                <Text style={styles.reviewDate}>
                  {new Date(r.published_at).toLocaleDateString('ja-JP')}
                </Text>
                {r.comment && <Text style={styles.reviewComment}>{r.comment}</Text>}
              </View>
            ))
          )}
        </Card>

        <Button
          onPress={() => router.push(`/(owner)/booking/new?sitter_id=${id}`)}
          fullWidth
          size="lg"
        >
          このシッターに依頼する
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

function ServiceRow({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.serviceRow}>
      <Text style={{ fontSize: 20 }}>{icon}</Text>
      <Text style={styles.serviceText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.owner.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, paddingBottom: 32 },
  heroRow: { flexDirection: 'row', alignItems: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 20, fontWeight: '700', color: Colors.neutral.ink },
  area: { fontSize: 12, color: Colors.neutral.whisker, marginTop: 4 },
  experience: { fontSize: 12, color: Colors.neutral.whisker, marginTop: 6 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.neutral.ink, marginBottom: 4 },
  bio: { fontSize: 14, color: Colors.neutral.ink, lineHeight: 22 },
  serviceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  serviceText: { fontSize: 14, color: Colors.neutral.ink },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  priceLabel: { fontSize: 13, color: Colors.neutral.whisker },
  priceNote: { fontSize: 11, color: Colors.neutral.whisker, marginTop: 8 },
  noReviews: { fontSize: 13, color: Colors.neutral.whisker, marginTop: 8 },
  reviewItem: {
    paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.neutral.fur,
  },
  reviewDate: { fontSize: 11, color: Colors.neutral.whisker, marginTop: 2 },
  reviewComment: { fontSize: 13, color: Colors.neutral.ink, marginTop: 6, lineHeight: 20 },
});
