import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Input, Card, CatAvatar } from '@/components';
import { Colors } from '@/constants/colors';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/hooks/useAuthStore';

type Gender = 'male' | 'female' | 'unknown';

const BREEDS = [
  'スコティッシュフォールド', 'マンチカン', 'アメリカンショートヘア',
  'ブリティッシュショートヘア', 'ペルシャ', 'ラグドール', 'ノルウェージャンフォレスト',
  'ロシアンブルー', 'ベンガル', 'メインクーン', '雑種', '保護猫',
];

const PERSONALITIES = [
  '甘えん坊', '人見知り', '活発', 'のんびり', '食いしん坊', '警戒心強め',
  '遊び好き', 'ビビり', '人懐っこい', 'マイペース', 'やんちゃ', 'おとなしい',
];

export default function NewCatScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.session?.user?.id);

  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState<Gender>('unknown');
  const [tags, setTags] = useState<string[]>([]);

  const toggleTag = (t: string) =>
    setTags((curr) => (curr.includes(t) ? curr.filter((x) => x !== t) : [...curr, t]));

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('ログインが必要です');
      if (!name.trim()) throw new Error('名前を入力してください');
      const { data, error } = await supabase
        .from('cats')
        .insert({
          owner_id: userId,
          name: name.trim(),
          breed: breed || null,
          gender,
          personality_tags: tags,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cats'] });
      Alert.alert('登録完了', 'うちの子が追加されました 🐾', [
        { text: 'OK', onPress: () => router.replace('/(owner)/home') },
      ]);
    },
    onError: (err: any) => Alert.alert('登録に失敗しました', err.message),
  });

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: '猫を登録', headerBackTitle: '戻る' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.avatarSection}>
          <CatAvatar name={name} size="xl" />
          <Text style={styles.avatarHint}>※ 写真は後から追加できます</Text>
        </View>

        <Input label="お名前" required value={name} onChangeText={setName} placeholder="例：モモ" />

        {/* 猫種 */}
        <Text style={styles.fieldLabel}>猫種</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          <View style={styles.chipRow}>
            {BREEDS.map((b) => (
              <Pressable
                key={b}
                onPress={() => setBreed(b === breed ? '' : b)}
                style={[styles.chip, breed === b && styles.chipSelected]}
              >
                <Text style={[styles.chipText, breed === b && styles.chipTextSelected]}>{b}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* 性別 */}
        <Text style={styles.fieldLabel}>性別</Text>
        <View style={styles.genderRow}>
          {(['male', 'female', 'unknown'] as Gender[]).map((g) => (
            <Pressable
              key={g}
              onPress={() => setGender(g)}
              style={[styles.genderCard, gender === g && styles.genderCardSelected]}
            >
              <Text style={styles.genderEmoji}>{g === 'male' ? '♂️' : g === 'female' ? '♀️' : '?'}</Text>
              <Text style={[styles.genderText, gender === g && styles.genderTextSelected]}>
                {g === 'male' ? 'オス' : g === 'female' ? 'メス' : 'わからない'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* 性格タグ */}
        <Text style={styles.fieldLabel}>性格（複数選択可）</Text>
        <View style={styles.tagRow}>
          {PERSONALITIES.map((t) => (
            <Pressable
              key={t}
              onPress={() => toggleTag(t)}
              style={[styles.chip, tags.includes(t) && styles.chipSelected]}
            >
              <Text style={[styles.chipText, tags.includes(t) && styles.chipTextSelected]}>#{t}</Text>
            </Pressable>
          ))}
        </View>

        <Button onPress={() => mutate()} loading={isPending} fullWidth size="lg" style={{ marginTop: 32 }}>
          登録する
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.owner.bg },
  content: { padding: 20, paddingBottom: 48 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatarHint: { fontSize: 11, color: Colors.neutral.whisker, marginTop: 8 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.neutral.ink, marginBottom: 8 },
  chipRow: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    backgroundColor: Colors.neutral.snow, borderWidth: 1, borderColor: Colors.neutral.fur,
  },
  chipSelected: { backgroundColor: Colors.owner.primary, borderColor: Colors.owner.primary },
  chipText: { fontSize: 12, color: Colors.neutral.ink },
  chipTextSelected: { color: 'white', fontWeight: '600' },
  genderRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  genderCard: {
    flex: 1, padding: 16, borderRadius: 12, alignItems: 'center',
    backgroundColor: Colors.neutral.snow, borderWidth: 1, borderColor: Colors.neutral.fur,
  },
  genderCardSelected: { backgroundColor: '#FFF8E8', borderColor: Colors.owner.primary, borderWidth: 2 },
  genderEmoji: { fontSize: 28, marginBottom: 4 },
  genderText: { fontSize: 12, color: Colors.neutral.whisker },
  genderTextSelected: { color: Colors.owner.primaryDark, fontWeight: '700' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
