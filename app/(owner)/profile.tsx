import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button, Card, CatAvatar } from '@/components';
import { Colors } from '@/constants/colors';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/hooks/useAuthStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { session, setMode, currentMode } = useAuthStore();
  const user = session?.user;

  const handleSignOut = async () => {
    Alert.alert('ログアウトしますか？', '', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: 'ログアウト',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/(auth)/sign-in');
        },
      },
    ]);
  };

  const handleSwitchMode = () => {
    const nextMode = currentMode === 'owner' ? 'sitter' : 'owner';
    Alert.alert(
      `${nextMode === 'owner' ? '飼い主' : 'シッター'}モードに切り替えますか？`,
      '',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '切り替え',
          onPress: () => {
            setMode(nextMode);
            router.replace(nextMode === 'owner' ? '/(owner)/home' : '/(sitter)/dashboard');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>マイページ</Text>
        </View>

        <Card elevated style={styles.profileCard}>
          <View style={styles.profileRow}>
            <CatAvatar size="lg" />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.name}>
                {user?.user_metadata?.display_name ?? 'ゲスト'}
              </Text>
              <Text style={styles.email}>{user?.email ?? '—'}</Text>
            </View>
          </View>
        </Card>

        {/* モード切替 */}
        <MenuItem
          emoji="🔄"
          title="シッターモードに切り替える"
          subtitle="シッターとして活動したい場合"
          onPress={handleSwitchMode}
        />

        {/* 各種メニュー */}
        <Text style={styles.sectionTitle}>アカウント</Text>
        <MenuItem emoji="💳" title="決済方法" onPress={() => {}} />
        <MenuItem emoji="📄" title="領収書一覧" onPress={() => {}} />
        <MenuItem emoji="🔔" title="通知設定" onPress={() => {}} />

        <Text style={styles.sectionTitle}>サポート</Text>
        <MenuItem emoji="❓" title="ヘルプ・よくある質問" onPress={() => {}} />
        <MenuItem emoji="✉️" title="お問い合わせ" onPress={() => {}} />
        <MenuItem emoji="📜" title="利用規約" onPress={() => {}} />
        <MenuItem emoji="🔒" title="プライバシーポリシー" onPress={() => {}} />

        <View style={{ marginTop: 32 }}>
          <Button onPress={handleSignOut} variant="ghost" fullWidth>
            ログアウト
          </Button>
        </View>
        <Text style={styles.version}>Nekomews v0.1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({
  emoji, title, subtitle, onPress,
}: { emoji: string; title: string; subtitle?: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.menuItem}>
      <Text style={styles.menuEmoji}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSub}>{subtitle}</Text>}
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.owner.bg },
  content: { padding: 16, paddingBottom: 48 },
  header: { marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: Colors.neutral.ink },
  profileCard: { marginBottom: 20 },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 17, fontWeight: '700', color: Colors.neutral.ink },
  email: { fontSize: 12, color: Colors.neutral.whisker, marginTop: 2 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.neutral.whisker, marginTop: 20, marginBottom: 8, marginLeft: 4 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, backgroundColor: Colors.neutral.snow,
    borderRadius: 12, marginBottom: 8,
  },
  menuEmoji: { fontSize: 22 },
  menuTitle: { fontSize: 14, fontWeight: '600', color: Colors.neutral.ink },
  menuSub: { fontSize: 11, color: Colors.neutral.whisker, marginTop: 2 },
  chevron: { fontSize: 22, color: Colors.neutral.whisker },
  version: { fontSize: 11, color: Colors.neutral.whisker, textAlign: 'center', marginTop: 24 },
});
