import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { Button, Input } from '@/components';
import { Colors } from '@/constants/colors';
import { supabase } from '@/lib/supabase';

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('入力エラー', 'メールアドレスとパスワードを入力してください');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      Alert.alert('ログインに失敗しました', error.message);
      return;
    }
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.emoji}>🐾</Text>
        <Text style={styles.title}>おかえりなさい</Text>
        <Text style={styles.subtitle}>ログインして、猫との暮らしを続けましょう</Text>

        <View style={{ marginTop: 32 }}>
          <Input
            label="メールアドレス"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Input
            label="パスワード"
            value={password}
            onChangeText={setPassword}
            placeholder="パスワード"
            secureTextEntry
            autoCapitalize="none"
          />
          <Link href="/(auth)/forgot-password" style={styles.forgot}>
            パスワードを忘れた方
          </Link>
        </View>

        <View style={{ marginTop: 16 }}>
          <Button onPress={handleSignIn} loading={loading} fullWidth size="lg">
            ログイン
          </Button>
        </View>

        <View style={styles.bottomText}>
          <Text style={styles.smallText}>アカウントがない方は</Text>
          <Link href="/(auth)/sign-up" style={styles.linkBold}>
            {' '}新規登録
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.owner.bg },
  content: { padding: 24, paddingTop: 48, paddingBottom: 48 },
  emoji: { fontSize: 56, textAlign: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.neutral.ink, textAlign: 'center' },
  subtitle: { fontSize: 13, color: Colors.neutral.whisker, textAlign: 'center', marginTop: 6 },
  forgot: {
    fontSize: 13,
    color: Colors.owner.primaryDark,
    textAlign: 'right',
    marginTop: -8,
    marginBottom: 8,
    fontWeight: '600',
  },
  bottomText: { flexDirection: 'row', justifyContent: 'center', marginTop: 28, alignItems: 'center' },
  smallText: { fontSize: 13, color: Colors.neutral.whisker },
  linkBold: { fontSize: 13, color: Colors.owner.primaryDark, fontWeight: '700' },
});
