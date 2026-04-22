import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button, Input } from '@/components';
import { Colors } from '@/constants/colors';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.includes('@')) {
      Alert.alert('入力エラー', 'メールアドレスを正しく入力してください');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'nekomews://reset-password',
    });
    setLoading(false);
    if (error) {
      Alert.alert('送信に失敗しました', error.message);
      return;
    }
    setSent(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>📬</Text>
        <Text style={styles.title}>パスワードの再設定</Text>
        <Text style={styles.subtitle}>
          登録済みのメールアドレスに再設定リンクをお送りします
        </Text>

        {sent ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>
              {email} にメールを送信しました 🐾{'\n\n'}
              届いたメールのリンクから再設定を進めてください。
            </Text>
            <Button onPress={() => router.replace('/(auth)/sign-in')} fullWidth style={{ marginTop: 20 }}>
              ログイン画面に戻る
            </Button>
          </View>
        ) : (
          <>
            <View style={{ marginTop: 28 }}>
              <Input
                label="メールアドレス"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <Button onPress={handleSubmit} loading={loading} fullWidth size="lg">
              再設定メールを送信
            </Button>
            <Button
              onPress={() => router.back()}
              variant="ghost"
              fullWidth
              style={{ marginTop: 8 }}
            >
              キャンセル
            </Button>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.owner.bg },
  content: { flex: 1, padding: 24, paddingTop: 48 },
  emoji: { fontSize: 56, textAlign: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.neutral.ink, textAlign: 'center' },
  subtitle: { fontSize: 13, color: Colors.neutral.whisker, textAlign: 'center', marginTop: 6, lineHeight: 20 },
  successBox: {
    marginTop: 28,
    padding: 20,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
  },
  successText: { fontSize: 14, color: Colors.neutral.ink, lineHeight: 22, textAlign: 'center' },
});
