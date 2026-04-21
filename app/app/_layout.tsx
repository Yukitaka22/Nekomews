import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient } from '@/lib/query-client';
import '../../global.css';

// スプラッシュは手動で制御
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'NotoSansJP-Regular': require('../../assets/fonts/NotoSansJP-Regular.ttf'),
    'NotoSansJP-Medium': require('../../assets/fonts/NotoSansJP-Medium.ttf'),
    'NotoSansJP-Bold': require('../../assets/fonts/NotoSansJP-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(owner)" />
          <Stack.Screen name="(sitter)" />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
