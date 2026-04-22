import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Input, Badge, CatAvatar } from '@/components';
import { Colors } from '@/constants/colors';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/hooks/useAuthStore';

type ServiceType = 'visit' | 'boarding';

export default function NewBookingScreen() {
  const { sitter_id } = useLocalSearchParams<{ sitter_id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.session?.user?.id);

  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [serviceType, setServiceType] = useState<ServiceType>('visit');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [notes, setNotes] = useState('');
  const [insuranceOptIn, setInsuranceOptIn] = useState(true);

  const { data: cats } = useQuery({
    queryKey: ['cats', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await supabase
        .from('cats')
        .select('*')
        .eq('owner_id', userId)
        .is('deleted_at', null);
      return data ?? [];
    },
    enabled: !!userId,
  });

  const { data: sitter } = useQuery({
    queryKey: ['sitter', sitter_id],
    queryFn: async () => {
      const { data } = await supabase
        .from('sitter_profiles')
        .select('*')
        .eq('user_id', sitter_id)
        .single();
      return data;
    },
    enabled: !!sitter_id,
  });

  const estimate = useMemo(() => {
    if (!sitter || !startAt || !endAt) return null;
    const hours = Math.max(
      1,
      (new Date(endAt).getTime() - new Date(startAt).getTime()) / (1000 * 60 * 60)
    );
    const base = Math.round(sitter.base_rate * hours);
    const insurance = insuranceOptIn ? 200 : 0;
    const platformFeeRate = 0.15;
    const subtotal = base + insurance;
    const platform = Math.round(subtotal * platformFeeRate);
    const total = subtotal + platform;
    return { hours, base, insurance, platform, total };
  }, [sitter, startAt, endAt, insuranceOptIn]);

  const { mutate: createBooking, isPending } = useMutation({
    mutationFn: async () => {
      if (!userId || !sitter_id) throw new Error('認証エラー');
      if (selectedCats.length === 0) throw new Error('猫を1匹以上選んでください');
      if (!startAt || !endAt) throw new Error('日程を入力してください');
      if (!estimate) throw new Error('見積もりが計算できません');

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          owner_id: userId,
          sitter_id,
          cat_ids: selectedCats,
          start_at: new Date(startAt).toISOString(),
          end_at: new Date(endAt).toISOString(),
          service_type: serviceType,
          base_fee: estimate.base,
          insurance_fee: estimate.insurance,
          platform_fee: estimate.platform,
          total_amount: estimate.total,
          notes: notes || null,
          status: 'requested',
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcoming-bookings'] });
      Alert.alert(
        '依頼を送信しました 🐾',
        'シッターの承諾をお待ちください。承諾されたら通知が届きます。',
        [{ text: 'OK', onPress: () => router.replace('/(owner)/home') }]
      );
    },
    onError: (e: any) => Alert.alert('送信に失敗しました', e.message),
  });

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: '予約の依頼', headerBackTitle: '戻る' }} />
      <ScrollView contentContainerStyle={styles.content}>
        {/* 猫選択 */}
        <Text style={styles.sectionTitle}>どの子を預けますか？</Text>
        <View style={styles.catRow}>
          {cats?.map((cat: any) => {
            const selected = selectedCats.includes(cat.id);
            return (
              <Pressable
                key={cat.id}
                onPress={() => setSelectedCats((s) =>
                  selected ? s.filter((id) => id !== cat.id) : [...s, cat.id]
                )}
                style={[styles.catChip, selected && styles.catChipSelected]}
              >
                <CatAvatar uri={cat.avatar_url} size="sm" />
                <Text style={[styles.catName, selected && { color: 'white' }]}>{cat.name}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* サービス種別 */}
        <Text style={styles.sectionTitle}>サービス</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          <ServiceCard
            selected={serviceType === 'visit'}
            onPress={() => setServiceType('visit')}
            emoji="🏠"
            label="自宅訪問"
          />
          <ServiceCard
            selected={serviceType === 'boarding'}
            onPress={() => setServiceType('boarding')}
            emoji="🛏️"
            label="預かり"
          />
        </View>

        {/* 日時（簡易版：テキスト入力） */}
        <Text style={styles.sectionTitle}>日時</Text>
        <Input
          label="開始日時"
          value={startAt}
          onChangeText={setStartAt}
          placeholder="例: 2026-05-01 10:00"
        />
        <Input
          label="終了日時"
          value={endAt}
          onChangeText={setEndAt}
          placeholder="例: 2026-05-01 12:00"
        />

        {/* 要望メモ */}
        <Input
          label="シッターへのメッセージ（任意）"
          value={notes}
          onChangeText={setNotes}
          placeholder="お世話の内容でお伝えしたいこと"
          multiline
          numberOfLines={4}
        />

        {/* 保険オプション */}
        <Pressable
          onPress={() => setInsuranceOptIn(!insuranceOptIn)}
          style={[styles.insuranceCard, insuranceOptIn && styles.insuranceSelected]}
        >
          <View style={styles.checkbox}>
            {insuranceOptIn && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.insuranceTitle}>
              🛡️ ペット一時預かり保険を付ける（+200円）
            </Text>
            <Text style={styles.insuranceDesc}>
              万一のとき、通院・手術費用を補償します
            </Text>
          </View>
        </Pressable>

        {/* 見積もり */}
        {estimate && (
          <Card style={{ marginTop: 20 }}>
            <Text style={styles.sectionTitle}>見積もり</Text>
            <EstimateRow label={`基本料金（${estimate.hours}時間）`} amount={estimate.base} />
            {estimate.insurance > 0 && <EstimateRow label="保険料" amount={estimate.insurance} />}
            <EstimateRow label="プラットフォーム手数料" amount={estimate.platform} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>合計</Text>
              <Text style={styles.totalAmount}>¥{estimate.total.toLocaleString('ja-JP')}</Text>
            </View>
          </Card>
        )}

        <Button
          onPress={() => createBooking()}
          loading={isPending}
          fullWidth
          size="lg"
          style={{ marginTop: 24 }}
        >
          依頼を送信
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

function ServiceCard({
  selected, onPress, emoji, label,
}: { selected: boolean; onPress: () => void; emoji: string; label: string }) {
  return (
    <Pressable onPress={onPress} style={[styles.serviceCard, selected && styles.serviceCardSelected]}>
      <Text style={{ fontSize: 28 }}>{emoji}</Text>
      <Text style={[styles.serviceLabel, selected && { color: Colors.owner.primaryDark, fontWeight: '700' }]}>
        {label}
      </Text>
    </Pressable>
  );
}

function EstimateRow({ label, amount }: { label: string; amount: number }) {
  return (
    <View style={styles.estimateRow}>
      <Text style={styles.estimateLabel}>{label}</Text>
      <Text style={styles.estimateAmount}>¥{amount.toLocaleString('ja-JP')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.owner.bg },
  content: { padding: 16, paddingBottom: 48 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.neutral.ink, marginBottom: 10, marginTop: 6 },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 999, borderWidth: 1, borderColor: Colors.neutral.fur,
    backgroundColor: Colors.neutral.snow,
  },
  catChipSelected: { backgroundColor: Colors.owner.primary, borderColor: Colors.owner.primary },
  catName: { fontSize: 13, fontWeight: '600', color: Colors.neutral.ink },
  serviceCard: {
    flex: 1, padding: 20, borderRadius: 12, alignItems: 'center',
    backgroundColor: Colors.neutral.snow, borderWidth: 1, borderColor: Colors.neutral.fur,
    gap: 6,
  },
  serviceCardSelected: { backgroundColor: '#FFF8E8', borderColor: Colors.owner.primary, borderWidth: 2 },
  serviceLabel: { fontSize: 13, color: Colors.neutral.whisker },
  insuranceCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 12, backgroundColor: Colors.neutral.snow,
    borderWidth: 1, borderColor: Colors.neutral.fur, marginTop: 4,
  },
  insuranceSelected: { backgroundColor: '#FFF8E8', borderColor: Colors.owner.primary },
  checkbox: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2,
    borderColor: Colors.owner.primary, backgroundColor: Colors.owner.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  checkmark: { color: 'white', fontSize: 14, fontWeight: '700' },
  insuranceTitle: { fontSize: 13, fontWeight: '700', color: Colors.neutral.ink },
  insuranceDesc: { fontSize: 11, color: Colors.neutral.whisker, marginTop: 2 },
  estimateRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  estimateLabel: { fontSize: 13, color: Colors.neutral.whisker },
  estimateAmount: { fontSize: 13, color: Colors.neutral.ink },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingTop: 12, marginTop: 8, borderTopWidth: 1, borderTopColor: Colors.neutral.fur,
  },
  totalLabel: { fontSize: 15, fontWeight: '700', color: Colors.neutral.ink },
  totalAmount: { fontSize: 20, fontWeight: '700', color: Colors.owner.primaryDark },
});
