import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Card, Button, EmptyState, Badge, CatAvatar } from '@/components';
import { Colors } from '@/constants/colors';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/hooks/useAuthStore';

type Tab = 'mine' | 'public';

export default function JournalScreen() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.session?.user?.id);
  const [tab, setTab] = useState<Tab>('mine');

  const { data: posts } = useQuery({
    queryKey: ['journal', tab, userId],
    queryFn: async () => {
      if (tab === 'mine' && !userId) return [];
      const base = supabase.from('journal_posts').select('*, cats(name, avatar_url)').is('deleted_at', null);
      const q =
        tab === 'mine'
          ? base.eq('author_id', userId).order('created_at', { ascending: false })
          : base.eq('visibility', 'public').order('created_at', { ascending: false }).limit(20);
      const { data } = await q;
      return data ?? [];
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ねこ日記 📸</Text>
        <Pressable onPress={() => router.push('/(owner)/journal/new')} style={styles.addBtn}>
          <Text style={styles.addBtnText}>＋ 投稿</Text>
        </Pressable>
      </View>

      <View style={styles.tabs}>
        <Pressable onPress={() => setTab('mine')} style={[styles.tab, tab === 'mine' && styles.tabActive]}>
          <Text style={[styles.tabText, tab === 'mine' && styles.tabTextActive]}>🐾 うちの子</Text>
        </Pressable>
        <Pressable onPress={() => setTab('public')} style={[styles.tab, tab === 'public' && styles.tabActive]}>
          <Text style={[styles.tabText, tab === 'public' && styles.tabTextActive]}>🌍 みんな</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!posts || posts.length === 0 ? (
          <EmptyState
            emoji="📸"
            title={tab === 'mine' ? 'まだ投稿がありません' : 'まだ誰も投稿していません'}
            message={tab === 'mine' ? '初めての日記をつけてみましょう' : 'あなたが最初の投稿者になりませんか？'}
            ctaLabel="投稿を作成"
            onCtaPress={() => router.push('/(owner)/journal/new')}
          />
        ) : (
          posts.map((post: any) => (
            <Card key={post.id} style={{ marginBottom: 12 }}>
              <View style={styles.postHeader}>
                <CatAvatar uri={post.cats?.avatar_url} size="sm" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.postAuthor}>{post.cats?.name ?? 'ねこ'}</Text>
                  <Text style={styles.postDate}>
                    {new Date(post.created_at).toLocaleDateString('ja-JP')}
                  </Text>
                </View>
                {post.visibility === 'private' && <Badge small>🔒 自分のみ</Badge>}
              </View>
              {post.text && <Text style={styles.postText}>{post.text}</Text>}
              <View style={styles.postMeta}>
                <Text style={styles.postMetaText}>❤️ {post.like_count}</Text>
                <Text style={styles.postMetaText}>💬 {post.comment_count}</Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.owner.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: Colors.neutral.ink },
  addBtn: {
    paddingHorizontal: 16, paddingVertical: 8, backgroundColor: Colors.owner.primary,
    borderRadius: 999,
  },
  addBtnText: { color: 'white', fontWeight: '700', fontSize: 13 },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  tab: {
    flex: 1, paddingVertical: 10, alignItems: 'center',
    borderRadius: 12, backgroundColor: Colors.neutral.snow,
    borderWidth: 1, borderColor: Colors.neutral.fur,
  },
  tabActive: { backgroundColor: Colors.owner.primary, borderColor: Colors.owner.primary },
  tabText: { fontSize: 13, color: Colors.neutral.ink, fontWeight: '600' },
  tabTextActive: { color: 'white' },
  content: { paddingHorizontal: 16, paddingBottom: 32 },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  postAuthor: { fontSize: 13, fontWeight: '700', color: Colors.neutral.ink },
  postDate: { fontSize: 11, color: Colors.neutral.whisker, marginTop: 2 },
  postText: { fontSize: 14, color: Colors.neutral.ink, lineHeight: 22, marginBottom: 8 },
  postMeta: { flexDirection: 'row', gap: 12, marginTop: 8 },
  postMetaText: { fontSize: 12, color: Colors.neutral.whisker },
});
