import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '@/components';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/hooks/useAuthStore';

type Role = 'owner' | 'sitter';

export default function RoleSelectScreen() {
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const setMode = useAuthStore((s) => s.setMode);

  const handleContinue = () => {
    if (!role) return;
    setMode(role);
    router.replace('/(auth)/sign-up');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>ようこそ 🐾</Text>
        <Text style={styles.subtitle}>
          あなたは、どちらでNekomewsを使いますか？{'\n'}
          <Text style={styles.dim}>（後で切り替えることも可能です）</Text>
        </Text>

        <View style={styles.cards}>
          <RoleCard
            emoji="🏠"
            title="飼い主として使う"
            description="シッターを探す・日記をつける・保護猫を探すなど"
            selected={role === 'owner'}
            onPress={() => setRole('owner')}
            color={Colors.owner.primary}
          />
          <RoleCard
            emoji="🧑‍⚕️"
            title="シッターとして使う"
            description="猫のお世話を仕事として提供する"
            selected={role === 'sitter'}
            onPress={() => setRole('sitter')}
            color={Colors.sitter.primary}
          />
        </View>

        <View style={styles.bottom}>
          <Button onPress={handleContinue} disabled={!role} fullWidth size="lg" mode={role ?? 'owner'}>
            次へ
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

function RoleCard({
  emoji,
  title,
  description,
  selected,
  onPress,
  color,
}: {
  emoji: string;
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
  color: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, selected && { borderColor: color, borderWidth: 2, backgroundColor: '#FFF8E8' }]}
    >
      <Text style={styles.cardEmoji}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDesc}>{description}</Text>
      </View>
      <View
        style={[
          styles.radio,
          selected && { borderColor: color, backgroundColor: color },
        ]}
      >
        {selected && <Text style={styles.check}>✓</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.owner.bg },
  content: { flex: 1, padding: 24, paddingTop: 32 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.neutral.ink, marginBottom: 8 },
  subtitle: { fontSize: 14, color: Colors.neutral.whisker, lineHeight: 22, marginBottom: 32 },
  dim: { color: Colors.neutral.whisker, fontSize: 12 },
  cards: { gap: 14, flex: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    backgroundColor: Colors.neutral.snow,
    borderWidth: 1,
    borderColor: Colors.neutral.fur,
    gap: 14,
  },
  cardEmoji: { fontSize: 40 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.neutral.ink, marginBottom: 4 },
  cardDesc: { fontSize: 12, color: Colors.neutral.whisker, lineHeight: 18 },
  radio: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: Colors.neutral.fur,
    alignItems: 'center', justifyContent: 'center',
  },
  check: { color: 'white', fontSize: 13, fontWeight: '700' },
  bottom: { paddingTop: 20 },
});
