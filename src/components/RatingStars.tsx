import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

type RatingStarsProps = {
  rating: number; // 0〜5
  count?: number;
  size?: number;
  showScore?: boolean;
};

/**
 * 星評価表示
 * - 0.5刻み対応
 * - サイズカスタマイズ可
 * - レビュー件数表示オプション
 */
export function RatingStars({ rating, count, size = 14, showScore = true }: RatingStarsProps) {
  const clamped = Math.min(5, Math.max(0, rating));
  const stars: string[] = [];
  for (let i = 1; i <= 5; i++) {
    if (clamped >= i) stars.push('full');
    else if (clamped >= i - 0.5) stars.push('half');
    else stars.push('empty');
  }

  return (
    <View style={styles.row}>
      {stars.map((kind, i) => (
        <Text key={i} style={{ fontSize: size, color: kind !== 'empty' ? Colors.owner.primary : Colors.neutral.fur }}>
          {kind === 'half' ? '★' : kind === 'full' ? '★' : '☆'}
        </Text>
      ))}
      {showScore && (
        <Text style={[styles.score, { fontSize: size - 2 }]}>
          {clamped.toFixed(1)}
          {count !== undefined && <Text style={styles.count}> ({count})</Text>}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  score: { marginLeft: 6, color: Colors.neutral.ink, fontWeight: '600' },
  count: { color: Colors.neutral.whisker, fontWeight: '400' },
});
