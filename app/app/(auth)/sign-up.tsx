import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { Button, Input } from '@/components';
import { Colors } from '@/constants/colors';
import { supabase } from '@/lib/supabase';

export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!email.includes('@')) e.email = 'メールアドレスを正しく入力してください';
    if (password.length < 8) e.password = 'パスワードは8文字以上にしてください';
    if (!displayName.trim()) e.displayName = 'お名前を入力してください';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });
    setLoading(false);
    if (error) {
      Alert.alert('サインアップに失敗しました', error.message);
      return;
    }
    Alert.alert(
      '確認メールを送りました',
      `${email} に確認メールを送信しました。メールのリンクをクリックして認証を完了してください。`,
      [{ text: 'OK', onPress: () => router.replace('/(auth)/sign-in') }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.emoji}>🐾</Text>
        <Text style={styles.title}>アカウントを作成</Text>
        <Text style={styles.subtitle}>Nekomews の世界へようこそ</Text>

        <View style={{ marginTop: 32 }}>
          <Input
            label="お名前"
            required
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="ねこ 太郎"
            error={errors.displayName}
            autoCapitalize="none"
          />
          <Input
            label="メールアドレス"
            required
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={errors.email}
          />
          <Input
            label="パスワード"
            required
            value={password}
            onChangeText={setPassword}
            placeholder="8文字以上"
            secureTextEntry
            autoCapitalize="none"
            error={errors.password}
            hint="8文字以上、英数字混在を推奨"
          />
        </View>

        <View style={{ marginTop: 8 }}>
          <Button onPress={handleSignUp} loading={loading} fullWidth size="lg">
            アカウントを作成
          </Button>
        </View>

        <Text style={styles.terms}>
          作成することで、
          <Text style={styles.link}>利用規約</Text>と
          <Text style={styles.link}>プライバシーポリシー</Text>に同意したものとみなします。
        </Text>

        <View style={styles.bottomText}>
          <Text style={styles.smallText}>すでにアカウントをお持ちの方は</Text>
          <Link href="/(auth)/sign-in" style={styles.linkBold}>
            {' '}ログイン
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.owner.bg },
  content: { padding: 24, paddingTop: 32, paddingBottom: 48 },
  emoji: { fontSize: 56, textAlign: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.neutral.ink, textAlign: 'center' },
  subtitle: { fontSize: 13, color: Colors.neutral.whisker, textAlign: 'center', marginTop: 6 },
  terms: { fontSize: 11, color: Colors.neutral.whisker, textAlign: 'center', marginTop: 16, lineHeight: 18 },
  link: { color: Colors.owner.primaryDark, textDecorationLine: 'underline' },
  bottomText: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, alignItems: 'center' },
  smallText: { fontSize: 13, color: Colors.neutral.whisker },
  linkBold: { fontSize: 13, color: Colors.owner.primaryDark, fontWeight: '700' },
});
