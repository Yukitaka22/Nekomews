import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Card, CatAvatar, RatingStars, PriceTag, EmptyState, SitterCardSkeleton, Badge } from '@/components';
import { Colors } from '@/constants/colors';
import { supabase } from '@/lib/supabase';

type Tab = 'sitter' | 'adoption';

export default function SearchScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('sitter');
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'distance'>('rating');

  const { data: sitters, isLoading } = useQuery({
    queryKey: ['sitters', sortBy],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sitter_profiles')
        .select(`
          user_id,
          bio,
          base_rate,
          experience_years,
          services,
          license_verified,
          users!inner(display_name, avatar_url, area_city, area_prefecture)
        `)
        .eq('acceptance_status', 'active')
        .order(sortBy === 'price' ? 'base_rate' : 'experience_years', {
          ascending: sortBy === 'price',
        })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
    enabled: tab === 'sitter',
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>探す</Text>
      </View>

      {/* タブ切替 */}
      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, tab === 'sitter' && styles.tabActive]}
          onPress={() => setTab('sitter')}
        >
          <Text style={[styles.tabText, tab === 'sitter' && styles.tabTextActive]}>
            🤝 シッター
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, tab === 'adoption' && styles.tabActive]}
          onPress={() => setTab('adoption')}
        >
          <Text style={[styles.tabText, tab === 'adoption' && styles.tabTextActive]}>
            🏡 里親募集
          </Text>
        </Pressable>
      </View>

      {tab === 'sitter' ? (
        <>
          {/* ソート */}
          <View style={styles.sortRow}>
            <SortChip active={sortBy === 'rating'} label="評価順" onPress={() => setSortBy('rating')} />
            <SortChip active={sortBy === 'price'} label="料金順" onPress={() => setSortBy('price')} />
            <SortChip active={sortBy === 'distance'} label="近い順" onPress={() => setSortBy('distance')} />
          </View>

          {/* リスト */}
          {isLoading ? (
            <View>
              {[0, 1, 2, 3, 4].map((i) => (
                <SitterCardSkeleton key={i} />
              ))}
            </View>
          ) : !sitters || sitters.length === 0 ? (
            <EmptyState
              emoji="🔍"
              title="まだシッターがいません"
              message="Nekomewsはローンチ準備中です。もう少々お待ちください🐾"
            />
          ) : (
            <FlatList
              data={sitters}
              keyExtractor={(item: any) => item.user_id}
              contentContainerStyle={{ paddingBottom: 32 }}
              renderItem={({ item }: { item: any }) => (
                <SitterCard
                  sitter={item}
                  onPress={() => router.push(`/(owner)/sitter/${item.user_id}`)}
                />
              )}
            />
          )}
        </>
      ) : (
        <EmptyState
          emoji="🏡"
          title="里親募集はPhase 2で公開予定"
          message="保護団体と連携したマッチング機能を準備中です"
        />
      )}
    </SafeAreaView>
  );
}

function SortChip({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.sortChip, active && styles.sortChipActive]}
    >
      <Text style={[styles.sortText, active && styles.sortTextActive]}>{label}</Text>
    </Pressable>
  );
}

function SitterCard({ sitter, onPress }: { sitter: any; onPress: () => void }) {
  return (
    <Card onPress={onPress} style={styles.sitterCard}>
      <View style={styles.sitterRow}>
        <CatAvatar uri={sitter.users?.avatar_url} size="md" />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={styles.nameRow}>
            <Text style={styles.sitterName}>{sitter.users?.display_name}</Text>
            {sitter.license_verified && <Badge variant="success" small>認定</Badge>}
          </View>
          <Text style={styles.sitterArea}>
            {sitter.users?.area_prefecture}{sitter.users?.area_city}
          </Text>
          <View style={styles.sitterMeta}>
            <RatingStars rating={4.7} count={23} size={12} />
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <PriceTag amount={sitter.base_rate} size="sm" suffix="〜" />
          <Text style={styles.perHour}>/ 時間</Text>
        </View>
      </View>
      {sitter.bio && (
        <Text numberOfLines={2} style={styles.bio}>
          {sitter.bio}
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.owner.bg },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: Colors.neutral.ink },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  tab: {
    flex: 1, paddingVertical: 12, alignItems: 'center',
    borderRadius: 12, backgroundColor: Colors.neutral.snow,
    borderWidth: 1, borderColor: Colors.neutral.fur,
  },
  tabActive: { backgroundColor: Colors.owner.primary, borderColor: Colors.owner.primary },
  tabText: { fontSize: 13, color: Colors.neutral.ink, fontWeight: '600' },
  tabTextActive: { color: 'white' },
  sortRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  sortChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999,
    borderWidth: 1, borderColor: Colors.neutral.fur, backgroundColor: Colors.neutral.snow,
  },
  sortChipActive: { borderColor: Colors.owner.primary, backgroundColor: '#FFF8E8' },
  sortText: { fontSize: 12, color: Colors.neutral.whisker },
  sortTextActive: { color: Colors.owner.primaryDark, fontWeight: '700' },
  sitterCard: { marginHorizontal: 16, marginBottom: 10 },
  sitterRow: { flexDirection: 'row', alignItems: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sitterName: { fontSize: 14, fontWeight: '700', color: Colors.neutral.ink },
  sitterArea: { fontSize: 11, color: Colors.neutral.whisker, marginTop: 2 },
  sitterMeta: { marginTop: 4 },
  perHour: { fontSize: 10, color: Colors.neutral.whisker, marginTop: 2 },
  bio: { fontSize: 12, color: Colors.neutral.whisker, marginTop: 8, lineHeight: 18 },
});
