import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Card, EmptyState, BookingStatusBadge, CatAvatar } from '@/components';
import { Colors } from '@/constants/colors';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/hooks/useAuthStore';

export default function SitterBookingsScreen() {
  const userId = useAuthStore((s) => s.session?.user?.id);
  const { data: bookings } = useQuery({
    queryKey: ['sitter-bookings', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await supabase
        .from('bookings')
        .select('*, owner:users!bookings_owner_id_fkey(display_name, avatar_url)')
        .eq('sitter_id', userId)
        .in('status', ['accepted', 'confirmed', 'completed'])
        .order('start_at', { ascending: false });
      return data ?? [];
    },
    enabled: !!userId,
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>予約一覧</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {!bookings || bookings.length === 0 ? (
          <EmptyState emoji="📅" title="まだ予約はありません" />
        ) : (
          bookings.map((b: any) => (
            <Card key={b.id} style={{ marginBottom: 10 }}>
              <View style={styles.row}>
                <CatAvatar uri={b.owner?.avatar_url} size="sm" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.name}>{b.owner?.display_name}</Text>
                  <Text style={styles.date}>
                    {new Date(b.start_at).toLocaleString('ja-JP', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </Text>
                </View>
                <BookingStatusBadge status={b.status} />
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
  row: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 14, fontWeight: '600', color: Colors.neutral.ink },
  date: { fontSize: 12, color: Colors.neutral.whisker, marginTop: 2 },
});
