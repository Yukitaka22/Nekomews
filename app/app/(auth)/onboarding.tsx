import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '@/components';
import { Colors } from '@/constants/colors';

const { width } = Dimensions.get('window');

type Slide = { emoji: string; title: string; body: string };

const slides: Slide[] = [
  {
    emoji: '🐾',
    title: 'ようこそ、Nekomewsへ',
    body: '猫と、もっと近く。\nあなたと猫の新しい暮らしが、ここから始まります。',
  },
  {
    emoji: '🤝',
    title: '信頼できるシッターに出会う',
    body: '近所の猫専門シッターを、レビューと料金を見比べて選べます。',
  },
  {
    emoji: '📸',
    title: 'うちの子の毎日を残す',
    body: '写真で成長記録をつけて、みんなに共有も自分だけの記録もできます。',
  },
  {
    emoji: '📅',
    title: '毎日のお世話を自動で',
    body: 'ごはん・猫砂・ワクチンのリマインドが自動で届きます。',
  },
  {
    emoji: '💛',
    title: '保護猫にもつながる',
    body: 'あなたが使うたびに、保護猫への支援にもつながります。',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(i);
  };

  const goNext = () => {
    if (index < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: (index + 1) * width, animated: true });
    } else {
      router.replace('/(auth)/role-select');
    }
  };

  const skip = () => router.replace('/(auth)/role-select');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text onPress={skip} style={styles.skip}>
          スキップ
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        {slides.map((slide, i) => (
          <View key={i} style={[styles.slide, { width }]}>
            <Text style={styles.emoji}>{slide.emoji}</Text>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.body}>{slide.body}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottom}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
        <Button onPress={goNext} fullWidth size="lg">
          {index < slides.length - 1 ? '次へ' : '始める'}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.owner.bg },
  topBar: { alignItems: 'flex-end', padding: 16 },
  skip: { fontSize: 14, color: Colors.neutral.whisker, padding: 8 },
  slide: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emoji: { fontSize: 88, marginBottom: 32 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.neutral.ink, textAlign: 'center', marginBottom: 12 },
  body: { fontSize: 15, color: Colors.neutral.whisker, textAlign: 'center', lineHeight: 24 },
  bottom: { padding: 24, paddingBottom: 32 },
  dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24, gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.neutral.fur },
  dotActive: { width: 24, backgroundColor: Colors.owner.primary },
});
