import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Button, EmptyState, CatAvatar, BookingStatusBadge } from '@/components';
import { Colors } from '@/constants/colors';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/hooks/useAuthStore';

export default function SitterRequestsScreen() {
  const userId = useAuthStore((s) => s.session?.user?.id);
  const qc = useQueryClient();

  const { data: requests } = useQuery({
    queryKey: ['sitter-requests', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await supabase
        .from('bookings')
        .select('*, owner:users!bookings_owner_id_fkey(display_name, avatar_url)')
        .eq('sitter_id', userId)
        .eq('status', 'requested')
        .order('created_at', { ascending: false });
      return data ?? [];
    },
    enabled: !!userId,
  });

  const { mutate: respond } = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'accept' | 'decline' }) => {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: action === 'accept' ? 'accepted' : 'declined',
          cancelled_at: action === 'decline' ? new Date().toISOString() : null,
          cancelled_by: action === 'decline' ? userId : null,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sitter-requests'] }),
    onError: (e: any) => Alert.alert('エラー', e.message),
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>新着依頼</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {!requests || requests.length === 0 ? (
          <EmptyState emoji="📬" title="新着依頼はありません" message="受付中のプロフィールを充実させると依頼が増えます" />
        ) : (
          requests.map((r: any) => (
            <Card key={r.id} style={{ marginBottom: 12 }}>
              <View style={styles.topRow}>
                <CatAvatar uri={r.owner?.avatar_url} size="sm" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.ownerName}>{r.owner?.display_name ?? '—'}</Text>
                  <Text style={styles.dateText}>
                    {new Date(r.start_at).toLocaleString('ja-JP', {
                      month: 'long', day: 'numeric', weekday: 'short',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </Text>
                </View>
                <BookingStatusBadge status={r.status} />
              </View>
              {r.notes && <Text style={styles.notes}>{r.notes}</Text>}
              <Text style={styles.amount}>
                ¥{Number(r.total_amount).toLocaleString('ja-JP')}
              </Text>
              <View style={styles.actions}>
                <Button
                  onPress={() => respond({ id: r.id, action: 'decline' })}
                  variant="secondary"
                  mode="sitter"
                  size="sm"
                >
                  辞退
                </Button>
                <Button
                  onPress={() => respond({ id: r.id, action: 'accept' })}
                  mode="sitter"
                  size="sm"
                >
                  承諾する
                </Button>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.sitter.bg },
  header: { padding: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: Colors.neutral.ink },
  content: { padding: 16, paddingBottom: 32 },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  ownerName: { fontSize: 14, fontWeight: '700', color: Colors.neutral.ink },
  dateText: { fontSize: 12, color: Colors.neutral.whisker, marginTop: 2 },
  notes: { fontSize: 13, color: Colors.neutral.ink, lineHeight: 20, marginVertical: 8 },
  amount: { fontSize: 15, fontWeight: '700', color: Colors.sitter.primaryDark, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 14, justifyContent: 'flex-end' },
});
