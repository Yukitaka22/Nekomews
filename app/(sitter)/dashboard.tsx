import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Card, Button, Badge } from '@/components';
import { Colors } from '@/constants/colors';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/hooks/useAuthStore';

export default function SitterDashboardScreen() {
  const userId = useAuthStore((s) => s.session?.user?.id);
  const [accepting, setAccepting] = useState(true);

  const { data: profile } = useQuery({
    queryKey: ['sitter-profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase.from('sitter_profiles').select('*').eq('user_id', userId).maybeSingle();
      return data;
    },
    enabled: !!userId,
  });

  const { data: pendingRequests } = useQuery({
    queryKey: ['pending-requests', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await supabase
        .from('bookings')
        .select('id')
        .eq('sitter_id', userId)
        .eq('status', 'requested');
      return data ?? [];
    },
    enabled: !!userId,
  });

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.bigTitle}>Nekomewsのシッターになりませんか？</Text>
          <Text style={styles.subtitle}>
            猫のお世話をお仕事に。{'\n'}
            審査制で安心のプラットフォームです。
          </Text>
          <Card elevated style={{ marginTop: 24 }}>
            <Text style={styles.benefitTitle}>シッターになるメリット</Text>
            <Text style={styles.benefit}>🐾 副業収入が得られる</Text>
            <Text style={styles.benefit}>🛡️ プラットフォーム保険で万一も安心</Text>
            <Text style={styles.benefit}>⭐ レビューで信頼を積み上げられる</Text>
            <Text style={styles.benefit}>📅 自分のペースで受付ON/OFF</Text>
          </Card>
          <Button
            onPress={() => {/* router.push('/(sitter)/apply') */}}
            mode="sitter"
            fullWidth
            size="lg"
            style={{ marginTop: 24 }}
          >
            シッター申請をはじめる
          </Button>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const statusLabel: Record<string, { label: string; variant: any }> = {
    draft: { label: '未申請', variant: 'default' },
    under_review: { label: '審査中', variant: 'warning' },
    active: { label: '公開中', variant: 'success' },
    paused: { label: '受付停止', variant: 'default' },
    suspended: { label: '利用停止', variant: 'error' },
    rejected: { label: '審査不通過', variant: 'error' },
  };
  const status = statusLabel[profile.acceptance_status] ?? statusLabel.draft;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.bigTitle}>シッターダッシュボード</Text>

        <Card elevated style={{ marginTop: 16, marginBottom: 14 }}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>現在のステータス</Text>
            <Badge variant={status.variant}>{status.label}</Badge>
          </View>
          <View style={styles.acceptRow}>
            <Text style={styles.acceptLabel}>新規依頼の受付</Text>
            <Switch
              value={accepting}
              onValueChange={setAccepting}
              trackColor={{ true: Colors.sitter.primary, false: Colors.neutral.fur }}
            />
          </View>
        </Card>

        <View style={styles.kpiRow}>
          <KPICard label="新着依頼" value={String(pendingRequests?.length ?? 0)} emoji="📬" />
          <KPICard label="今月の予約" value="0" emoji="📅" />
          <KPICard label="今月の収入" value="¥0" emoji="💰" />
        </View>

        <Card style={{ marginTop: 16 }}>
          <Text style={styles.sectionTitle}>今日のTips</Text>
          <Text style={styles.tip}>
            🐾 プロフィールの充実度が高いと依頼が増えます。自己紹介・写真・料金表を更新してみましょう。
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function KPICard({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  return (
    <View style={styles.kpiCard}>
      <Text style={{ fontSize: 24 }}>{emoji}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.sitter.bg },
  content: { padding: 16, paddingBottom: 32 },
  bigTitle: { fontSize: 24, fontWeight: '700', color: Colors.neutral.ink, marginTop: 4 },
  subtitle: { fontSize: 14, color: Colors.neutral.whisker, lineHeight: 22, marginTop: 8 },
  benefitTitle: { fontSize: 14, fontWeight: '700', color: Colors.neutral.ink, marginBottom: 12 },
  benefit: { fontSize: 14, color: Colors.neutral.ink, marginVertical: 4 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusLabel: { fontSize: 13, color: Colors.neutral.whisker },
  acceptRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.neutral.fur,
  },
  acceptLabel: { fontSize: 14, fontWeight: '600', color: Colors.neutral.ink },
  kpiRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  kpiCard: {
    flex: 1, padding: 14, alignItems: 'center',
    backgroundColor: Colors.neutral.snow, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.neutral.fur,
  },
  kpiValue: { fontSize: 18, fontWeight: '700', color: Colors.neutral.ink, marginTop: 4 },
  kpiLabel: { fontSize: 10, color: Colors.neutral.whisker, marginTop: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.neutral.ink, marginBottom: 8 },
  tip: { fontSize: 13, color: Colors.neutral.ink, lineHeight: 20 },
});
