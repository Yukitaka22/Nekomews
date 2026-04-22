import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Card, Button, EmptyState, CatAvatar } from '@/components';
import { Colors } from '@/constants/colors';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/hooks/useAuthStore';

export default function HomeScreen() {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const userId = session?.user?.id;

  const { data: cats, isLoading } = useQuery({
    queryKey: ['cats', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('cats')
        .select('*')
        .eq('owner_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });

  const { data: upcomingBookings } = useQuery({
    queryKey: ['upcoming-bookings', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('owner_id', userId)
        .in('status', ['accepted', 'confirmed'])
        .gte('start_at', new Date().toISOString())
        .order('start_at', { ascending: true })
        .limit(3);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });

  const displayName = session?.user?.user_metadata?.display_name ?? 'ゲスト';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.greeting}>
          <Text style={styles.helloText}>こんにちは 🐾</Text>
          <Text style={styles.displayName}>{displayName}さん</Text>
        </View>

        {/* 猫のサマリカード */}
        <Text style={styles.sectionTitle}>うちの子</Text>
        {isLoading ? (
          <Text style={styles.loading}>読み込み中…</Text>
        ) : !cats || cats.length === 0 ? (
          <EmptyState
            emoji="🐈"
            title="まだ猫が登録されていません"
            message="プロフィールから、うちの子を登録してみましょう"
            ctaLabel="猫を登録"
            onCtaPress={() => router.push('/(owner)/cats/new')}
          />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
            {cats.map((cat) => (
              <Card
                key={cat.id}
                onPress={() => router.push(`/(owner)/cats/${cat.id}`)}
                style={styles.catCard}
                elevated
              >
                <CatAvatar uri={cat.avatar_url} name={cat.name} size="lg" />
                <Text style={styles.catName}>{cat.name}</Text>
                {cat.breed && <Text style={styles.catBreed}>{cat.breed}</Text>}
              </Card>
            ))}
            <Pressable onPress={() => router.push('/(owner)/cats/new')} style={styles.addCatCard}>
              <Text style={{ fontSize: 28, color: Colors.neutral.whisker }}>＋</Text>
              <Text style={styles.addCatLabel}>追加</Text>
            </Pressable>
          </ScrollView>
        )}

        {/* 次の予約 */}
        <Text style={styles.sectionTitle}>次の予約</Text>
        {!upcomingBookings || upcomingBookings.length === 0 ? (
          <Card>
            <Text style={styles.noBookings}>まだ予約がありません</Text>
            <Button onPress={() => router.push('/(owner)/search')} variant="secondary" size="sm" style={{ marginTop: 12 }}>
              シッターを探す
            </Button>
          </Card>
        ) : (
          upcomingBookings.map((b) => (
            <Card key={b.id} onPress={() => router.push(`/(owner)/booking/${b.id}`)} style={{ marginBottom: 12 }}>
              <Text style={styles.bookingDate}>
                {new Date(b.start_at).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })}
              </Text>
              <Text style={styles.bookingTime}>
                {new Date(b.start_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                {' 〜 '}
                {new Date(b.end_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </Card>
          ))
        )}

        {/* クイックアクション */}
        <Text style={styles.sectionTitle}>すぐ使う</Text>
        <View style={styles.quickActions}>
          <QuickAction emoji="🔍" label="シッターを探す" onPress={() => router.push('/(owner)/search')} />
          <QuickAction emoji="📸" label="日記を書く" onPress={() => router.push('/(owner)/journal/new')} />
          <QuickAction emoji="💬" label="メッセージ" onPress={() => router.push('/(owner)/messages')} />
          <QuickAction emoji="🏡" label="里親を探す" onPress={() => router.push('/(owner)/search?tab=adoption')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickAction({ emoji, label, onPress }: { emoji: string; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.quickCard}>
      <Text style={{ fontSize: 28 }}>{emoji}</Text>
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.owner.bg },
  content: { padding: 16, paddingBottom: 32 },
  greeting: { marginBottom: 24 },
  helloText: { fontSize: 14, color: Colors.neutral.whisker },
  displayName: { fontSize: 24, fontWeight: '700', color: Colors.neutral.ink, marginTop: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.neutral.ink, marginTop: 24, marginBottom: 12 },
  loading: { color: Colors.neutral.whisker, fontSize: 13 },
  catCard: { width: 120, alignItems: 'center', gap: 6 },
  catName: { fontSize: 14, fontWeight: '700', color: Colors.neutral.ink, marginTop: 8 },
  catBreed: { fontSize: 11, color: Colors.neutral.whisker },
  addCatCard: {
    width: 120, height: 120, borderRadius: 16,
    borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.neutral.fur,
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  addCatLabel: { fontSize: 12, color: Colors.neutral.whisker },
  noBookings: { fontSize: 13, color: Colors.neutral.whisker, textAlign: 'center', paddingVertical: 8 },
  bookingDate: { fontSize: 15, fontWeight: '700', color: Colors.neutral.ink },
  bookingTime: { fontSize: 13, color: Colors.neutral.whisker, marginTop: 4 },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickCard: {
    width: '47%',
    padding: 20,
    backgroundColor: Colors.neutral.snow,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  quickLabel: { fontSize: 13, fontWeight: '600', color: Colors.neutral.ink },
});
