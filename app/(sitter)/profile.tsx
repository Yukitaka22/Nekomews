import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card, Button, CatAvatar, Badge } from '@/components';
import { Colors } from '@/constants/colors';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/hooks/useAuthStore';

export default function SitterProfileScreen() {
  const router = useRouter();
  const { session, setMode } = useAuthStore();

  const handleSwitch = () => {
    setMode('owner');
    router.replace('/(owner)/home');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/sign-in');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.headerTitle}>マイページ（シッター）</Text>
        <Card elevated style={{ marginTop: 16, marginBottom: 14 }}>
          <View style={styles.row}>
            <CatAvatar size="lg" />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.name}>
                {session?.user?.user_metadata?.display_name ?? 'ゲスト'}
              </Text>
              <Text style={styles.email}>{session?.user?.email}</Text>
              <View style={{ marginTop: 6 }}>
                <Badge variant="warning" small>プロフィール未設定</Badge>
              </View>
            </View>
          </View>
        </Card>

        <Button onPress={() => {}} variant="secondary" mode="sitter" fullWidth>
          プロフィールを編集
        </Button>
        <Button onPress={() => {}} variant="secondary" mode="sitter" fullWidth style={{ marginTop: 10 }}>
          料金設定
        </Button>
        <Button onPress={() => {}} variant="secondary" mode="sitter" fullWidth style={{ marginTop: 10 }}>
          受付可能スケジュール
        </Button>
        <Button onPress={handleSwitch} variant="ghost" mode="sitter" fullWidth style={{ marginTop: 24 }}>
          🔄 飼い主モードに切り替え
        </Button>
        <Button onPress={handleSignOut} variant="ghost" fullWidth style={{ marginTop: 8 }}>
          ログアウト
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.sitter.bg },
  content: { padding: 16, paddingBottom: 32 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: Colors.neutral.ink },
  row: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 17, fontWeight: '700', color: Colors.neutral.ink },
  email: { fontSize: 12, color: Colors.neutral.whisker, marginTop: 2 },
});
