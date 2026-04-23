import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/hooks/useAuthStore';
import { Colors } from '@/constants/colors';

/**
 * アプリ起動時の振り分けロジック
 *
 * 1. 認証状態をチェック
 * 2. 未認証 → /(auth)/onboarding
 * 3. 認証済み & ロール未選択 → /(auth)/role-select
 * 4. 認証済み & 飼い主 → /(owner)/home
 * 5. 認証済み & シッター → /(sitter)/dashboard
 */
export default function IndexScreen() {
  const { session, setSession, initialized, setInitialized } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!initialized) {
    return (
      <View style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.owner.bg,
      }}>
        <Text style={{ fontSize: 48, marginBottom: 24 }}>🐾</Text>
        <ActivityIndicator size="large" color={Colors.owner.primary} />
        <Text style={{
          marginTop: 16,
          color: Colors.neutral.whisker,
          fontFamily: 'NotoSansJP-Regular',
        }}>
          Nekomews を起動中...
        </Text>
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  // TODO: ユーザーのロール・ロール選択状態で分岐
  return <Redirect href="/(owner)/home" />;
}
